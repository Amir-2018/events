const express = require('express');
const reclamationController = require('../controllers/reclamationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Superadmin only: Get all reclamations and update status
router.get('/reclamations', authMiddleware, roleMiddleware('superadmin'), reclamationController.getAllReclamations);
router.put('/reclamations/:id/status', authMiddleware, roleMiddleware('superadmin'), reclamationController.updateStatus);

// Public/Client: Create reclamation
router.post('/reclamations', reclamationController.createReclamation);

module.exports = router;
