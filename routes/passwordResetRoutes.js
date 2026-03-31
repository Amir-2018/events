const express = require('express');
const router = express.Router();
const PasswordResetController = require('../controllers/passwordResetController');

// POST /api/password-reset/request - Demander une réinitialisation
router.post('/request', PasswordResetController.requestReset);

// POST /api/password-reset/verify - Vérifier le code
router.post('/verify', PasswordResetController.verifyCode);

// POST /api/password-reset/reset - Réinitialiser le mot de passe
router.post('/reset', PasswordResetController.resetPassword);

module.exports = router;