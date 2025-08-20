const mongoose = require('mongoose');

const draftMemberSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    gender: { type: String, default: '' },
    instituteName: { type: String, default: '' },
    type: { type: String, default: '' },
    domain: { type: String, default: '' },
    bio: { type: String, default: '' },
    graduatingYear: { type: String, default: '' },
    courseDuration: { type: String, default: '' },
    differentlyAbled: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const draftRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    eventName: { type: String },
    // Key to identify draft owner
    email: { type: String, required: true, lowercase: true, index: true },

    registrationType: { type: String, default: 'team' },
    personalInfo: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      organization: { type: String, default: '' },
      experience: { type: String, default: '' },
      bio: { type: String, default: '' },
      gender: { type: String, default: '' },
      instituteName: { type: String, default: '' },
      type: { type: String, default: '' },
      domain: { type: String, default: '' },
      graduatingYear: { type: String, default: '' },
      courseDuration: { type: String, default: '' },
      differentlyAbled: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    teamInfo: {
      teamName: { type: String, default: '' },
      teamDescription: { type: String, default: '' },
      lookingForMembers: { type: Boolean, default: false },
      desiredSkills: [{ type: String }],
      teamSize: { type: Number },
      members: { type: [draftMemberSchema], default: [] },
    },
    preferences: {
      track: { type: String, default: '' },
      dietaryRestrictions: { type: String, default: '' },
      tshirtSize: { type: String, default: '' },
      emergencyContact: { type: String, default: '' },
    },
    agreements: {
      termsAccepted: { type: Boolean, default: false },
      codeOfConductAccepted: { type: Boolean, default: false },
      dataProcessingAccepted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Ensure one draft per (event,email)
draftRegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('DraftRegistration', draftRegistrationSchema);
