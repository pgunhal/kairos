const Search = require('../models/Search');
const alumniController = require('./alumniController');
const { fetchContactsFromFastAPI } = require('../utils/contactFetcher');

exports.searchJobs = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const alumni = await alumniController.findAlumniByJobDirect(role);
    res.json({ alumni });

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
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

// ✨ NEW: Create a Search record when user searches
exports.createSearch = async (req, res) => {
  try {
    const { jobTitle, resultsCount } = req.body;
    const search = await Search.create({
      userId: req.user.id,
      jobTitle,
      resultsCount,
      emailsSent: 0,
      timestamp: new Date()
    });
    res.status(201).json(search);
  } catch (error) {
    res.status(500).json({ message: 'Error creating search', error: error.message });
  }
};
