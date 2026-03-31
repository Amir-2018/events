const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class EventInvitation {
  static async create(invitationData) {
    const { event_id, client_id, invited_by } = invitationData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO event_invitations (id, event_id, client_id, invited_by, status, invited_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
    
    await pool.query(query, [id, event_id, client_id, invited_by]);
    return this.getById(id);
  }

  static async getById(id) {
    const query = `
      SELECT 
        ei.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        u.nom as inviter_nom,
        u.prenom as inviter_prenom
      FROM event_invitations ei
      LEFT JOIN events e ON ei.event_id = e.id
      LEFT JOIN clients c ON ei.client_id = c.id
      LEFT JOIN users u ON ei.invited_by = u.id
      WHERE ei.id = ?
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByEventAndClient(event_id, client_id) {
    const query = `
      SELECT * FROM event_invitations 
      WHERE event_id = ? AND client_id = ?
    `;
    
    const result = await pool.query(query, [event_id, client_id]);
    return result.rows[0];
  }

  static async getInvitationsByEvent(event_id) {
    const query = `
      SELECT 
        ei.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email
      FROM event_invitations ei
      LEFT JOIN clients c ON ei.client_id = c.id
      WHERE ei.event_id = ?
      ORDER BY ei.invited_at DESC
    `;
    
    const result = await pool.query(query, [event_id]);
    return result.rows;
  }

  static async getInvitationsByClient(client_id) {
    const query = `
      SELECT 
        ei.*,
        e.nom as event_nom,
        e.date as event_date,
        e.adresse as event_adresse,
        e.image as event_image,
        e.prix as event_prix
      FROM event_invitations ei
      LEFT JOIN events e ON ei.event_id = e.id
      WHERE ei.client_id = ? AND ei.status = 'pending'
      ORDER BY ei.invited_at DESC
    `;
    
    const result = await pool.query(query, [client_id]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE event_invitations 
      SET status = ?, responded_at = NOW()
      WHERE id = ?
    `;
    
    await pool.query(query, [status, id]);
    return this.getById(id);
  }

  static async deleteInvitation(id) {
    const query = 'DELETE FROM event_invitations WHERE id = ?';
    await pool.query(query, [id]);
  }
}