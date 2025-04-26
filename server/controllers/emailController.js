const Alumni = require('../models/Alumni');
const EmailTemplate = require('../models/Email');
const User = require('../models/User');
const Search = require('../models/Search'); // ✅ don't forget
const emailService = require('../services/emailService'); // ✅ added!

const { generateEmailContent, editEmailContent } = require('../services/geminiService');


exports.getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({
      $or: [{ isDefault: true }, { createdBy: req.user.id }]
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
      createdBy: req.user.id,
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
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const template = templateId 
      ? await EmailTemplate.findById(templateId)
      : await emailService.getDefaultTemplate();

    const user = await User.findById(req.user.id);

    const subject = template.subject
      .replace(/{{name}}/g, alumni.name)
      .replace(/{{jobTitle}}/g, alumni.jobTitle)
      .replace(/{{company}}/g, alumni.company)
      .replace(/{{senderName}}/g, `${user.firstName} ${user.lastName}`);

    const body = template.body
      .replace(/{{name}}/g, alumni.name)
      .replace(/{{jobTitle}}/g, alumni.jobTitle)
      .replace(/{{company}}/g, alumni.company)
      .replace(/{{senderName}}/g, `${user.firstName} ${user.lastName}`);

    res.json({ to: alumni.email, subject, body });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.generateEmail = async (req, res) => {
    try {
      const { role, company, alumni, tone = 'friendly' } = req.body;
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // If no alumni given, use dummy
      const dummyAlumni = alumni || {
        name: '[Alumni Name]',
        jobTitle: '[JobTitle]',
        company: '[Company]',
        location: '',
        email: '',
        linkedin_url: ''
      };
  
      const emailBody = await generateEmailContent(role, company, user, dummyAlumni, tone);
  
      res.json({ body: emailBody });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error generating AI email', error: error.message });
    }
  };
  

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


exports.sendEmail = async (req, res) => {
    try {
      const { email, name, jobTitle, company, location, linkedin_url, templateId, searchId } = req.body;
  
      if (!email) {
        return res.status(400).json({ message: 'Email address required.' });
      }
  
      let alumni = await Alumni.findOne({ email });
      if (!alumni) {
        alumni = await Alumni.create({
          name,
          jobTitle,
          company,
          location,
          email,
          linkedin_url,
          contactedBy: [],
        });
      } else {
        const alreadyContacted = alumni.contactedBy.some(
          contact => contact.userId.toString() === req.user.id
        );
        if (alreadyContacted) {
          return res.status(400).json({ message: 'You have already contacted this alumni.' });
        }
      }
  
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // ⚡ Generate personalized body by calling LLM dynamically
      const aName = alumni.name || '';
      const roleName = alumni.jobTitle || 'opportunity';
      const companyName = alumni.company || 'the company';
      const subject = template.subject || '[Subject]';
  
      const finalBody = await editEmailContent(template.body, roleName, companyName, user, alumni, 'professional', subject);
  
      const emailResult = await emailService.sendEmail(req.user.id, user.email, email, subject, finalBody);
  
      alumni.contactedBy.push({ userId: req.user.id, timestamp: new Date() });
      await alumni.save();
  
      if (searchId) {
        await Search.findByIdAndUpdate(searchId, { $inc: { emailsSent: 1 } });
      }
  
      res.json({ success: true, message: 'Email sent and recorded', result: emailResult });
  
    } catch (error) {
      console.error(error);
  
      if (error.code === 'MAILBOX_NOT_CONNECTED') {
        return res.status(403).json({ message: 'Mailbox not connected. Please link your mailbox.', redirectToProfile: true });
      }
  
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  