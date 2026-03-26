const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/:id', authController.getUser.bind(authController));

module.exports = router;
