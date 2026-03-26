const pool = require('../db/pool');

class Property {
  static async create(propertyData) {
    const { 
      nom, 
      type, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture 
    } = propertyData;
    
    const query = `
      INSERT INTO biens (nom, type, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nom, 
      type, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture || 'Lundi-Dimanche'
    ]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      SELECT * FROM biens 
      ORDER BY nom ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT * FROM biens 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, propertyData) {
    const { 
      nom, 
      type, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture 
    } = propertyData;
    
    const query = `
      UPDATE biens 
      SET nom = $1, type = $2, adresse = $3, description = $4, latitude = $5, longitude = $6, 
          horaire_ouverture = $7, horaire_fermeture = $8, jours_ouverture = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      nom, 
      type, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture, 
      id
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM biens 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Property;