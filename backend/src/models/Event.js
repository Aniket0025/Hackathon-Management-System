const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    // Event mode: how participants attend
    mode: { type: String, enum: ['online', 'onsite', 'hybrid'], default: 'onsite' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'upcoming', 'ongoing', 'completed'], default: 'draft' },
    fees: { type: Number, default: 0 },
    website: { type: String },
    registrationDeadline: { type: Date },
    participantType: { type: String, enum: ['individual', 'group'], default: 'individual' },
    // Team size constraints (only relevant when participantType is 'group')
    minTeamSize: { type: Number, min: 1, default: 1 },
    maxTeamSize: { type: Number, min: 1, default: 6 },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    registrationLimit: { type: Number, min: 0 },
    bannerUrl: { type: String },

    // New structured content
    themes: [{ type: String }],
    tracks: [{ type: String }],
    rules: { type: String },
    rounds: [
      new mongoose.Schema(
        {
          title: { type: String, required: true },
          description: { type: String },
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
        },
        { _id: false }
      ),
    ],
    prizes: [
      new mongoose.Schema(
        {
          type: { type: String, enum: ['cash', 'certificate', 'goodies', 'other'], default: 'cash' },
          title: { type: String, required: true },
          amount: { type: Number },
        },
        { _id: false }
      ),
    ],
    sponsors: [
      new mongoose.Schema(
        {
          title: { type: String, required: true },
          bannerUrl: { type: String },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

// Ensure maxTeamSize >= minTeamSize when both are provided
eventSchema.pre('validate', function (next) {
  if (this.minTeamSize && this.maxTeamSize && this.maxTeamSize < this.minTeamSize) {
    this.invalidate('maxTeamSize', 'maxTeamSize must be greater than or equal to minTeamSize');
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
