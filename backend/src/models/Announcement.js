const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    author: { type: String, default: 'Admin', trim: true },
    pinned: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    bannerUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);
