const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class TypeBien {
  static async create(typeBienData) {
    const { nom, user_id } = typeBienData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO type_biens (id, nom, user_id, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    await pool.query(query, [id, nom, user_id]);
    return { id, nom, user_id };
  }

  static async findByName(nom) {
    const query = `
      SELECT * FROM type_biens 
      WHERE LOWER(nom) = LOWER(?)
    `;
    
    const result = await pool.query(query, [nom]);
    return result.rows[0];
  }

  static async getAll(userId = null, userRole = null) {
    let query = 'SELECT * FROM type_biens';
    let params = [];
    
    if (userRole === 'superadmin') {
      // Superadmin voit tout
      query += ' WHERE 1=1';
    } else if (userId) {
      // Admin voit ses propres créations + celles du superadmin (user_id = NULL)
      query += ' WHERE user_id = ? OR user_id IS NULL';
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
    const { nom } = typeBienData;
    
    const query = `
      UPDATE type_biens 
      SET nom = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await pool.query(query, [nom, id]);
    return { id, nom };
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
