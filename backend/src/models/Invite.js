const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientEmail: { type: String, required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    teamName: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled'], default: 'pending', index: true },
    token: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

InviteSchema.index({ recipientEmail: 1, status: 1 });

module.exports = mongoose.model('Invite', InviteSchema);
