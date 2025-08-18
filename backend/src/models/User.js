const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['organizer', 'participant', 'judge', 'admin'], default: 'participant' },
    organization: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
