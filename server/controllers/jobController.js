
// server/controllers/jobController.js
const jobApiService = require('../services/jobApiService');
const Search = require('../models/Search');

exports.searchJobs = async (req, res) => {
  try {
    const { role, company, location } = req.body;

    const query = {};
    if (role) query.jobTitle = { $regex: role, $options: 'i' };
    if (company) query.company = { $regex: company, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    
    const jobs = await Alumni.find(query); // change to Alumni collection
    
    
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
