const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

// Correct route handlers
router.get('/templates', protect, emailController.getTemplates);
router.post('/templates', protect, emailController.createTemplate);
router.post('/draft', protect, emailController.draftEmail);
router.post('/send', protect, emailController.sendEmail);
router.post('/generate', protect, emailController.generateEmail);


// Update template
router.put('/templates/:id', protect, emailController.updateTemplate);

// Delete template
router.delete('/templates/:id', protect, emailController.deleteTemplate);

module.exports = router;



