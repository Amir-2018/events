const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class User {
  static async findByUsername(username) {
    const query = `
      SELECT u.*, r.nom as role_nom 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.username = ?
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async getById(id) {
    const query = `
      SELECT u.*, r.nom as role_nom 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create({ username, password, nom, prenom, email, role_id, status = 'accepted' }) {
    const id = uuidv4();
    const query = `
      INSERT INTO users (id, username, password, nom, prenom, email, role_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [id, username, password, nom, prenom, email, role_id, status]);
    return { id, username, password, nom, prenom, email, role_id, status };
  }

  static async getAll() {
    const query = `
      SELECT u.id, u.username, u.nom, u.prenom, u.email, u.role_id, r.nom as role_nom, u.status, u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
  static async update(id, { username, nom, prenom, email, role_id, status }) {
    const query = `
      UPDATE users 
      SET username = ?, nom = ?, prenom = ?, email = ?, role_id = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    await pool.query(query, [username, nom, prenom, email, role_id, status, id]);
    return { id, username, nom, prenom, email, role_id, status };
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [status, id]);
    return { id, status };
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await pool.query(query, [id]);
  }
}

module.exports = User;
