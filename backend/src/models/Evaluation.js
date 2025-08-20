const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema(
  {
    // extendable score fields; keep flexible
    innovation: { type: Number, min: 0, max: 10 },
    impact: { type: Number, min: 0, max: 10 },
    feasibility: { type: Number, min: 0, max: 10 },
    presentation: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

const EvaluationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scores: { type: ScoreSchema, default: {} },
    comments: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'complete'], default: 'pending', index: true },
  },
  { timestamps: true }
);

EvaluationSchema.index({ event: 1, team: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('Evaluation', EvaluationSchema);
