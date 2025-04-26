
// server/controllers/jobController.js
const jobApiService = require('../services/jobApiService');
const Search = require('../models/Search');
const { fetchContactsFromFastAPI } = require('../utils/contactFetcher');


exports.searchJobs = async (req, res) => {
  try {
    const { role } = req.body; // Get the role from search form

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Call alumniController to fetch matching alumni
    const response = await alumniController.findAlumniByJobDirect(role);

    res.json({ alumni: response });
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
    res.status(500).json({ message: '2 error', error: error.message });
  }
};
