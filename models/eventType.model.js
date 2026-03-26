const pool = require('../db/pool');

class EventType {
  static async create(eventTypeData) {
    const { nom, description } = eventTypeData;
    
    const query = `
      INSERT INTO types_evenements (nom, description, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [nom, description]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT * FROM types_evenements 
      ORDER BY nom ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT * FROM types_evenements 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, eventTypeData) {
    const { nom, description } = eventTypeData;
    
    const query = `
      UPDATE types_evenements 
      SET nom = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [nom, description, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM types_evenements 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = EventType;