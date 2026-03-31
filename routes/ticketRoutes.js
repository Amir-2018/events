const express = require('express');
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Routes publiques (pour la vérification par QR code)
router.get('/tickets/:ticketNumber', authMiddleware.optional, ticketController.getTicket.bind(ticketController));

// Routes protégées
router.get('/my-tickets', authMiddleware, ticketController.getMyTickets.bind(ticketController));
router.get('/event-tickets-stats', authMiddleware, ticketController.getEventTicketsStats.bind(ticketController));
router.get('/events/:eventId/tickets', authMiddleware, ticketController.getEventTicketsList.bind(ticketController));
router.get('/fraud-attempts', authMiddleware, ticketController.getFraudAttempts.bind(ticketController));
router.post('/tickets/:ticketNumber/verify', authMiddleware, ticketController.verifyTicket.bind(ticketController));
router.put('/tickets/:ticketId/cancel', authMiddleware, ticketController.cancelTicket.bind(ticketController));

module.exports = router;