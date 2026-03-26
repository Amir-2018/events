const pool = require('../db/pool');

class Event {
  static async create(eventData) {
    const { 
      nom, 
      date, 
      image, 
      adresse, 
      type_evenement_id, 
      bien_id 
    } = eventData;
    
    const query = `
      INSERT INTO events (nom, date, image, adresse, type_evenement_id, bien_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nom, 
      date || null, 
      image || null, 
      adresse || null, 
      type_evenement_id || null, 
      bien_id || null
    ]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        te.description as type_evenement_description,
        b.nom as bien_nom,
        b.type as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        te.description as type_evenement_description,
        b.nom as bien_nom,
        b.type as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude,
        b.horaire_ouverture as bien_horaire_ouverture,
        b.horaire_fermeture as bien_horaire_fermeture,
        b.jours_ouverture as bien_jours_ouverture
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      WHERE e.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, eventData) {
    const { 
      nom, 
      date, 
      image, 
      adresse, 
      type_evenement_id, 
      bien_id 
    } = eventData;
    
    const query = `
      UPDATE events 
      SET nom = $1, date = $2, image = $3, adresse = $4, 
          type_evenement_id = $5, bien_id = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nom, 
      date || null, 
      image || null, 
      adresse || null, 
      type_evenement_id || null, 
      bien_id || null, 
      id
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM events 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getEventClients(eventId) {
    const query = `
      SELECT 
        c.id,
        c.nom,
        c.prenom,
        c.email,
        c.tel,
        er.created_at as registration_date
      FROM event_registrations er
      JOIN clients c ON er.client_id = c.id
      WHERE er.event_id = $1
      ORDER BY er.created_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  static async registerClient(eventId, clientId) {
    const query = `
      INSERT INTO event_registrations (event_id, client_id, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (event_id, client_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(query, [eventId, clientId]);
    return result.rows[0];
  }

  static async unregisterClient(eventId, clientId) {
    const query = `
      DELETE FROM event_registrations 
      WHERE event_id = $1 AND client_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [eventId, clientId]);
    return result.rows[0];
  }

  // Méthodes de recherche et filtrage
  static async getByType(typeId) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        b.type as bien_type
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      WHERE e.type_evenement_id = $1
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query, [typeId]);
    return result.rows;
  }

  static async getByProperty(propertyId) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        b.type as bien_type
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      WHERE e.bien_id = $1
      ORDER BY e.created_at DESC
    `;
    
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async search(searchTerm) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        b.type as bien_type
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      WHERE 
        e.nom ILIKE $1 OR 
        e.adresse ILIKE $1 OR
        te.nom ILIKE $1 OR
        b.nom ILIKE $1
      ORDER BY e.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern]);
    return result.rows;
  }
}

module.exports = Event;