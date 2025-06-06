const mongoose = require('mongoose');


const mailboxSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  googleEmail: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  historyId: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Never send the refresh token in responses
mailboxSchema.methods.toJSON = function() {
  const mailbox = this.toObject();
  delete mailbox.refreshToken;
  return mailbox;
};

const Mailbox = mongoose.model('Mailbox', mailboxSchema);
module.exports = Mailbox;