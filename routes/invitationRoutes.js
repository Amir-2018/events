const express = require('express');
const invitationController = require('../controllers/invitationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Routes pour les invitations (protégées)
router.post('/events/:eventId/invite', 
  authMiddleware, 
  roleMiddleware(['admin', 'superadmin']), 
  invitationController.inviteClients.bind(invitationController)
);

router.get('/events/:eventId/invitations', 
  authMiddleware, 
  roleMiddleware(['admin', 'superadmin']), 
  invitationController.getEventInvitations.bind(invitationController)
);

router.post('/invitations/:invitationId/respond', 
  authMiddleware, 
  invitationController.respondToInvitation.bind(invitationController)
);

router.get('/my-invitations', 
  authMiddleware, 
  invitationController.getMyInvitations.bind(invitationController)
);

router.delete('/invitations/:invitationId', 
  authMiddleware, 
  roleMiddleware(['admin', 'superadmin']), 
  invitationController.cancelInvitation.bind(invitationController)
);

module.exports = router;