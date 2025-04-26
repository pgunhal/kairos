
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