const EventService = require('../services/eventService');

class EventController {
  async getEvents(req, res) {
    try {
      const events = await EventService.getAllEvents();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventDetails(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.getEventById(eventId);
      res.json({ 
        success: true, 
        data: event 
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'événement:', error);
      const status = error.message === 'Événement non trouvé' ? 404 : 500;
      res.status(status).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getEventClients(req, res) {
    try {
      const { eventId } = req.params;
      const clients = await EventService.getEventClients(eventId);
      res.json({ 
        success: true, 
        data: clients 
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      const status = error.message === 'Événement non trouvé' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createEvent(req, res) {
    try {
      const { nom, date, image, adresse, type_evenement_id, bien_id } = req.body;
      
      // Debug logs
      console.log('=== CREATE EVENT DEBUG ===');
      console.log('Body received:', {
        nom,
        date,
        adresse,
        type_evenement_id,
        bien_id,
        imageType: typeof image,
        imageLength: image ? image.length : 0,
        imagePreview: image ? image.substring(0, 50) + '...' : 'null'
      });
      
      const event = await EventService.createEvent({ 
        nom, 
        date, 
        image, 
        adresse, 
        type_evenement_id, 
        bien_id 
      });
      
      console.log('Event created:', {
        id: event.id,
        nom: event.nom,
        type_evenement_id: event.type_evenement_id,
        bien_id: event.bien_id,
        imageStored: event.image ? 'YES' : 'NO',
        imageLength: event.image ? event.image.length : 0
      });
      console.log('=== END DEBUG ===');
      
      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: event,
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.updateEvent(eventId, req.body);
      
      res.json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: event,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      const status = error.message === 'Événement non trouvé' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const deleted = await EventService.deleteEvent(eventId);
      res.json({ 
        success: true, 
        message: 'Événement supprimé avec succès', 
        data: deleted 
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      const status = error.message === 'Événement non trouvé' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  async registerToEvent(req, res) {
    try {
      const eventId = req.params.eventId || req.body?.eventId;
      const clientId = req.user?.id;

      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Veuillez vous connecter d\'abord',
        });
      }

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'ID de l\'événement manquant',
        });
      }

      const result = await EventService.registerClientToEvent(eventId, clientId);
      
      res.status(201).json({
        success: true,
        message: 'Inscription à l\'événement réussie',
        data: result,
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      const status = error.message === 'Événement non trouvé' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Nouvelles méthodes pour les recherches et filtres
  async searchEvents(req, res) {
    try {
      const { q } = req.query;
      const events = await EventService.searchEvents(q);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventsByType(req, res) {
    try {
      const { typeId } = req.params;
      const events = await EventService.getEventsByType(typeId);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Erreur lors du filtrage par type:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventsByProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const events = await EventService.getEventsByProperty(propertyId);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Erreur lors du filtrage par bien:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventStats(req, res) {
    try {
      const stats = await EventService.getEventStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new EventController();
