
// server/controllers/emailController.js
const emailService = require('../services/emailService');
const Alumni = require('../models/Alumni');
const EmailTemplate = require('../models/Email');
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
        createdBy: req.user.id, // IMPORTANT: save the user who made it
        isDefault: false
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
    const { alumniId, from, to, subject, body, searchId } = req.body;
    
    // Send email
    const result = await emailService.sendEmail(req.user.id, from, to, subject, body);
    
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


exports.generateEmail = async (req, res) => {
    const { role, company, experienceLevel, tone } = req.body;

    const generatedBody = `
      Hi {{name}},
  
      I'm reaching out as a ${experienceLevel} candidate interested in ${role} opportunities at ${company}.
      I'd love to connect and hear more about your experience!
  
      Best,
      {{senderName}}
    `;
  
    res.json({ body: generatedBody });
  };
  

  // Update a template
exports.updateTemplate = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, subject, body } = req.body;
  
      const updated = await EmailTemplate.findByIdAndUpdate(
        id,
        { name, subject, body },
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ message: 'Template not found' });
      }
  
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Delete a template
  exports.deleteTemplate = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deleted = await EmailTemplate.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ message: 'Template not found' });
      }
  
      res.json({ message: 'Template deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  