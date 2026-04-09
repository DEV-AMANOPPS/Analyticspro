const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  handle: { type: String, required: true, unique: true, lowercase: true },
  rank: String,
  rating: Number,
  maxRating: Number,
  maxRank: String,
  firstName: String,
  lastName: String,
  country: String,
  organization: String,
  avatar: String,
  titlePhoto: String,
  contribution: Number,
  friendOfCount: Number,
  registrationTimeSeconds: Number,
  lastOnlineTimeSeconds: Number,
  // Cached analytics
  cachedStats: {
    topicBreakdown: Object,
    difficultyBreakdown: Object,
    totalSolved: Number,
    totalSubmissions: Number,
    heatmap: Object,
    topicProblems: Object,
    lastFetched: Date,
  },
  cachedContests: Array,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
