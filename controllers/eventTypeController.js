const EventType = require('../models/eventType.model');

class EventTypeController {
  static async createEventType(req, res) {
    try {
      console.log('🔍 DEBUG CREATE EVENT TYPE:');
      console.log('- req.user:', req.user);
      console.log('- req.user.id:', req.user?.id);
      console.log('- req.user.role:', req.user?.role);
      
      const { nom } = req.body;
      
      if (!nom || nom.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le nom du type d\'événement est obligatoire'
        });
      }
      
      // Vérifier si le type d'événement existe déjà
      const existingEventType = await EventType.findByName(nom.trim());
      if (existingEventType) {
        return res.status(400).json({
          success: false,
          message: 'Ce type d\'événement existe déjà'
        });
      }
      
      const user_id = req.user?.role === 'superadmin' ? null : req.user?.id;
      
      console.log('- Calculated user_id:', user_id);
      
      const eventType = await EventType.create({
        nom: nom.trim(),
        user_id
      });
      
      console.log('- Created eventType:', eventType);
      
      res.status(201).json({
        success: true,
        message: 'Type d\'événement créé avec succès',
        data: eventType
      });
    } catch (error) {
      console.error('Erreur lors de la création du type d\'événement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du type d\'événement',
        error: error.message
      });
    }
  }

  static async getEventTypes(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const eventTypes = await EventType.getAll(userId, userRole);
      
      res.json({
        success: true,
        data: eventTypes
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des types d\'événements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des types d\'événements',
        error: error.message
      });
    }
  }

  static async getEventType(req, res) {
    try {
      const { id } = req.params;
      const eventType = await EventType.getById(id);
      
      if (!eventType) {
        return res.status(404).json({
          success: false,
          message: 'Type d\'événement non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: eventType
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du type d\'événement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du type d\'événement',
        error: error.message
      });
    }
  }

  static async updateEventType(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG UPDATE EVENT TYPE:');
      console.log('- Type ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingEventType = await EventType.getById(id);
      if (!existingEventType) {
        return res.status(404).json({
          success: false,
          message: 'Type d\'événement non trouvé'
        });
      }
      
      console.log('- Existing Type user_id:', existingEventType?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingEventType?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut modifier tous les types, les admins ne peuvent modifier que les leurs
      if (userRole !== 'superadmin' && existingEventType.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de modifier ce type d\'événement'
        });
      }
      
      const eventType = await EventType.update(id, req.body);
      
      res.json({
        success: true,
        message: 'Type d\'événement mis à jour avec succès',
        data: eventType
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du type d\'événement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du type d\'événement',
        error: error.message
      });
    }
  }

  static async deleteEventType(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      console.log('🔍 DEBUG DELETE EVENT TYPE:');
      console.log('- Type ID:', id);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);
      
      // Vérifier les permissions
      const existingEventType = await EventType.getById(id);
      if (!existingEventType) {
        return res.status(404).json({
          success: false,
          message: 'Type d\'événement non trouvé'
        });
      }
      
      console.log('- Existing Type user_id:', existingEventType?.user_id);
      console.log('- Permission check:', userRole === 'superadmin' ? 'SUPERADMIN - ALLOWED' : existingEventType?.user_id === userId ? 'OWNER - ALLOWED' : 'DENIED');
      
      // Seul le superadmin peut supprimer tous les types, les admins ne peuvent supprimer que les leurs
      if (userRole !== 'superadmin' && existingEventType.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission de supprimer ce type d\'événement'
        });
      }
      
      const eventType = await EventType.delete(id);
      
      res.json({
        success: true,
        message: 'Type d\'événement supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du type d\'événement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du type d\'événement',
        error: error.message
      });
    }
  }
  static async bulkDeleteEventTypes(req, res) {
    try {
      const { ids } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La liste des IDs ne peut pas être vide'
        });
      }

      const BulkDeleteService = require('../services/bulkDeleteService');

      const result = await BulkDeleteService.bulkDeleteEventTypes(ids, {
        userId,
        userRole
      });

      res.json({
        success: true,
        message: `${result.deleted} type(s) d'événement supprimé(s) avec succès`,
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de la suppression multiple de types d\'événements:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = EventTypeController;