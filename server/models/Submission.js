const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  handle: { type: String, required: true, lowercase: true, index: true },
  submissionId: { type: Number, unique: true },
  contestId: Number,
  problemIndex: String,
  problemName: String,
  problemRating: Number,
  problemTags: [String],
  verdict: String,
  programmingLanguage: String,
  timeConsumedMillis: Number,
  memoryConsumedBytes: Number,
  createdAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
