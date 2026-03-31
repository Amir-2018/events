const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/authMiddleware');

// Routes pour la gestion des clients (CRUD)
router.get('/clients', ClientController.getAllClients);
router.get('/clients/:id', ClientController.getClientById);
router.post('/clients', authenticateToken, ClientController.createClient);
router.put('/clients/:id', authenticateToken, ClientController.updateClient);
router.delete('/clients/:id', authenticateToken, ClientController.deleteClient);

// Route pour annuler l'inscription d'un client à un événement
router.delete('/clients/:clientId/events/:eventId/registration', authenticateToken, ClientController.cancelRegistration);

module.exports = router;