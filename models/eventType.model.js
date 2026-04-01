const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class EventType {
  static async create(eventTypeData) {
    const { nom, user_id } = eventTypeData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO types_evenements (id, nom, user_id, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    await pool.query(query, [id, nom, user_id]);
    return { id, nom, user_id };
  }

  static async findByName(nom) {
    const query = `
      SELECT * FROM types_evenements 
      WHERE LOWER(nom) = LOWER(?)
    `;
    
    const result = await pool.query(query, [nom]);
    return result.rows[0];
  }

  static async getAll(userId = null, userRole = null) {
    let query = 'SELECT * FROM types_evenements';
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
      SELECT * FROM types_evenements 
      WHERE id = ?
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, eventTypeData) {
    const { nom } = eventTypeData;
    
    const query = `
      UPDATE types_evenements 
      SET nom = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await pool.query(query, [nom, id]);
    return { id, nom };
  }

  static async delete(id) {
    const eventType = await this.getById(id);
    if (!eventType) return null;

    const query = `DELETE FROM types_evenements WHERE id = ?`;
    await pool.query(query, [id]);
    return eventType;
  }
}

module.exports = EventType;