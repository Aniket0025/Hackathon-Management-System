const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true },
    description: { type: String },
    repoUrl: { type: String },
    docsUrl: { type: String },
    videoUrl: { type: String },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'submitted', 'reviewed'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
