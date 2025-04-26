const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const alumniController = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');

const { fetchContactsFromFastAPI } = require('../utils/contactFetcher'); 

router.get('/history', protect, jobController.getSearchHistory);

router.post('/analytics/create-search', protect, jobController.createSearch); 


// MAIN CORRECTED /search route
router.post('/search', protect, async (req, res) => {
  try {
    const { role, company, location } = req.body;

    if (!role && !company && !location) {
      return res.status(400).json({ message: 'At least one search field required.' });
    }

    // Build query string for FastAPI
    let queryParts = [];
    if (role) queryParts.push(role);
    if (company) queryParts.push(company);
    if (location) queryParts.push(location);
    const query = queryParts.join(' ');

    console.log('Querying FastAPI with:', query);

    const alumni = await fetchContactsFromFastAPI(query);

    console.log('Received alumni from FastAPI:', alumni.length);

    res.json({ alumni });

  } catch (error) {
    console.error('Error in job search:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

