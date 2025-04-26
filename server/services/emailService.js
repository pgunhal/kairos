// server/services/emailService.js
const axios = require('axios');
const EmailTemplate = require('../models/Email');

exports.sendEmail = async (userId, from, to, subject, body) => {
  try {
    // Mock email sending - replace with actual API call
    console.log(`Sending email from: ${from}`);
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    const res = await axios.post(process.env.EMAIL_API_URL, {
      userId,
      from,
      to,
      subject,
      body
    });

    if (res.status !== 200) {
      throw new Error(`Failed to send email: ${res.statusText}`);
    }
    
    // Return success response
    return { success: true, messageId: `mock-${Date.now()}` };
  } catch (error) {
    throw new Error(`Email API error: ${error.message}`);
  }
};

exports.getDefaultTemplate = async () => {
  try {
    const template = await EmailTemplate.findOne({ isDefault: true });
    if (!template) {
      // Create default template if none exists
      return EmailTemplate.create({
        name: 'Default Network Request',
        subject: 'Connecting with a Fellow Alumni',
        body: 'Dear {{name}},\n\nI hope this email finds you well. I am a fellow alumni interested in learning more about your experience as a {{jobTitle}} at {{company}}.\n\nWould you be available for a brief conversation to discuss your career path and any advice you might have?\n\nThank you for your time,\n{{senderName}}',
        isDefault: true
      });
    }
    return template;
  } catch (error) {
    throw new Error(`Template error: ${error.message}`);
  }
};


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
