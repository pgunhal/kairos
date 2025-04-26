
// server/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.get('/templates', protect, emailController.getTemplates);
router.post('/templates', protect, emailController.createTemplate);
router.post('/draft', protect, emailController.draftEmail);
router.post('/send', protect, emailController.sendEmail);

module.exports = router;
