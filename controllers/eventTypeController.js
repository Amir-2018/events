const EventType = require('../models/eventType.model');

class EventTypeController {
  static async createEventType(req, res) {
    try {
      const eventType = await EventType.create(req.body);
      
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
      const eventTypes = await EventType.getAll();
      
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
      const eventType = await EventType.update(id, req.body);
      
      if (!eventType) {
        return res.status(404).json({
          success: false,
          message: 'Type d\'événement non trouvé'
        });
      }
      
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
      const eventType = await EventType.delete(id);
      
      if (!eventType) {
        return res.status(404).json({
          success: false,
          message: 'Type d\'événement non trouvé'
        });
      }
      
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
}

module.exports = EventTypeController;