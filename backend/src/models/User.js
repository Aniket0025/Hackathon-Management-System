const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['organizer', 'participant', 'judge', 'admin'], default: 'participant' },
    organization: { type: String },
    // Extended profile fields
    location: { type: String },
    phone: { type: String },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    social: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
