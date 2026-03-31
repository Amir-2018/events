const express = require('express');
const EventTypeController = require('../controllers/eventTypeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Routes pour les types d'événements
router.post('/', authMiddleware, EventTypeController.createEventType);
router.get('/', authMiddleware.optional, EventTypeController.getEventTypes);
router.get('/:id', authMiddleware.optional, EventTypeController.getEventType);
router.put('/:id', authMiddleware, EventTypeController.updateEventType);
router.delete('/:id', authMiddleware, EventTypeController.deleteEventType);

module.exports = router;