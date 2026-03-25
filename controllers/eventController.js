const eventService = require('../services/eventService');

class EventController {
  async getEvents(req, res) {
    try {
      const events = await eventService.getEvents();
      res.json({ 
        success: true, 
        data: events 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new EventController();
