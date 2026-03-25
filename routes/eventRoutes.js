const express = require('express');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/events', authMiddleware, eventController.getEvents.bind(eventController));

module.exports = router;
