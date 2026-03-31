const Event = require('../models/event.model');

class EventService {
  static async createEvent(eventData) {
    // Validation des données
    if (!eventData.nom || !eventData.nom.trim()) {
      throw new Error('Le nom de l\'événement est obligatoire');
    }

    // Validation de la date si fournie
    if (eventData.date) {
      const eventDate = new Date(eventData.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Format de date de début invalide');
      }
    }

    if (eventData.date_fin) {
      const eventDateFin = new Date(eventData.date_fin);
      if (isNaN(eventDateFin.getTime())) {
        throw new Error('Format de date de fin invalide');
      }
      
      if (eventData.date && eventDateFin < new Date(eventData.date)) {
        throw new Error('La date de fin ne peut pas être antérieure à la date de début');
      }
    }

    // Validation des IDs si fournis
    if (eventData.type_evenement_id && !this.isValidUUID(eventData.type_evenement_id)) {
      throw new Error('ID du type d\'événement invalide');
    }

    if (eventData.bien_id && !this.isValidUUID(eventData.bien_id)) {
      throw new Error('ID du bien invalide');
    }

    return await Event.create(eventData);
  }

  static async getAllEvents(userId = null) {
    return await Event.getAll(userId);
  }

  static async getEventById(id) {
    if (!id) {
      throw new Error('ID de l\'événement requis');
    }

    if (!this.isValidUUID(id)) {
      throw new Error('ID de l\'événement invalide');
    }
    
    const event = await Event.getById(id);
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    return event;
  }

  static async updateEvent(id, eventData) {
    if (!id) {
      throw new Error('ID de l\'événement requis');
    }

    if (!this.isValidUUID(id)) {
      throw new Error('ID de l\'événement invalide');
    }

    // Vérifier que l'événement existe
    const existingEvent = await Event.getById(id);
    if (!existingEvent) {
      throw new Error('Événement non trouvé');
    }

    // Validation des données
    if (eventData.nom !== undefined && (!eventData.nom || !eventData.nom.trim())) {
      throw new Error('Le nom de l\'événement est obligatoire');
    }

    if (eventData.date) {
      const eventDate = new Date(eventData.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Format de date de début invalide');
      }
    }

    if (eventData.date_fin) {
      const eventDateFin = new Date(eventData.date_fin);
      if (isNaN(eventDateFin.getTime())) {
        throw new Error('Format de date de fin invalide');
      }
      
      const startDate = eventData.date || existingEvent.date;
      if (startDate && eventDateFin < new Date(startDate)) {
        throw new Error('La date de fin ne peut pas être antérieure à la date de début');
      }
    }

    if (eventData.type_evenement_id && !this.isValidUUID(eventData.type_evenement_id)) {
      throw new Error('ID du type d\'événement invalide');
    }

    if (eventData.bien_id && !this.isValidUUID(eventData.bien_id)) {
      throw new Error('ID du bien invalide');
    }
    
    // Check ownership if it's not a superadmin
    if (eventData.requestingUserRole !== 'superadmin' && existingEvent.user_id !== eventData.requestingUserId) {
      throw new Error('Vous n\'avez pas la permission de modifier cet événement');
    }

    return await Event.update(id, eventData);
  }

  static async deleteEvent(id, options = null) {
    if (!id) {
      throw new Error('ID de l\'événement requis');
    }

    if (!this.isValidUUID(id)) {
      throw new Error('ID de l\'événement invalide');
    }

    const event = await Event.getById(id);
    if (!event) {
      throw new Error('Événement non trouvé');
    }
    
    // Check ownership if it's not a superadmin
    if (options?.requestingUserRole !== 'superadmin' && event.user_id !== options?.requestingUserId) {
      throw new Error('Vous n\'avez pas la permission de supprimer cet événement');
    }

    return await Event.delete(id);
  }

  static async getEventClients(eventId) {
    if (!eventId) {
      throw new Error('ID de l\'événement requis');
    }

    if (!this.isValidUUID(eventId)) {
      throw new Error('ID de l\'événement invalide');
    }

    // Vérifier que l'événement existe
    const event = await Event.getById(eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    return await Event.getEventClients(eventId);
  }

  static async registerClientToEvent(eventId, clientId) {
    if (!eventId || !clientId) {
      throw new Error('ID de l\'événement et du client requis');
    }

    if (!this.isValidUUID(eventId) || !this.isValidUUID(clientId)) {
      throw new Error('IDs invalides');
    }

    // Vérifier que l'événement existe
    const event = await Event.getById(eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    // Vérifier la capacité maximale
    if (event.max_participants > 0) {
      const currentClients = await Event.getEventClients(eventId);
      if (currentClients.length >= event.max_participants) {
        throw new Error('La capacité maximale de cet événement est atteinte');
      }
    }

    return await Event.registerClient(eventId, clientId);
  }

  static async getRegistrationsByClient(clientId) {
    if (!this.isValidUUID(clientId)) {
      throw new Error('ID client invalide');
    }
    return await Event.getRegistrationsByClient(clientId);
  }

  static async unregisterClientFromEvent(eventId, clientId) {
    if (!eventId || !clientId) {
      throw new Error('ID de l\'événement et du client requis');
    }

    if (!this.isValidUUID(eventId) || !this.isValidUUID(clientId)) {
      throw new Error('IDs invalides');
    }

    const event = await Event.getById(eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    if (new Date(event.date) <= new Date()) {
      throw new Error('Vous ne pouvez pas annuler l\'inscription à un événement passé');
    }

    return await Event.unregisterClient(eventId, clientId);
  }

  // Souvenirs methods
  static async addSouvenir(eventId, url, type) {
    if (!eventId || !url || !type) {
      throw new Error('Informations du souvenir manquantes');
    }
    if (!this.isValidUUID(eventId)) {
      throw new Error('ID de l\'événement invalide');
    }
    return await Event.addSouvenir(eventId, url, type);
  }

  static async getSouvenirs(eventId) {
    if (!eventId || !this.isValidUUID(eventId)) {
      throw new Error('ID de l\'événement invalide');
    }
    return await Event.getSouvenirs(eventId);
  }

  static async deleteSouvenir(souvenirId) {
    if (!souvenirId || !this.isValidUUID(souvenirId)) {
      throw new Error('ID du souvenir invalide');
    }
    return await Event.deleteSouvenir(souvenirId);
  }

  // Méthodes de recherche et filtrage
  static async getEventsByType(typeId) {
    if (!typeId) {
      throw new Error('ID du type d\'événement requis');
    }

    if (!this.isValidUUID(typeId)) {
      throw new Error('ID du type d\'événement invalide');
    }

    return await Event.getByType(typeId);
  }

  static async getEventsByProperty(propertyId) {
    if (!propertyId) {
      throw new Error('ID du bien requis');
    }

    if (!this.isValidUUID(propertyId)) {
      throw new Error('ID du bien invalide');
    }

    return await Event.getByProperty(propertyId);
  }

  static async searchEvents(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
      return await this.getAllEvents();
    }

    return await Event.search(searchTerm.trim());
  }

  // Méthodes utilitaires
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Statistiques
  static async getEventStats(userId = null) {
    const allEvents = await Event.getAll(userId);
    const now = new Date();
    
    const stats = {
      total: allEvents.length,
      finished: 0,
      inProgress: 0,
      upcoming: 0,
      withType: allEvents.filter(e => e.type_evenement_id).length,
      withProperty: allEvents.filter(e => e.bien_id).length,
      byType: {},
      byProperty: {}
    };

    allEvents.forEach(event => {
      // Calcul du statut
      const startDate = event.date ? new Date(event.date) : null;
      const endDate = event.date_fin ? new Date(event.date_fin) : (startDate ? new Date(startDate.getTime() + 2 * 60 * 60 * 1000) : null);
      
      if (endDate && endDate < now) {
        stats.finished++;
      } else if (startDate && startDate <= now && (!endDate || endDate >= now)) {
        stats.inProgress++;
      } else {
        stats.upcoming++;
      }

      // Grouper par type
      if (event.type_evenement_nom) {
        stats.byType[event.type_evenement_nom] = (stats.byType[event.type_evenement_nom] || 0) + 1;
      }

      // Grouper par bien
      if (event.bien_nom) {
        stats.byProperty[event.bien_nom] = (stats.byProperty[event.bien_nom] || 0) + 1;
      }
    });

    return stats;
  }

  // Statistiques de revenus avec tickets
  static async getRevenueStats(userId = null) {
    try {
      const pool = require('../db/pool');
      
      let query = `
        SELECT 
          e.id as event_id,
          e.nom as event_name,
          e.prix as ticket_price,
          e.date as event_date,
          COUNT(t.id) as total_tickets,
          SUM(CASE WHEN t.status = 'active' THEN 1 ELSE 0 END) as active_tickets,
          SUM(CASE WHEN t.status = 'verified' THEN 1 ELSE 0 END) as verified_tickets,
          SUM(CASE WHEN t.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_tickets,
          (COUNT(t.id) * COALESCE(e.prix, 0)) as potential_revenue,
          (SUM(CASE WHEN t.status = 'verified' THEN 1 ELSE 0 END) * COALESCE(e.prix, 0)) as confirmed_revenue
        FROM events e
        LEFT JOIN tickets t ON e.id = t.event_id
      `;
      
      let params = [];
      
      if (userId) {
        query += ' WHERE e.user_id = ?';
        params.push(userId);
      }
      
      query += `
        GROUP BY e.id, e.nom, e.prix, e.date
        ORDER BY e.date DESC
      `;
      
      const result = await pool.query(query, params);
      
      // Calculer les totaux
      const totals = result.rows.reduce((acc, event) => {
        acc.totalEvents++;
        acc.totalTickets += parseInt(event.total_tickets) || 0;
        acc.activeTickets += parseInt(event.active_tickets) || 0;
        acc.verifiedTickets += parseInt(event.verified_tickets) || 0;
        acc.cancelledTickets += parseInt(event.cancelled_tickets) || 0;
        acc.potentialRevenue += parseFloat(event.potential_revenue) || 0;
        acc.confirmedRevenue += parseFloat(event.confirmed_revenue) || 0;
        
        if (parseFloat(event.ticket_price) > 0) {
          acc.paidEvents++;
        } else {
          acc.freeEvents++;
        }
        
        return acc;
      }, {
        totalEvents: 0,
        totalTickets: 0,
        activeTickets: 0,
        verifiedTickets: 0,
        cancelledTickets: 0,
        potentialRevenue: 0,
        confirmedRevenue: 0,
        paidEvents: 0,
        freeEvents: 0
      });
      
      return {
        events: result.rows,
        totals: totals
      };
      
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de revenus:', error);
      throw error;
    }
  }
}

module.exports = EventService;