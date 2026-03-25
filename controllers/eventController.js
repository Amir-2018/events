const eventService = require('../services/eventService');

class EventController {
  async getEvents(req, res) {
    try {
      const events = await eventService.getEventsWithClients();
      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventDetails(req, res) {
    try {
      const { eventId } = req.params;
      const event = await eventService.getEventDetails({ eventId });
      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getEventClients(req, res) {
    try {
      const { eventId } = req.params;
      const clients = await eventService.getEventClients({ eventId });
      res.json({ success: true, data: clients });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createEvent(req, res) {
    try {
      const { nom, date, image, adresse } = req.body;
      
      // Debug logs
      console.log('=== CREATE EVENT DEBUG ===');
      console.log('Body received:', {
        nom,
        date,
        adresse,
        imageType: typeof image,
        imageLength: image ? image.length : 0,
        imagePreview: image ? image.substring(0, 50) + '...' : 'null'
      });
      
      const event = await eventService.createEvent({ nom, date, image, adresse });
      
      console.log('Event created:', {
        id: event.id,
        nom: event.nom,
        imageStored: event.image ? 'YES' : 'NO',
        imageLength: event.image ? event.image.length : 0
      });
      console.log('=== END DEBUG ===');
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const deleted = await eventService.deleteEvent({ eventId });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, message: 'Event deleted', data: deleted });
    } catch (error) {
      res.status(400).json({
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
          message: 'Please login first',
        });
      }

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: 'Missing eventId',
        });
      }

      const result = await eventService.registerClientToEvent({
        eventId,
        clientId,
      });
      const statusCode = result.alreadyRegistered ? 200 : 201;

      res.status(statusCode).json({
        success: true,
        message: result.alreadyRegistered
          ? 'Already registered to this event'
          : 'Registered to event successfully',
        data: result,
      });
    } catch (error) {
      const status = error.message === 'Event not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new EventController();
