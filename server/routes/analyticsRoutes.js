
// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/user-stats', protect, analyticsController.getUserStats);

module.exports = router;