const Alumni = require('../models/Alumni');
const EmailTemplate = require('../models/Email');
const User = require('../models/User');
const Search = require('../models/Search'); // ✅ don't forget
const emailService = require('../services/emailService'); // ✅ added!

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
  const { role, company, experienceLevel } = req.body;
  const generatedBody = `
    Hi {{name}},

    I'm reaching out as a ${experienceLevel} candidate interested in ${role} opportunities at ${company}.
    I'd love to connect and hear more about your experience!

    Best,
    {{senderName}}
  `;
  res.json({ body: generatedBody });
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

// FINAL UPDATED sendEmail
exports.sendEmail = async (req, res) => {
  try {
    const { email, name, jobTitle, company, location, linkedin_url, templateId, searchId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address required.' });
    }

    let alumni = await Alumni.findOne({ email });

    if (alumni) {
      const alreadyContacted = alumni.contactedBy.some(
        contact => contact.userId.toString() === req.user.id
      );
      if (alreadyContacted) {
        return res.status(400).json({ message: 'You have already contacted this alumni.' });
      }
    } else {
      alumni = await Alumni.create({
        name,
        jobTitle,
        company,
        location,
        email,
        linkedin_url,
        contactedBy: [],
      });
    }

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

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

    const emailResult = await emailService.sendEmail(email, subject, body);

    alumni.contactedBy.push({
      userId: req.user.id,
      timestamp: new Date()
    });
    await alumni.save();

    if (searchId) {
      await Search.findByIdAndUpdate(searchId, { $inc: { emailsSent: 1 } });
    }

    res.json({ success: true, message: 'Email sent and recorded', result: emailResult });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
