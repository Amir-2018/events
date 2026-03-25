const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// Route pour l'upload d'image
router.post('/upload/image', 
  uploadController.uploadSingle(),
  uploadController.uploadImage.bind(uploadController)
);

module.exports = router;