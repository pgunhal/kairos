
// server/routes/alumniRoutes.js
const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');

router.get('/job/:jobTitle', protect, alumniController.findAlumniByJob);
router.post('/contact/:alumniId', protect, alumniController.trackAlumniContact);

module.exports = router;