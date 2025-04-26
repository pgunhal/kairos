
// server/controllers/analyticsController.js
const Search = require('../models/Search');
const Alumni = require('../models/Alumni');

exports.getUserStats = async (req, res) => {
  try {
    // Get total searches
    const totalSearches = await Search.countDocuments({ userId: req.user.id });
    
    // Get total emails sent
    const searches = await Search.find({ userId: req.user.id });
    const totalEmails = searches.reduce((sum, search) => sum + search.emailsSent, 0);
    
    // Get recent search activity
    const recentSearches = await Search.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(5);
    
    // Get top job titles
    const jobStats = await Search.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$jobTitle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      totalSearches,
      totalEmails,
      recentSearches,
      topJobTitles: jobStats.map(job => ({
        jobTitle: job._id,
        searchCount: job.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
