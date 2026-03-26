const crypto = require('crypto');
const pool = require('../db/pool');

class EventService {
  async getEventsWithClients() {
    const result = await pool.query(`
      SELECT
        e.id,
        e.nom,
        e.date,
        e.image,
        e.adresse,
        e.type_evenement_id,
        e.bien_id,
        e.created_at,
        e.updated_at,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        b.type as bien_type,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'nom', c.nom,
              'prenom', c.prenom,
              'email', c.email,
              'tel', c.tel
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS clients
      FROM events e
      LEFT JOIN types_evenements te ON te.id = e.type_evenement_id
      LEFT JOIN biens b ON b.id = e.bien_id
      LEFT JOIN event_registrations er ON er.event_id = e.id
      LEFT JOIN clients c ON c.id = er.client_id
      GROUP BY e.id, te.nom, b.nom, b.type
      ORDER BY e.date DESC NULLS LAST;
    `);

    return result.rows;
  }

  async getEventDetails({ eventId }) {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.nom,
        e.date,
        e.image,
        e.adresse,
        e.created_at,
        e.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'nom', c.nom,
              'prenom', c.prenom,
              'email', c.email,
              'tel', c.tel
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS clients
      FROM events e
      LEFT JOIN event_registrations er ON er.event_id = e.id
      LEFT JOIN clients c ON c.id = er.client_id
      WHERE e.id = $1
      GROUP BY e.id
      LIMIT 1;
      `,
      [eventId]
    );

    return result.rows[0] || null;
  }

  async getEventClients({ eventId }) {
    const result = await pool.query(
      `
      SELECT c.id, c.nom, c.prenom, c.email, c.tel
      FROM event_registrations er
      JOIN clients c ON c.id = er.client_id
      WHERE er.event_id = $1
      ORDER BY c.nom ASC, c.prenom ASC;
      `,
      [eventId]
    );

    return result.rows;
  }

  async createEvent({ nom, date, image, adresse, type_evenement_id, bien_id }) {
    if (!nom) throw new Error('Missing event name (nom)');

    const id = crypto.randomUUID();
    const result = await pool.query(
      `
      INSERT INTO events (id, nom, date, image, adresse, type_evenement_id, bien_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nom, date, image, adresse, type_evenement_id, bien_id, created_at, updated_at;
      `,
      [id, nom, date || null, image || null, adresse || null, type_evenement_id || null, bien_id || null]
    );

    return result.rows[0];
  }

  async deleteEvent({ eventId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM event_registrations WHERE event_id = $1', [eventId]);
      const del = await client.query(
        'DELETE FROM events WHERE id = $1 RETURNING id, nom, date, image, adresse',
        [eventId]
      );
      await client.query('COMMIT');
      return del.rows[0] || null;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  async registerClientToEvent({ eventId, clientId }) {
    const exists = await pool.query('SELECT 1 FROM events WHERE id = $1', [eventId]);
    if (exists.rowCount === 0) {
      throw new Error('Event not found');
    }

    const insert = await pool.query(
      `
      INSERT INTO event_registrations (event_id, client_id)
      VALUES ($1, $2)
      ON CONFLICT (event_id, client_id) DO NOTHING
      RETURNING event_id, client_id, created_at;
      `,
      [eventId, clientId]
    );

    if (insert.rowCount > 0) {
      return {
        registered: true,
        alreadyRegistered: false,
        registration: insert.rows[0],
      };
    }

    const existing = await pool.query(
      'SELECT event_id, client_id, created_at FROM event_registrations WHERE event_id = $1 AND client_id = $2',
      [eventId, clientId]
    );

    if (existing.rowCount > 0) {
      return {
        registered: true,
        alreadyRegistered: true,
        registration: existing.rows[0],
      };
    }

    return {
      registered: false,
      alreadyRegistered: false,
      registration: null,
    };
  }
}

module.exports = new EventService();
