const TicketService = require('../services/ticketService');

class TicketController {
  async getTicket(req, res) {
    try {
      const { ticketNumber } = req.params;
      const requestingUserId = req.user?.id; // Peut être null pour les requêtes publiques
      
      const ticket = await TicketService.getTicketByNumber(ticketNumber, requestingUserId);
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket:', error);
      const status = error.message === 'Ticket non trouvé' ? 404 : 
                    error.message.includes('autorisation') ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  async verifyTicket(req, res) {
    try {
      const { ticketNumber } = req.params;
      const verifiedBy = req.user?.id;
      
      if (!verifiedBy) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise pour vérifier un ticket'
        });
      }
      
      const ticket = await TicketService.verifyTicket(ticketNumber, verifiedBy);
      
      res.json({
        success: true,
        message: 'Ticket vérifié avec succès',
        data: ticket
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du ticket:', error);
      const status = error.message.includes('non trouvé') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyTickets(req, res) {
    try {
      const clientId = req.user?.id;
      
      if (!clientId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      const tickets = await TicketService.getClientTickets(clientId);
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelTicket(req, res) {
    try {
      const { ticketId } = req.params;
      const cancelledBy = req.user?.id;
      
      if (!cancelledBy) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      const ticket = await TicketService.cancelTicket(ticketId, cancelledBy);
      
      res.json({
        success: true,
        message: 'Ticket annulé avec succès',
        data: ticket
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation du ticket:', error);
      const status = error.message === 'Ticket non trouvé' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEventTicketsStats(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      const stats = await TicketService.getEventTicketsStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEventTicketsList(req, res) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      const tickets = await TicketService.getEventTicketsList(eventId, userId);
      
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      const status = error.message.includes('autorisation') ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFraudAttempts(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }
      
      const fraudAttempts = await TicketService.getFraudAttempts(userId);
      
      res.json({
        success: true,
        data: fraudAttempts
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tentatives de fraude:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TicketController();