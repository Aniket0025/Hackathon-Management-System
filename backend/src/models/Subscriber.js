const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    source: { type: String, default: 'homepage' },
    meta: {
      userAgent: String,
      ip: String,
    },
  },
  { timestamps: true }
);

// Unique index for faster dedupe
SubscriberSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
