const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, min: 0, max: 100, required: true },
    feedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
