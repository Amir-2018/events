const express = require('express');
const EventTypeController = require('../controllers/eventTypeController');

const router = express.Router();

// Routes pour les types d'événements
router.post('/', EventTypeController.createEventType);
router.get('/', EventTypeController.getEventTypes);
router.get('/:id', EventTypeController.getEventType);
router.put('/:id', EventTypeController.updateEventType);
router.delete('/:id', EventTypeController.deleteEventType);

module.exports = router;