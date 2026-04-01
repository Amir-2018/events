const express = require('express');
const PropertyController = require('../controllers/propertyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Routes pour les biens
router.post('/', authMiddleware, PropertyController.createProperty);
router.get('/', authMiddleware, PropertyController.getProperties);
router.get('/:id', authMiddleware.optional, PropertyController.getProperty);
router.put('/:id', authMiddleware, PropertyController.updateProperty);
router.delete('/:id', authMiddleware, PropertyController.deleteProperty);

module.exports = router;