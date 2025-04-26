
// server/controllers/alumniController.js
const Alumni = require('../models/Alumni');

const { fetchContactsFromFastAPI } = require('../utils/contactFetcher');

exports.findAlumniByJob = async (req, res) => {
  try {
    const { jobTitle } = req.params;

    // Instead of MongoDB, fetch from FastAPI
    const alumni = await fetchContactsFromFastAPI(jobTitle);

    // (Optional: you can log this)
    console.log('Alumni fetched from FastAPI:', alumni);

    // You can still update Search if needed
    if (req.query.searchId) {
      await Search.findByIdAndUpdate(req.query.searchId, {
        resultsCount: alumni.length
      });
    }

    res.json({ alumni });
  } catch (error) {
    console.error('Error in findAlumniByJob:', error.message);
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

exports.findAlumniByJobDirect = async (jobTitle) => {
  const alumni = await fetchContactsFromFastAPI(jobTitle);
  return alumni;
};
