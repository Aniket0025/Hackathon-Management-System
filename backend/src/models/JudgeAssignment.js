const mongoose = require('mongoose');

const judgeAssignmentSchema = new mongoose.Schema(
  {
    judge: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // organizer
  },
  { timestamps: true }
);

module.exports = mongoose.model('JudgeAssignment', judgeAssignmentSchema);
