const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  connectMailbox, 
  checkConnection, 
  revokeConnection,
  getAuthUrl 
} = require('../controllers/mailboxController');

// All routes are protected
router.get('/auth-url', protect, getAuthUrl);
router.post('/connect', protect, connectMailbox);
router.get('/status', protect, checkConnection);
router.delete('/revoke', protect, revokeConnection);

module.exports = router;