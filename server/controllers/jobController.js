
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
  
      // Eventually you can do: const jobs = await Alumni.find(query);
  
      // DUMMY response for now:
      res.json({ search: "dummy-search-id", jobs: ["Software Engineer", "Software Engineer Intern", "ML Intern"] });
  
    } catch (error) {
      res.status(500).json({ message: '1 error', error: error.message });
    }
  };
  

exports.getSearchHistory = async (req, res) => {
  try {
    // const searches = await Search.find({ userId: req.user.id })
    //   .sort({ timestamp: -1 });
    
    // res.json(searches);
    res.json({search: search._id, jobs: ["SDE Intern", "ML Intern"]});

  } catch (error) {
    res.status(500).json({ message: '2 error', error: error.message });
  }
};
