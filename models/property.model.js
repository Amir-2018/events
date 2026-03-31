const pool = require('../db/pool');
const { v4: uuidv4 } = require('uuid');

class Property {
  static async create(propertyData) {
    const { 
      nom, 
      type_bien_id, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture,
      user_id,
      status = 'pending'
    } = propertyData;
    
    const id = uuidv4();
    const query = `
      INSERT INTO biens (id, nom, type_bien_id, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture, user_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    await pool.query(query, [
      id,
      nom, 
      type_bien_id, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture || 'Lundi-Dimanche',
      user_id,
      status
    ]);
    return this.getById(id);
  }

  static async getAll(userId = null, userRole = null) {
    let query = `
      SELECT b.*, tb.nom as type_bien_nom, tb.description as type_bien_description
      FROM biens b
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
    `;
    let params = [];
    
    if (userRole === 'superadmin') {
      // Superadmin voit tout
      query += ' WHERE 1=1';
    } else if (userId) {
      // Admin voit : ses propres créations + celles créées par superadmin (user_id = NULL)
      query += ' WHERE b.user_id = ? OR b.user_id IS NULL';
      params.push(userId);
    } else {
      // Public voit seulement celles créées par superadmin
      query += ' WHERE b.user_id IS NULL';
    }
    
    query += ' ORDER BY b.nom ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT b.*, tb.nom as type_bien_nom, tb.description as type_bien_description
      FROM biens b
      LEFT JOIN type_biens tb ON b.type_bien_id = tb.id
      WHERE b.id = ?
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, propertyData) {
    const { 
      nom, 
      type_bien_id, 
      adresse, 
      description, 
      latitude, 
      longitude, 
      horaire_ouverture, 
      horaire_fermeture, 
      jours_ouverture,
      status
    } = propertyData;
    
    let query = `
      UPDATE biens 
      SET nom = ?, type_bien_id = ?, adresse = ?, description = ?, latitude = ?, longitude = ?, 
          horaire_ouverture = ?, horaire_fermeture = ?, jours_ouverture = ?, updated_at = NOW()
    `;
    let params = [nom, type_bien_id, adresse, description, latitude, longitude, horaire_ouverture, horaire_fermeture, jours_ouverture];
    
    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    return this.getById(id);
  }

  static async delete(id) {
    const property = await this.getById(id);
    if (!property) return null;

    const query = `DELETE FROM biens WHERE id = ?`;
    await pool.query(query, [id]);
    return property;
  }
}

module.exports = Property;