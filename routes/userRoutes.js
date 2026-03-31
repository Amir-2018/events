const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All staff user management is restricted to superadmin
router.get('/users', authMiddleware, roleMiddleware('superadmin'), userController.getAllUsers);
router.post('/users', authMiddleware, roleMiddleware('superadmin'), userController.createUser);
router.patch('/users/:id/status', authMiddleware, roleMiddleware('superadmin'), userController.updateStatus);
router.put('/users/:id', authMiddleware, roleMiddleware('superadmin'), userController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware('superadmin'), userController.deleteUser);
router.get('/roles', authMiddleware, roleMiddleware('superadmin'), userController.getRoles);

module.exports = router;
