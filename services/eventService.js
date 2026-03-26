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
        throw new Error('Format de date invalide');
      }
      
      // Vérifier que la date n'est pas dans le passé (optionnel)
      // const now = new Date();
      // if (eventDate < now) {
      //   throw new Error('La date de l\'événement ne peut pas être dans le passé');
      // }
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

  static async getAllEvents() {
    return await Event.getAll();
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

    // Validation des données (même que pour la création)
    if (eventData.nom !== undefined && (!eventData.nom || !eventData.nom.trim())) {
      throw new Error('Le nom de l\'événement est obligatoire');
    }

    if (eventData.date) {
      const eventDate = new Date(eventData.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Format de date invalide');
      }
    }

    if (eventData.type_evenement_id && !this.isValidUUID(eventData.type_evenement_id)) {
      throw new Error('ID du type d\'événement invalide');
    }

    if (eventData.bien_id && !this.isValidUUID(eventData.bien_id)) {
      throw new Error('ID du bien invalide');
    }

    return await Event.update(id, eventData);
  }

  static async deleteEvent(id) {
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

    return await Event.registerClient(eventId, clientId);
  }

  static async unregisterClientFromEvent(eventId, clientId) {
    if (!eventId || !clientId) {
      throw new Error('ID de l\'événement et du client requis');
    }

    if (!this.isValidUUID(eventId) || !this.isValidUUID(clientId)) {
      throw new Error('IDs invalides');
    }

    return await Event.unregisterClient(eventId, clientId);
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
  static async getEventStats() {
    const allEvents = await Event.getAll();
    
    const stats = {
      total: allEvents.length,
      withType: allEvents.filter(e => e.type_evenement_id).length,
      withProperty: allEvents.filter(e => e.bien_id).length,
      withDate: allEvents.filter(e => e.date).length,
      withImage: allEvents.filter(e => e.image).length,
      byType: {},
      byProperty: {}
    };

    // Grouper par type
    allEvents.forEach(event => {
      if (event.type_evenement_nom) {
        stats.byType[event.type_evenement_nom] = (stats.byType[event.type_evenement_nom] || 0) + 1;
      }
    });

    // Grouper par bien
    allEvents.forEach(event => {
      if (event.bien_nom) {
        stats.byProperty[event.bien_nom] = (stats.byProperty[event.bien_nom] || 0) + 1;
      }
    });

    return stats;
  }
}

module.exports = EventService;