const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'upcoming', 'ongoing', 'completed'], default: 'draft' },
    fees: { type: Number, default: 0 },
    website: { type: String },
    registrationDeadline: { type: Date },
    participantType: { type: String, enum: ['individual', 'group'], default: 'individual' },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    registrationLimit: { type: Number, min: 0 },
    bannerUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
