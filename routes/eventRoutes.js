const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public (no token)
router.get('/events', eventController.getEvents.bind(eventController));
router.get('/events/search', eventController.searchEvents.bind(eventController));
router.get('/events/stats', eventController.getEventStats.bind(eventController));
router.get('/events/by-type/:typeId', eventController.getEventsByType.bind(eventController));
router.get('/events/by-property/:propertyId', eventController.getEventsByProperty.bind(eventController));
router.get('/events/:eventId', eventController.getEventDetails.bind(eventController));
router.post('/events', eventController.createEvent.bind(eventController));
router.put('/events/:eventId', eventController.updateEvent.bind(eventController));
router.delete('/events/:eventId', eventController.deleteEvent.bind(eventController));
router.get('/events/:eventId/clients', eventController.getEventClients.bind(eventController));

// Route de test pour créer un événement avec base64
router.post('/events/test-base64', (req, res) => {
  console.log('=== TEST BASE64 ROUTE ===');
  console.log('Headers:', req.headers);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Body:', {
    nom: req.body.nom,
    date: req.body.date,
    adresse: req.body.adresse,
    type_evenement_id: req.body.type_evenement_id,
    bien_id: req.body.bien_id,
    imageType: typeof req.body.image,
    imageLength: req.body.image ? req.body.image.length : 0,
    imageStart: req.body.image ? req.body.image.substring(0, 30) : 'null'
  });
  
  // Appeler le contrôleur normal
  eventController.createEvent(req, res);
});

// Protected (token required)
router.post(
  '/events/:eventId/register',
  authMiddleware,
  eventController.registerToEvent.bind(eventController)
);

module.exports = router;
