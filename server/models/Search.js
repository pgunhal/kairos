
// server/models/Search.js
const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  emailsSent: {
    type: Number,
    default: 0
  }
});

const Search = mongoose.model('Search', searchSchema);
module.exports = Search;
