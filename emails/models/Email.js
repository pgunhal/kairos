const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousEmail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    default: null
  },
  subject: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: [String],
    required: true
  },
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  threadId: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound', 'self'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const Email = mongoose.model('Email', emailSchema);
module.exports = Email;