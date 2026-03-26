const express = require('express');
const PropertyController = require('../controllers/propertyController');

const router = express.Router();

// Routes pour les biens
router.post('/', PropertyController.createProperty);
router.get('/', PropertyController.getProperties);
router.get('/:id', PropertyController.getProperty);
router.put('/:id', PropertyController.updateProperty);
router.delete('/:id', PropertyController.deleteProperty);

module.exports = router;