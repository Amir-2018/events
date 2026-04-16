const pool = require('../db/pool');

class BulkDeleteService {
  /**
   * Service générique pour la suppression multiple d'éléments
   * @param {string} tableName - Nom de la table
   * @param {Array} ids - Tableau des IDs à supprimer
   * @param {Object} options - Options de configuration
   * @param {string} options.userIdColumn - Nom de la colonne user_id (par défaut 'user_id')
   * @param {string} options.idColumn - Nom de la colonne ID (par défaut 'id')
   * @param {Function} options.beforeDelete - Fonction à exécuter avant suppression
   * @param {Function} options.afterDelete - Fonction à exécuter après suppression
   * @param {Object} options.permissions - Configuration des permissions
   * @returns {Object} Résultat de l'opération
   */
  static async bulkDelete(tableName, ids, options = {}) {
    const {
      userIdColumn = 'user_id',
      idColumn = 'id',
      beforeDelete = null,
      afterDelete = null,
      permissions = {}
    } = options;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('La liste des IDs ne peut pas être vide');
    }

    if (!tableName) {
      throw new Error('Le nom de la table est requis');
    }

    const results = {
      success: [],
      failed: [],
      total: ids.length,
      deleted: 0,
      errors: []
    };

    try {
      // Vérifier les permissions si configurées
      if (permissions.userId && permissions.userRole !== 'superadmin') {
        const placeholders = ids.map(() => '?').join(',');
        const checkQuery = `
          SELECT ${idColumn}, ${userIdColumn} 
          FROM ${tableName} 
          WHERE ${idColumn} IN (${placeholders})
        `;
        
        const existingItems = await pool.query(checkQuery, ids);
        
        for (const item of existingItems.rows) {
          // Vérifier si l'utilisateur a le droit de supprimer cet élément
          if (item[userIdColumn] !== permissions.userId && item[userIdColumn] !== null) {
            results.failed.push({
              id: item[idColumn],
              error: 'Permission refusée'
            });
          }
        }
        
        // Filtrer les IDs autorisés
        const authorizedIds = existingItems.rows
          .filter(item => item[userIdColumn] === permissions.userId || item[userIdColumn] === null)
          .map(item => item[idColumn]);
        
        if (authorizedIds.length === 0) {
          throw new Error('Aucun élément autorisé à la suppression');
        }
        
        // Mettre à jour la liste des IDs à supprimer
        ids.splice(0, ids.length, ...authorizedIds);
      }

      // Exécuter la fonction beforeDelete si fournie
      if (beforeDelete && typeof beforeDelete === 'function') {
        await beforeDelete(ids, tableName);
      }

      // Supprimer les éléments un par un pour un meilleur contrôle des erreurs
      for (const id of ids) {
        try {
          const deleteQuery = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;
          const result = await pool.query(deleteQuery, [id]);
          
          if (result.affectedRows > 0) {
            results.success.push(id);
            results.deleted++;
          } else {
            results.failed.push({
              id,
              error: 'Élément non trouvé'
            });
          }
        } catch (error) {
          results.failed.push({
            id,
            error: error.message
          });
          results.errors.push(`ID ${id}: ${error.message}`);
        }
      }

      // Exécuter la fonction afterDelete si fournie
      if (afterDelete && typeof afterDelete === 'function') {
        await afterDelete(results.success, tableName);
      }

      return results;

    } catch (error) {
      throw new Error(`Erreur lors de la suppression multiple: ${error.message}`);
    }
  }

  /**
   * Suppression multiple d'événements avec vérifications spécifiques
   */
  static async bulkDeleteEvents(ids, permissions = {}) {
    return await this.bulkDelete('events', ids, {
      permissions,
      beforeDelete: async (eventIds) => {
        // Vérifier s'il y a des inscriptions
        const placeholders = eventIds.map(() => '?').join(',');
        const registrationsQuery = `
          SELECT event_id, COUNT(*) as count 
          FROM event_registrations 
          WHERE event_id IN (${placeholders}) 
          GROUP BY event_id
        `;
        
        const registrations = await pool.query(registrationsQuery, eventIds);
        
        if (registrations.rows.length > 0) {
          console.log('Événements avec inscriptions détectés:', registrations.rows);
          // On peut choisir de bloquer ou de supprimer les inscriptions
          // Pour l'instant, on supprime les inscriptions en cascade
        }
      },
      afterDelete: async (deletedIds) => {
        console.log(`${deletedIds.length} événements supprimés avec succès`);
      }
    });
  }

  /**
   * Suppression multiple de types d'événements
   */
  static async bulkDeleteEventTypes(ids, permissions = {}) {
    return await this.bulkDelete('types_evenements', ids, {
      permissions,
      beforeDelete: async (typeIds) => {
        // Vérifier s'il y a des événements utilisant ces types
        const placeholders = typeIds.map(() => '?').join(',');
        const eventsQuery = `
          SELECT type_evenement_id, COUNT(*) as count 
          FROM events 
          WHERE type_evenement_id IN (${placeholders}) 
          GROUP BY type_evenement_id
        `;
        
        const events = await pool.query(eventsQuery, typeIds);
        
        if (events.rows.length > 0) {
          throw new Error('Impossible de supprimer des types d\'événements utilisés par des événements existants');
        }
      }
    });
  }

  /**
   * Suppression multiple de types de biens
   */
  static async bulkDeleteTypeBiens(ids, permissions = {}) {
    return await this.bulkDelete('type_biens', ids, {
      permissions,
      beforeDelete: async (typeIds) => {
        // Vérifier s'il y a des biens utilisant ces types
        const placeholders = typeIds.map(() => '?').join(',');
        const biensQuery = `
          SELECT type_bien_id, COUNT(*) as count 
          FROM biens 
          WHERE type_bien_id IN (${placeholders}) 
          GROUP BY type_bien_id
        `;
        
        const biens = await pool.query(biensQuery, typeIds);
        
        if (biens.rows.length > 0) {
          throw new Error('Impossible de supprimer des types de biens utilisés par des biens existants');
        }
      }
    });
  }

  /**
   * Suppression multiple de biens
   */
  static async bulkDeleteBiens(ids, permissions = {}) {
    return await this.bulkDelete('biens', ids, {
      permissions,
      beforeDelete: async (bienIds) => {
        // Vérifier s'il y a des événements utilisant ces biens
        const placeholders = bienIds.map(() => '?').join(',');
        const eventsQuery = `
          SELECT bien_id, COUNT(*) as count 
          FROM events 
          WHERE bien_id IN (${placeholders}) 
          GROUP BY bien_id
        `;
        
        const events = await pool.query(eventsQuery, bienIds);
        
        if (events.rows.length > 0) {
          throw new Error('Impossible de supprimer des biens utilisés par des événements existants');
        }
      }
    });
  }
}

module.exports = BulkDeleteService;