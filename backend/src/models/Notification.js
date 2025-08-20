const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String },
    type: { type: String, enum: ['info', 'update', 'alert'], default: 'info' },
    link: { type: String },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    recipientUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ recipientUserIds: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
