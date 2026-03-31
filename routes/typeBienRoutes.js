const express = require('express');
const typeBienController = require('../controllers/typeBienController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, typeBienController.createTypeBien.bind(typeBienController));
router.get('/', authMiddleware.optional, typeBienController.getAllTypeBiens.bind(typeBienController));
router.get('/:id', authMiddleware.optional, typeBienController.getTypeBienById.bind(typeBienController));
router.put('/:id', authMiddleware, typeBienController.updateTypeBien.bind(typeBienController));
router.delete('/:id', authMiddleware, typeBienController.deleteTypeBien.bind(typeBienController));

module.exports = router;
