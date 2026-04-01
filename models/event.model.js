const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class Event {
  static async create(eventData) {
    const { 
      nom,
      date,
      date_fin,
      image,
      adresse,
      type_evenement_id, 
      bien_id,
      max_participants,
      prix,
      user_id,
      is_private
    } = eventData;
    
    const id = uuidv4();
    const query = `
      INSERT INTO events (id, nom, date, date_fin, image, adresse, type_evenement_id, bien_id, max_participants, prix, user_id, is_private, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [
      id,
      nom, 
      date || null, 
      date_fin || null,
      image || null, 
      adresse || null, 
      type_evenement_id || null, 
      bien_id || null,
      max_participants || 0,
      prix || 0.00,
      user_id || null,
      is_private || false
    ]);
    
    return this.getById(id);
  }

  static async getAll(userId = null) {
    let query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        tb.nom as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude,
        COUNT(er.client_id) as current_participants
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
    `;
    
    const params = [];
    if (userId) {
      query += ` WHERE e.user_id = ? `;
      params.push(userId);
    }
    
    query += ` GROUP BY e.id ORDER BY e.date DESC, e.created_at DESC `;
    
    const result = await pool.query(query, params);
    const events = result.rows;
    
    // Pour chaque événement, récupérer les clients inscrits
    for (const event of events) {
      const clientsResult = await pool.query(`
        SELECT 
          c.id,
          c.nom,
          c.prenom,
          c.email,
          c.tel,
          er.created_at as registration_date
        FROM event_registrations er
        JOIN clients c ON er.client_id = c.id
        WHERE er.event_id = ?
        ORDER BY er.created_at DESC
      `, [event.id]);
      
      event.clients = clientsResult.rows;
    }
    
    return events;
  }

  static async getById(id) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        tb.nom as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude,
        b.horaire_ouverture as bien_horaire_ouverture,
        b.horaire_fermeture as bien_horaire_fermeture,
        b.jours_ouverture as bien_jours_ouverture,
        COUNT(er.client_id) as current_participants
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, eventData) {
    const { 
      nom, 
      date, 
      date_fin,
      image, 
      adresse, 
      type_evenement_id, 
      bien_id,
      max_participants,
      prix,
      is_private
    } = eventData;
    
    const query = `
      UPDATE events 
      SET nom = ?, date = ?, date_fin = ?, image = ?, adresse = ?, 
          type_evenement_id = ?, bien_id = ?, max_participants = ?, prix = ?, is_private = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await pool.query(query, [
      nom, 
      date || null, 
      date_fin || null,
      image || null, 
      adresse || null, 
      type_evenement_id || null, 
      bien_id || null, 
      max_participants || 0,
      prix || 0.00,
      is_private || false,
      id
    ]);
    return this.getById(id);
  }

  static async delete(id) {
    const event = await this.getById(id);
    if (!event) return null;

    const query = `DELETE FROM events WHERE id = ?`;
    await pool.query(query, [id]);
    return event;
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
      WHERE er.event_id = ?
      ORDER BY er.created_at DESC
    `;
    
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  static async registerClient(eventId, clientId) {
    const query = `
      INSERT INTO event_registrations (event_id, client_id, created_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE created_at = created_at
    `;
    
    await pool.query(query, [eventId, clientId]);
    return { event_id: eventId, client_id: clientId };
  }

  static async unregisterClient(eventId, clientId) {
    const registration = { event_id: eventId, client_id: clientId };
    const query = `
      DELETE FROM event_registrations 
      WHERE event_id = ? AND client_id = ?
    `;
    
    await pool.query(query, [eventId, clientId]);
    return registration;
  }

  static async getRegistrationsByClient(clientId) {
    const query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        b.type as bien_type,
        b.adresse as bien_adresse,
        tb.nom as type_bien_nom,
        (SELECT COUNT(*) FROM event_registrations er2 WHERE er2.event_id = e.id) as current_participants
      FROM events e
      INNER JOIN event_registrations er ON e.id = er.event_id
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      WHERE er.client_id = ?
      ORDER BY e.date ASC
    `;
    
    const result = await pool.query(query, [clientId]);
    return result.rows;
  }

  // Souvenirs methods
  static async addSouvenir(eventId, url, type) {
    const id = uuidv4();
    const query = `
      INSERT INTO event_souvenirs (id, event_id, url, type, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await pool.query(query, [id, eventId, url, type]);
    return { id, event_id: eventId, url, type };
  }

  static async getSouvenirs(eventId) {
    const query = `
      SELECT * FROM event_souvenirs
      WHERE event_id = ?
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  static async deleteSouvenir(souvenirId) {
    const query = `
      DELETE FROM event_souvenirs
      WHERE id = ?
    `;
    await pool.query(query, [souvenirId]);
    return { id: souvenirId };
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
      WHERE e.type_evenement_id = ?
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
      WHERE e.bien_id = ?
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
        e.nom LIKE ? OR 
        e.adresse LIKE ? OR
        te.nom LIKE ? OR
        b.nom LIKE ?
      ORDER BY e.created_at DESC
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, searchPattern, searchPattern, searchPattern]);
    return result.rows;
  }

  // Méthodes pour événements privés
  static async getPublicEvents(userId = null) {
    let query = `
      SELECT 
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        tb.nom as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude,
        COUNT(er.client_id) as current_participants
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.is_private = FALSE
    `;
    
    const params = [];
    if (userId) {
      query += ` OR e.user_id = ? `;
      params.push(userId);
    }
    
    query += ` GROUP BY e.id ORDER BY e.date DESC, e.created_at DESC `;
    
    const result = await pool.query(query, params);
    const events = result.rows;
    
    // Pour chaque événement, récupérer les clients inscrits
    for (const event of events) {
      const clientsResult = await pool.query(`
        SELECT 
          c.id,
          c.nom,
          c.prenom,
          c.email,
          c.tel,
          er.created_at as registration_date
        FROM event_registrations er
        JOIN clients c ON er.client_id = c.id
        WHERE er.event_id = ?
        ORDER BY er.created_at DESC
      `, [event.id]);
      
      event.clients = clientsResult.rows;
    }
    
    return events;
  }

  static async canClientAccessEvent(eventId, clientId) {
    // Vérifier si l'événement est public
    const event = await this.getById(eventId);
    if (!event) return false;
    if (!event.is_private) return true;
    
    // Si privé, vérifier si le client a une invitation acceptée
    const invitationQuery = `
      SELECT * FROM event_invitations 
      WHERE event_id = ? AND client_id = ? AND status = 'accepted'
    `;
    const result = await pool.query(invitationQuery, [eventId, clientId]);
    return result.rows.length > 0;
  }

  static async getAccessibleEvents(clientId) {
    const query = `
      SELECT DISTINCT
        e.*,
        te.nom as type_evenement_nom,
        b.nom as bien_nom,
        tb.nom as bien_type,
        b.adresse as bien_adresse,
        b.latitude as bien_latitude,
        b.longitude as bien_longitude,
        COUNT(er.client_id) as current_participants,
        ei.status as invitation_status
      FROM events e
      LEFT JOIN types_evenements te ON e.type_evenement_id = te.id
      LEFT JOIN biens b ON e.bien_id = b.id
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      LEFT JOIN event_invitations ei ON e.id = ei.event_id AND ei.client_id = ?
      WHERE 
        e.is_private = FALSE 
        OR (e.is_private = TRUE AND ei.status = 'accepted')
      GROUP BY e.id 
      ORDER BY e.date DESC, e.created_at DESC
    `;
    
    const result = await pool.query(query, [clientId]);
    const events = result.rows;
    
    // Pour chaque événement, récupérer les clients inscrits
    for (const event of events) {
      const clientsResult = await pool.query(`
        SELECT 
          c.id,
          c.nom,
          c.prenom,
          c.email,
          c.tel,
          er.created_at as registration_date
        FROM event_registrations er
        JOIN clients c ON er.client_id = c.id
        WHERE er.event_id = ?
        ORDER BY er.created_at DESC
      `, [event.id]);
      
      event.clients = clientsResult.rows;
    }
    
    return events;
  }
}

module.exports = Event;