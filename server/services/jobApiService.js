// server/services/jobApiService.js
const axios = require('axios');

// This is a placeholder for your job search API
// Replace with actual API implementation
exports.searchJobs = async (query) => {
  try {
    // This is where you'd integrate with a job API
    // For now, return mock data
    return {
      results: [
        { id: 1, title: 'Software Engineer', company: 'Tech Co' },
        { id: 2, title: 'Data Scientist', company: 'Data Corp' },
        { id: 3, title: 'Product Manager', company: 'Product Inc' }
      ]
    };
  } catch (error) {
    throw new Error(`Job API error: ${error.message}`);
  }
};

// server/controllers/jobController.js
const jobApiService = require('../services/jobApiService');
const Search = require('../models/Search');

exports.searchJobs = async (req, res) => {
  try {
    const { query } = req.body;
    
    // Save search to database
    const search = await Search.create({
      userId: req.user.id,
      jobTitle: query
    });
    
    // Get jobs from API service
    const jobs = await jobApiService.searchJobs(query);
    
    res.json({ search: search._id, jobs: jobs.results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSearchHistory = async (req, res) => {
  try {
    const searches = await Search.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    
    res.json(searches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// server/controllers/alumniController.js
const Alumni = require('../models/Alumni');

exports.findAlumniByJob = async (req, res) => {
  try {
    const { jobTitle } = req.params;
    
    // Find alumni with matching job title
    const alumni = await Alumni.find({ 
      jobTitle: { $regex: jobTitle, $options: 'i' } 
    });
    
    // Update search results count
    if (req.query.searchId) {
      await Search.findByIdAndUpdate(req.query.searchId, {
        resultsCount: alumni.length
      });
    }
    
    res.json({ alumni });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.trackAlumniContact = async (req, res) => {
  try {
    const { alumniId } = req.params;
    
    // Add user to contacted list
    const alumni = await Alumni.findByIdAndUpdate(
      alumniId,
      { 
        $push: { 
          contactedBy: { 
            userId: req.user.id, 
            timestamp: new Date() 
          } 
        } 
      },
      { new: true }
    );
    
    // Update search email sent count if search ID provided
    if (req.body.searchId) {
      await Search.findByIdAndUpdate(
        req.body.searchId,
        { $inc: { emailsSent: 1 } }
      );
    }
    
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/search', protect, jobController.searchJobs);
router.get('/history', protect, jobController.getSearchHistory);

module.exports = router;

// server/routes/alumniRoutes.js
const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');

router.get('/job/:jobTitle', protect, alumniController.findAlumniByJob);
router.post('/contact/:alumniId', protect, alumniController.trackAlumniContact);

module.exports = router;