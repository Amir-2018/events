const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class Ticket {
  static async create(ticketData) {
    const { 
      event_id,
      client_id,
      ticket_number,
      qr_code_data,
      status = 'active'
    } = ticketData;
    
    const id = uuidv4();
    const query = `
      INSERT INTO tickets (id, event_id, client_id, ticket_number, qr_code_data, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [
      id,
      event_id,
      client_id,
      ticket_number,
      qr_code_data,
      status
    ]);
    
    return this.getById(id);
  }

  static async getById(id) {
    const query = `
      SELECT 
        t.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email
      FROM tickets t
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.id = ?
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByTicketNumber(ticketNumber) {
    const query = `
      SELECT 
        t.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email
      FROM tickets t
      LEFT JOIN events e ON t.event_id = e.id
      LEFT JOIN clients c ON t.client_id = c.id
      WHERE t.ticket_number = ?
    `;
    
    const result = await pool.query(query, [ticketNumber]);
    return result.rows[0];
  }

  static async getByEventAndClient(eventId, clientId) {
    const query = `
      SELECT 
        t.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse
      FROM tickets t
      LEFT JOIN events e ON t.event_id = e.id
      WHERE t.event_id = ? AND t.client_id = ?
    `;
    
    const result = await pool.query(query, [eventId, clientId]);
    return result.rows[0];
  }

  static async updateStatus(id, status, verifiedBy = null) {
    const query = `
      UPDATE tickets 
      SET status = ?, verified_by = ?, verified_at = ${status === 'verified' ? 'NOW()' : 'NULL'}
      WHERE id = ?
    `;
    
    await pool.query(query, [status, verifiedBy, id]);
    return this.getById(id);
  }

  static async generateTicketNumber() {
    // Générer un numéro de ticket unique (format: TK-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    const ticketNumber = `TK-${dateStr}-${randomNum}`;
    
    // Vérifier l'unicité
    const existing = await this.getByTicketNumber(ticketNumber);
    if (existing) {
      // Si le numéro existe déjà, réessayer
      return this.generateTicketNumber();
    }
    
    return ticketNumber;
  }

  static async getClientTickets(clientId) {
    const query = `
      SELECT 
        t.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse,
        e.image as event_image
      FROM tickets t
      LEFT JOIN events e ON t.event_id = e.id
      WHERE t.client_id = ?
      ORDER BY t.created_at DESC
    `;
    
    const result = await pool.query(query, [clientId]);
    return result.rows;
  }
}

module.exports = Ticket;