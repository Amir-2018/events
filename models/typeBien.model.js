const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class TypeBien {
  static async create(typeBienData) {
    const { nom, description, user_id, status = 'pending' } = typeBienData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO type_biens (id, nom, description, user_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [id, nom, description, user_id, status]);
    return { id, nom, description, user_id, status };
  }

  static async getAll(userId = null, userRole = null) {
    let query = 'SELECT * FROM type_biens';
    let params = [];
    
    if (userRole === 'superadmin') {
      // Superadmin voit tout
      query += ' WHERE 1=1';
    } else if (userId) {
      // Admin voit seulement ses propres créations
      query += ' WHERE user_id = ?';
      params.push(userId);
    } else {
      // Public voit seulement celles créées par superadmin (user_id = NULL)
      query += ' WHERE user_id IS NULL';
    }
    
    query += ' ORDER BY nom ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT * FROM type_biens WHERE id = ?
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, typeBienData) {
    const { nom, description, status } = typeBienData;
    
    let query = `
      UPDATE type_biens 
      SET nom = ?, description = ?, updated_at = NOW()
    `;
    let params = [nom, description];
    
    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    return { id, nom, description, status };
  }

  static async delete(id) {
    const typeBien = await this.getById(id);
    if (!typeBien) return null;

    const query = `DELETE FROM type_biens WHERE id = ?`;
    await pool.query(query, [id]);
    return typeBien;
  }
}

module.exports = TypeBien;
