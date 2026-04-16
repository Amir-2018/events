const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public (no token required typically, but controller handles optional auth)
router.get('/events', authMiddleware.optional, eventController.getEvents.bind(eventController));
router.get('/events/search', eventController.searchEvents.bind(eventController));
router.get('/events/:eventId', eventController.getEventDetails.bind(eventController));

// Protected (auth required)
router.get('/events/my-registrations', authMiddleware, eventController.getMyRegistrations.bind(eventController));
router.get('/revenue-stats', authMiddleware, eventController.getRevenueStats.bind(eventController));
router.post('/events', authMiddleware, eventController.createEvent.bind(eventController));
router.delete('/events/bulk-delete', authMiddleware, eventController.bulkDeleteEvents.bind(eventController));
router.put('/events/:eventId', authMiddleware, eventController.updateEvent.bind(eventController));
router.delete('/events/:eventId', authMiddleware, eventController.deleteEvent.bind(eventController));
router.get('/events/:eventId/clients', authMiddleware, eventController.getEventClients.bind(eventController));
router.post('/events/:eventId/register', authMiddleware, eventController.registerToEvent.bind(eventController));
router.delete('/events/:eventId/register', authMiddleware, eventController.unregisterFromEvent.bind(eventController));

// Souvenirs routes (protected)
router.post('/events/:eventId/souvenirs', authMiddleware, eventController.addSouvenir.bind(eventController));
router.get('/events/:eventId/souvenirs', eventController.getSouvenirs.bind(eventController));
router.delete('/souvenirs/:souvenirId', authMiddleware, eventController.deleteSouvenir.bind(eventController));

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
