const EventInvitation = require('../models/eventInvitation.model');
const Client = require('../models/client.model');
const Event = require('../models/event.model');
const emailService = require('./emailService');
const authService = require('./authService');
const { v4: uuidv4 } = require('uuid');

class InvitationService {
  static async inviteClients(eventId, clientEmails, invitedBy) {
    const event = await Event.getById(eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    if (!event.is_private) {
      throw new Error('Seuls les événements privés peuvent avoir des invitations');
    }

    const results = {
      invited: [],
      created_accounts: [],
      errors: []
    };

    for (const email of clientEmails) {
      try {
        let client = await Client.findByEmail(email);
        
        if (!client) {
          // Créer un compte temporaire pour le client
          const tempPassword = this.generateTempPassword();
          client = await Client.create({
            nom: 'À compléter',
            prenom: 'À compléter',
            email: email,
            tel: 'À compléter',
            password: await require('bcryptjs').hash(tempPassword, 12)
          });
          
          results.created_accounts.push({
            email: email,
            tempPassword: tempPassword,
            client_id: client.id
          });
        }

        // Créer l'invitation
        const invitation = await EventInvitation.create({
          event_id: eventId,
          client_id: client.id,
          invited_by: invitedBy
        });

        // Envoyer l'email d'invitation
        await this.sendInvitationEmail(client, event, invitation, results.created_accounts.find(acc => acc.email === email)?.tempPassword);
        
        results.invited.push({
          client_id: client.id,
          email: email,
          invitation_id: invitation.id
        });

      } catch (error) {
        results.errors.push({
          email: email,
          error: error.message
        });
      }
    }

    return results;
  }

  static async respondToInvitation(invitationId, clientId, response) {
    const invitation = await EventInvitation.getById(invitationId);
    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.client_id !== clientId) {
      throw new Error('Cette invitation ne vous appartient pas');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Cette invitation a déjà été traitée');
    }

    if (!['accepted', 'declined'].includes(response)) {
      throw new Error('Réponse invalide');
    }

    const updatedInvitation = await EventInvitation.updateStatus(invitationId, response);

    // Si acceptée, inscrire automatiquement le client à l'événement
    if (response === 'accepted') {
      await Event.registerClient(invitation.event_id, clientId);
    }

    return updatedInvitation;
  }

  static async getClientInvitations(clientId) {
    return await EventInvitation.getInvitationsByClient(clientId);
  }

  static async getEventInvitations(eventId) {
    return await EventInvitation.getInvitationsByEvent(eventId);
  }

  static async cancelInvitation(invitationId, userId) {
    const invitation = await EventInvitation.getById(invitationId);
    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    // Vérifier que l'utilisateur peut annuler cette invitation
    const event = await Event.getById(invitation.event_id);
    if (event.user_id !== userId) {
      throw new Error('Vous ne pouvez pas annuler cette invitation');
    }

    await EventInvitation.deleteInvitation(invitationId);
    return { success: true };
  }

  static generateTempPassword() {
    return Math.random().toString(36).slice(-8).toUpperCase();
  }

  static async sendInvitationEmail(client, event, invitation, tempPassword = null) {
    const subject = `Invitation à l'événement: ${event.nom}`;
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Invitation à un événement privé</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b;">${event.nom}</h3>
          <p style="margin: 5px 0; color: #64748b;">
            <strong>Date:</strong> ${new Date(event.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          ${event.adresse ? `<p style="margin: 5px 0; color: #64748b;"><strong>Lieu:</strong> ${event.adresse}</p>` : ''}
          ${event.prix > 0 ? `<p style="margin: 5px 0; color: #64748b;"><strong>Prix:</strong> ${event.prix}€</p>` : ''}
        </div>
    `;

    if (tempPassword) {
      html += `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">Compte créé automatiquement</h4>
          <p style="margin: 5px 0; color: #92400e;">
            Un compte a été créé pour vous avec les informations suivantes:
          </p>
          <p style="margin: 5px 0; color: #92400e;">
            <strong>Email:</strong> ${client.email}<br>
            <strong>Mot de passe temporaire:</strong> ${tempPassword}
          </p>
          <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
            Veuillez vous connecter et compléter votre profil avant de répondre à l'invitation.
          </p>
        </div>
      `;
    }

    html += `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
            Se connecter et répondre
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          Cette invitation est personnelle et ne peut pas être transférée.
        </p>
      </div>
    `;

    await emailService.sendEmail(client.email, subject, html);
  }
}

module.exports = InvitationService;