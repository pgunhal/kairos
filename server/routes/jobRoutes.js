// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/search', protect, jobController.searchJobs);
router.get('/history', protect, jobController.getSearchHistory);

module.exports = router;
