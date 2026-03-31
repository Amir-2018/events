const InvitationService = require('../services/invitationService');

class InvitationController {
  async inviteClients(req, res) {
    try {
      const { eventId } = req.params;
      const { clientEmails } = req.body;
      const invitedBy = req.user.id;

      if (!clientEmails || !Array.isArray(clientEmails) || clientEmails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Liste d\'emails clients requise'
        });
      }

      const results = await InvitationService.inviteClients(eventId, clientEmails, invitedBy);
      
      res.json({
        success: true,
        message: 'Invitations envoyées',
        data: results
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi des invitations:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async respondToInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const { response } = req.body;
      const clientId = req.user.id;

      if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({
          success: false,
          message: 'Réponse invalide. Utilisez "accepted" ou "declined"'
        });
      }

      const invitation = await InvitationService.respondToInvitation(invitationId, clientId, response);
      
      res.json({
        success: true,
        message: response === 'accepted' ? 'Invitation acceptée' : 'Invitation déclinée',
        data: invitation
      });
    } catch (error) {
      console.error('Erreur lors de la réponse à l\'invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyInvitations(req, res) {
    try {
      const clientId = req.user.id;
      const invitations = await InvitationService.getClientInvitations(clientId);
      
      res.json({
        success: true,
        data: invitations
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEventInvitations(req, res) {
    try {
      const { eventId } = req.params;
      const invitations = await InvitationService.getEventInvitations(eventId);
      
      res.json({
        success: true,
        data: invitations
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations de l\'événement:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancelInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.id;

      const result = await InvitationService.cancelInvitation(invitationId, userId);
      
      res.json({
        success: true,
        message: 'Invitation annulée',
        data: result
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InvitationController();