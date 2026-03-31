const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes protégées (nécessitent une authentification)
router.use(authMiddleware);

// GET /api/profile - Récupérer son propre profil
router.get('/', ProfileController.getProfile);

// GET /api/profile/:id - Récupérer le profil d'un utilisateur (superadmin seulement)
router.get('/:id', ProfileController.getProfile);

// PUT /api/profile - Mettre à jour son propre profil
router.put('/', ProfileController.updateProfile);

// PUT /api/profile/:id - Mettre à jour le profil d'un utilisateur (superadmin seulement)
router.put('/:id', ProfileController.updateProfile);

module.exports = router;