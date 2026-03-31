const Ticket = require('../models/ticket.model');
const QRCode = require('qrcode');

class TicketService {
  static async createTicket(eventId, clientId, eventData, clientData) {
    try {
      // Vérifier si un ticket existe déjà pour cet événement et ce client
      const existingTicket = await Ticket.getByEventAndClient(eventId, clientId);
      if (existingTicket) {
        return existingTicket;
      }

      // Générer un numéro de ticket unique
      const ticketNumber = await Ticket.generateTicketNumber();
      
      // Créer les données du QR code
      const qrData = {
        ticketNumber: ticketNumber,
        eventId: eventId,
        clientId: clientId,
        eventName: eventData.nom,
        eventDate: eventData.date,
        clientName: `${clientData.prenom} ${clientData.nom}`,
        timestamp: new Date().toISOString()
      };
      
      // Générer le QR code
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Créer le ticket
      const ticket = await Ticket.create({
        event_id: eventId,
        client_id: clientId,
        ticket_number: ticketNumber,
        qr_code_data: qrCodeDataURL,
        status: 'active'
      });
      
      return ticket;
      
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      throw new Error('Impossible de créer le ticket');
    }
  }

  static async verifyTicket(ticketNumber, verifiedBy) {
    try {
      const ticket = await Ticket.getByTicketNumber(ticketNumber);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      if (ticket.status === 'verified') {
        // Enregistrer la tentative de fraude
        await this.logFraudAttempt(ticketNumber, ticket.event_id, verifiedBy, 'duplicate_verification');
        throw new Error('Ticket déjà vérifié - Tentative de fraude détectée');
      }
      
      if (ticket.status === 'cancelled') {
        throw new Error('Ticket annulé');
      }
      
      // Vérifier si l'événement n'est pas passé
      const eventDate = new Date(ticket.event_date);
      const now = new Date();
      
      if (eventDate < now) {
        throw new Error('Événement déjà passé');
      }
      
      // Vérifier que l'utilisateur qui vérifie est le créateur de l'événement
      const eventQuery = `
        SELECT user_id FROM events WHERE id = ?
      `;
      const pool = require('../db/pool');
      const eventResult = await pool.query(eventQuery, [ticket.event_id]);
      
      if (eventResult.rows.length === 0) {
        throw new Error('Événement non trouvé');
      }
      
      const eventCreator = eventResult.rows[0].user_id;
      
      // Permettre aux superadmins de vérifier tous les tickets
      const userQuery = `
        SELECT r.nom as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `;
      const userResult = await pool.query(userQuery, [verifiedBy]);
      const userRole = userResult.rows[0]?.role_name;
      
      if (userRole !== 'superadmin' && eventCreator !== verifiedBy) {
        // Enregistrer la tentative d'accès non autorisé
        await this.logFraudAttempt(ticketNumber, ticket.event_id, verifiedBy, 'unauthorized_access');
        throw new Error('Seul l\'administrateur qui a créé cet événement peut vérifier ce ticket');
      }
      
      // Marquer le ticket comme vérifié
      const verifiedTicket = await Ticket.updateStatus(ticket.id, 'verified', verifiedBy);
      
      return verifiedTicket;
      
    } catch (error) {
      console.error('Erreur lors de la vérification du ticket:', error);
      throw error;
    }
  }

  static async logFraudAttempt(ticketNumber, eventId, attemptedBy, attemptType) {
    try {
      const pool = require('../db/pool');
      const { v4: uuidv4 } = require('uuid');
      
      const query = `
        INSERT INTO fraud_logs (id, ticket_number, event_id, attempted_by, attempt_type, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      await pool.query(query, [
        uuidv4(),
        ticketNumber,
        eventId,
        attemptedBy,
        attemptType
      ]);
      
      console.log(`🚨 Tentative de fraude enregistrée: ${attemptType} pour le ticket ${ticketNumber}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la fraude:', error);
    }
  }

  static async getFraudAttempts(userId) {
    try {
      const pool = require('../db/pool');
      
      // Récupérer les tentatives de fraude pour les événements de l'utilisateur
      const query = `
        SELECT 
          fl.*,
          e.nom as event_name,
          u.nom as attempted_by_name,
          u.prenom as attempted_by_prenom
        FROM fraud_logs fl
        LEFT JOIN events e ON fl.event_id = e.id
        LEFT JOIN users u ON fl.attempted_by = u.id
        WHERE e.user_id = ?
        ORDER BY fl.created_at DESC
        LIMIT 50
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des tentatives de fraude:', error);
      throw error;
    }
  }

  static async getTicketByNumber(ticketNumber, requestingUserId = null) {
    try {
      const ticket = await Ticket.getByTicketNumber(ticketNumber);
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      // Si un utilisateur fait la demande, vérifier les permissions
      if (requestingUserId) {
        const pool = require('../db/pool');
        
        // Vérifier le rôle de l'utilisateur
        const userQuery = `
          SELECT r.nom as role_name 
          FROM users u 
          LEFT JOIN roles r ON u.role_id = r.id 
          WHERE u.id = ?
        `;
        const userResult = await pool.query(userQuery, [requestingUserId]);
        const userRole = userResult.rows[0]?.role_name;
        
        // Si ce n'est pas un superadmin, vérifier qu'il est le créateur de l'événement
        if (userRole !== 'superadmin') {
          const eventQuery = `SELECT user_id FROM events WHERE id = ?`;
          const eventResult = await pool.query(eventQuery, [ticket.event_id]);
          
          if (eventResult.rows.length === 0) {
            throw new Error('Événement non trouvé');
          }
          
          const eventCreator = eventResult.rows[0].user_id;
          
          if (eventCreator !== requestingUserId) {
            throw new Error('Vous n\'avez pas l\'autorisation de voir ce ticket');
          }
        }
      }
      
      return ticket;
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket:', error);
      throw error;
    }
  }

  static async getClientTickets(clientId) {
    try {
      return await Ticket.getClientTickets(clientId);
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets du client:', error);
      throw error;
    }
  }

  static async getEventTicketsStats(userId) {
    try {
      const pool = require('../db/pool');
      
      // Récupérer les événements de l'utilisateur avec les statistiques des tickets
      const query = `
        SELECT 
          e.id as event_id,
          e.nom as event_name,
          e.date as event_date,
          e.adresse as event_address,
          e.image as event_image,
          COUNT(t.id) as total_tickets,
          SUM(CASE WHEN t.status = 'active' THEN 1 ELSE 0 END) as active_tickets,
          SUM(CASE WHEN t.status = 'verified' THEN 1 ELSE 0 END) as verified_tickets,
          SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tickets
        FROM events e
        LEFT JOIN tickets t ON e.id = t.event_id
        WHERE e.user_id = ?
        GROUP BY e.id, e.nom, e.date, e.adresse, e.image
        ORDER BY e.date DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  static async getEventTicketsList(eventId, userId) {
    try {
      const pool = require('../db/pool');
      
      // Vérifier que l'utilisateur est le créateur de l'événement ou superadmin
      const userQuery = `
        SELECT r.nom as role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE u.id = ?
      `;
      const userResult = await pool.query(userQuery, [userId]);
      const userRole = userResult.rows[0]?.role_name;
      
      if (userRole !== 'superadmin') {
        const eventQuery = `SELECT user_id FROM events WHERE id = ?`;
        const eventResult = await pool.query(eventQuery, [eventId]);
        
        if (eventResult.rows.length === 0) {
          throw new Error('Événement non trouvé');
        }
        
        const eventCreator = eventResult.rows[0].user_id;
        
        if (eventCreator !== userId) {
          throw new Error('Vous n\'avez pas l\'autorisation de voir ces tickets');
        }
      }
      
      // Récupérer tous les tickets de l'événement
      const query = `
        SELECT 
          t.*,
          c.nom as client_nom,
          c.prenom as client_prenom,
          c.email as client_email,
          e.nom as event_nom,
          e.date as event_date
        FROM tickets t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN events e ON t.event_id = e.id
        WHERE t.event_id = ?
        ORDER BY t.created_at DESC
      `;
      
      const result = await pool.query(query, [eventId]);
      return result.rows;
      
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets de l\'événement:', error);
      throw error;
    }
  }

  static async cancelTicket(ticketId, cancelledBy) {
    try {
      const ticket = await Ticket.getById(ticketId);
      
      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }
      
      if (ticket.status === 'verified') {
        throw new Error('Impossible d\'annuler un ticket déjà vérifié');
      }
      
      const cancelledTicket = await Ticket.updateStatus(ticketId, 'cancelled', cancelledBy);
      
      return cancelledTicket;
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation du ticket:', error);
      throw error;
    }
  }
}

module.exports = TicketService;