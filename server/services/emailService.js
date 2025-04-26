// server/services/emailService.js
const axios = require('axios');
const EmailTemplate = require('../models/EmailTemplate');

// This is a placeholder for your email API service
// Replace with actual email API (SendGrid, Mailgun, etc.)
exports.sendEmail = async (to, subject, body) => {
  try {
    // Mock email sending - replace with actual API call
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
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

// server/controllers/emailController.js
const emailService = require('../services/emailService');
const Alumni = require('../models/Alumni');
const EmailTemplate = require('../models/EmailTemplate');
const User = require('../models/User');

exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({
      $or: [
        { isDefault: true },
        { createdBy: req.user.id }
      ]
    });
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    
    const template = await EmailTemplate.create({
      name,
      subject,
      body,
      createdBy: req.user.id
    });
    
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.draftEmail = async (req, res) => {
  try {
    const { alumniId, templateId } = req.body;
    
    // Get alumni info
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    
    // Get template
    let template;
    if (templateId) {
      template = await EmailTemplate.findById(templateId);
    } else {
      template = await emailService.getDefaultTemplate();
    }
    
    // Get user info
    const user = await User.findById(req.user.id);
    
    // Replace placeholders in template
    let subject = template.subject;
    let body = template.body
      .replace(/{{name}}/g, alumni.name)
      .replace(/{{jobTitle}}/g, alumni.jobTitle)
      .replace(/{{company}}/g, alumni.company)
      .replace(/{{senderName}}/g, `${user.firstName} ${user.lastName}`);
    
    res.json({
      to: alumni.email,
      subject,
      body
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { alumniId, to, subject, body, searchId } = req.body;
    
    // Send email
    const result = await emailService.sendEmail(to, subject, body);
    
    // Track contact in alumni record
    if (alumniId) {
      await Alumni.findByIdAndUpdate(
        alumniId,
        { 
          $push: { 
            contactedBy: { 
              userId: req.user.id, 
              timestamp: new Date() 
            } 
          } 
        }
      );
    }
    
    // Update search stats if searchId provided
    if (searchId) {
      await Search.findByIdAndUpdate(
        searchId,
        { $inc: { emailsSent: 1 } }
      );
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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

// server/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.get('/templates', protect, emailController.getTemplates);
router.post('/templates', protect, emailController.createTemplate);
router.post('/draft', protect, emailController.draftEmail);
router.post('/send', protect, emailController.sendEmail);

module.exports = router;

// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/user-stats', protect, analyticsController.getUserStats);

module.exports = router;