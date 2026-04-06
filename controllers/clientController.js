const Client = require('../models/client.model');
const TicketService = require('../services/ticketService');
const bcrypt = require('bcrypt');

class ClientController {
  // Récupérer tous les clients avec leurs événements
  static async getAllClients(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const clients = await Client.getAllWithEvents(userId, userRole);
      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des clients'
      });
    }
  }

  // Annuler l'inscription d'un client à un événement
  static async cancelRegistration(req, res) {
    try {
      const { clientId, eventId } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      console.log('🔍 DEBUG CANCEL REGISTRATION:');
      console.log('- Client ID:', clientId);
      console.log('- Event ID:', eventId);
      console.log('- User ID:', userId);
      console.log('- User Role:', userRole);

      // Vérifier que l'inscription existe
      const pool = require('../db/pool');
      const inscriptionResult = await pool.query(
        'SELECT * FROM event_registrations WHERE client_id = ? AND event_id = ?',
        [clientId, eventId]
      );

      if (inscriptionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Inscription non trouvée'
        });
      }

      // Vérifier les permissions (seul l'admin qui a créé l'événement ou le superadmin peut annuler)
      const eventResult = await pool.query('SELECT user_id FROM events WHERE id = ?', [eventId]);
      const event = eventResult.rows[0];

      if (userRole !== 'superadmin' && event?.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Vous n\'avez pas la permission d\'annuler cette inscription'
        });
      }

      // Supprimer le ticket associé s'il existe
      const ticketResult = await pool.query(
        'SELECT id FROM tickets WHERE client_id = ? AND event_id = ?',
        [clientId, eventId]
      );

      if (ticketResult.rows.length > 0) {
        const ticketId = ticketResult.rows[0].id;
        await pool.query('DELETE FROM tickets WHERE id = ?', [ticketId]);
        console.log('✅ Ticket supprimé:', ticketId);
      }

      // Supprimer l'inscription
      await pool.query(
        'DELETE FROM event_registrations WHERE client_id = ? AND event_id = ?',
        [clientId, eventId]
      );

      console.log('✅ Inscription annulée');

      res.json({
        success: true,
        message: 'Inscription annulée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de l\'inscription'
      });
    }
  }

  // Récupérer un client par ID
  static async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await Client.getByIdWithEvents(id);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du client'
      });
    }
  }

  // Créer un nouveau client
  static async createClient(req, res) {
    try {
      const { nom, prenom, email, tel, password } = req.body;

      // Validation des données
      if (!nom || !prenom || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nom, prénom, email et mot de passe sont requis'
        });
      }

      // Vérifier si l'email existe déjà
      const existingClient = await Client.findByEmail(email);
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'Un client avec cet email existe déjà'
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer le client
      const newClient = await Client.create({
        nom,
        prenom,
        email,
        tel,
        password: hashedPassword
      });

      res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        data: newClient
      });
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du client'
      });
    }
  }

  // Mettre à jour un client
  static async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom, email, tel } = req.body;

      // Validation des données
      if (!nom || !prenom || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nom, prénom et email sont requis'
        });
      }

      // Vérifier si le client existe
      const existingClient = await Client.getById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }

      // Vérifier si l'email est déjà utilisé par un autre client
      const emailClient = await Client.findByEmail(email);
      if (emailClient && emailClient.id !== id) {
        return res.status(400).json({
          success: false,
          message: 'Un autre client utilise déjà cet email'
        });
      }

      // Mettre à jour le client
      const updatedClient = await Client.update(id, {
        nom,
        prenom,
        email,
        tel
      });

      res.json({
        success: true,
        message: 'Client mis à jour avec succès',
        data: updatedClient
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du client'
      });
    }
  }

  // Supprimer un client
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si le client existe
      const existingClient = await Client.getById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: 'Client non trouvé'
        });
      }

      // Supprimer le client
      await Client.delete(id);

      res.json({
        success: true,
        message: 'Client supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du client'
      });
    }
  }
}

module.exports = ClientController;