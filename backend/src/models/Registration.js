const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say', ''], default: '' },
    instituteName: { type: String, default: '' },
    type: { type: String, enum: ['college_student', 'professional', 'school_student', 'fresher', 'other', ''], default: '' },
    domain: { type: String, enum: ['management', 'engineering', 'arts_science', 'medicine', 'law', 'other', ''], default: '' },
    bio: { type: String, default: '' },
    graduatingYear: { type: String, enum: ['2026', '2027', '2028', '2029', ''], default: '' },
    courseDuration: { type: String, enum: ['2', '3', '4', '5', ''], default: '' },
    differentlyAbled: { type: String, enum: ['no', 'yes', ''], default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    eventName: { type: String, index: true },
    registrationType: { type: String, enum: ['individual', 'team'], required: true },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, default: '' },
      organization: { type: String, default: '' },
      experience: { type: String, default: '' },
      bio: { type: String, default: '' },
      gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say', ''], default: '' },
      instituteName: { type: String, default: '' },
      type: { type: String, enum: ['college_student', 'professional', 'school_student', 'fresher', 'other', ''], default: '' },
      domain: { type: String, enum: ['management', 'engineering', 'arts_science', 'medicine', 'law', 'other', ''], default: '' },
      graduatingYear: { type: String, enum: ['2026', '2027', '2028', '2029', ''], default: '' },
      courseDuration: { type: String, enum: ['2', '3', '4', '5', ''], default: '' },
      differentlyAbled: { type: String, enum: ['no', 'yes', ''], default: '' },
      location: { type: String, default: '' },
    },
    teamInfo: {
      teamName: { type: String, default: '' },
      teamDescription: { type: String, default: '' },
      lookingForMembers: { type: Boolean, default: false },
      desiredSkills: [{ type: String }],
      members: { type: [memberSchema], default: [] },
    },
    preferences: {
      track: { type: String, default: '' },
      dietaryRestrictions: { type: String, default: '' },
      tshirtSize: { type: String, default: '' },
      emergencyContact: { type: String, default: '' },
    },
    agreements: {
      termsAccepted: { type: Boolean, required: true },
      codeOfConductAccepted: { type: Boolean, required: true },
      dataProcessingAccepted: { type: Boolean, required: true },
    },
    payment: {
      status: { type: String, enum: ['paid', 'free'], required: false },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
