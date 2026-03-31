const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class Reclamation {
  static async getAll() {
    const query = `
      SELECT r.*, c.nom as client_nom, c.prenom as client_prenom, c.email as client_email
      FROM reclamations r
      LEFT JOIN clients c ON r.client_id = c.id
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT r.*, c.nom as client_nom, c.prenom as client_prenom, c.email as client_email
      FROM reclamations r
      LEFT JOIN clients c ON r.client_id = c.id
      WHERE r.id = ?
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE reclamations 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await pool.query(query, [status, id]);
    return { id, status };
  }

  static async create({ client_id = null, sujet, description, image = null }) {
    const id = uuidv4();
    const query = `
      INSERT INTO reclamations (id, client_id, sujet, description, image, status)
      VALUES (?, ?, ?, ?, ?, 'En attente')
    `;
    await pool.query(query, [id, client_id, sujet, description, image]);
    return { id, client_id, sujet, description, image, status: 'En attente' };
  }
}

module.exports = Reclamation;
