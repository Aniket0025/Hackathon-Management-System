const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    solved: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    answers: { type: [AnswerSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
