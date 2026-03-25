const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public (no token)
router.post('/events', eventController.createEvent.bind(eventController));
router.delete('/events/:eventId', eventController.deleteEvent.bind(eventController));
router.get('/events/:eventId/clients', eventController.getEventClients.bind(eventController));

// Protected (token required)
router.get('/events', authMiddleware, eventController.getEvents.bind(eventController));
router.get(
  '/events/:eventId',
  authMiddleware,
  eventController.getEventDetails.bind(eventController)
);
router.post(
  '/events/:eventId/register',
  authMiddleware,
  eventController.registerToEvent.bind(eventController)
);

module.exports = router;
