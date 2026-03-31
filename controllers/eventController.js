const EventService = require('../services/eventService');
const TicketService = require('../services/ticketService');

class EventController {
  async getEvents(req, res) {
    try {
      const isManaged = req.query.managed === 'true';
      const isPublicOnly = req.query.public === 'true';
      const userId = (isManaged && req.user?.role !== 'superadmin') ? req.user.id : null;
      const clientId = req.user?.role === 'client' ? req.user.id : null;
      
      let events;
      if (isPublicOnly) {
        events = await EventService.getPublicEvents(userId);
      } else {
        events = await EventService.getAllEvents(userId, clientId);
      }
      
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
      const { nom, date, date_fin, image, adresse, type_evenement_id, bien_id, prix, is_private } = req.body;
      const user_id = req.user?.id;
      
      const event = await EventService.createEvent({ 
        nom, 
        date, 
        date_fin,
        image, 
        adresse, 
        type_evenement_id, 
        bien_id,
        prix,
        user_id,
        is_private
      });
      
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
      const eventData = { 
        ...req.body, 
        requestingUserId: req.user?.id, 
        requestingUserRole: req.user?.role 
      };
      const event = await EventService.updateEvent(eventId, eventData);
      
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
      const options = { 
        requestingUserId: req.user?.id, 
        requestingUserRole: req.user?.role 
      };
      const deleted = await EventService.deleteEvent(eventId, options);
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

  async getRevenueStats(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      // Seuls les admins et superadmins peuvent voir les statistiques de revenus
      if (!userId || (userRole !== 'admin' && userRole !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }
      
      // Les superadmins voient tout, les admins voient seulement leurs événements
      const statsUserId = userRole === 'superadmin' ? null : userId;
      const stats = await EventService.getRevenueStats(statsUserId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de revenus:', error);
      res.status(500).json({
        success: false,
        message: error.message
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

      // Inscrire le client à l'événement
      const result = await EventService.registerClientToEvent(eventId, clientId);
      
      // Récupérer les données de l'événement et du client pour créer le ticket
      const event = await EventService.getEventById(eventId);
      const clientData = req.user; // Les données du client sont dans req.user
      
      // Créer le ticket avec QR code
      const ticket = await TicketService.createTicket(eventId, clientId, event, clientData);
      
      res.status(201).json({
        success: true,
        message: 'Inscription à l\'événement réussie',
        data: {
          registration: result,
          ticket: ticket
        },
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

  async getMyRegistrations(req, res) {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Veuillez vous connecter d\'abord',
        });
      }

      const events = await EventService.getRegistrationsByClient(clientId);
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async unregisterFromEvent(req, res) {
    try {
      const { eventId } = req.params;
      const clientId = req.user?.id;

      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Veuillez vous connecter d\'abord',
        });
      }

      const result = await EventService.unregisterClientFromEvent(eventId, clientId);
      
      res.status(200).json({
        success: true,
        message: 'Inscription annulée avec succès',
        data: result,
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'inscription:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Souvenirs methods
  async addSouvenir(req, res) {
    try {
      const { eventId } = req.params;
      const { url, type } = req.body;
      const souvenir = await EventService.addSouvenir(eventId, url, type);
      res.status(201).json({
        success: true,
        message: 'Souvenir ajouté avec succès',
        data: souvenir
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du souvenir:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSouvenirs(req, res) {
    try {
      const { eventId } = req.params;
      const souvenirs = await EventService.getSouvenirs(eventId);
      res.json({
        success: true,
        data: souvenirs
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des souvenirs:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteSouvenir(req, res) {
    try {
      const { souvenirId } = req.params;
      const deleted = await EventService.deleteSouvenir(souvenirId);
      res.json({
        success: true,
        message: 'Souvenir supprimé avec succès',
        data: deleted
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du souvenir:', error);
      res.status(400).json({
        success: false,
        message: error.message
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
      const isManaged = req.query.managed === 'true';
      const userId = (isManaged && req.user?.role !== 'superadmin') ? req.user.id : null;
      const stats = await EventService.getEventStats(userId);
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
