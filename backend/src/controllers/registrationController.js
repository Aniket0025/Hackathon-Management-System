const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');
const User = require('../models/User');
const DraftRegistration = require('../models/DraftRegistration');

async function registerForEvent(req, res, next) {
  try {
    const { id } = req.params; // event id
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.organizer) return res.status(400).json({ message: 'Registration only allowed for organizer-created events' });
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    const payload = req.body || {};
    // Minimal validation
    if (!payload?.registrationType || !['individual', 'team'].includes(payload.registrationType)) {
      return res.status(400).json({ message: 'Invalid registration type' });
    }

    const p = payload.personalInfo || {};
    const a = payload.agreements || {};
    if (!p.firstName || !p.lastName || !p.email) {
      return res.status(400).json({ message: 'Missing required personal information' });
    }
    if (!a.termsAccepted || !a.codeOfConductAccepted || !a.dataProcessingAccepted) {
      return res.status(400).json({ message: 'All agreements must be accepted' });
    }

    // Block judges from registering
    if (req.user?.role === 'judge') {
      return res.status(403).json({ message: 'Judges are not allowed to register for events' });
    }
    // Also block if the provided email belongs to a judge account
    const existingUser = await User.findOne({ email: (p.email || '').toLowerCase() }).select('role');
    if (existingUser && existingUser.role === 'judge') {
      return res.status(403).json({ message: 'This email belongs to a judge account which cannot register for events' });
    }

    if (payload.registrationType === 'team') {
      const t = payload.teamInfo || {};
      if (!t.teamName) return res.status(400).json({ message: 'Team name is required for team registration' });
    }

    // include eventName for easier filtering
    const reg = await Registration.create({ ...payload, event: id, eventName: event.title });

    // If this is a team registration, upsert a Team entry linked to the event
    if (payload.registrationType === 'team' && payload.teamInfo?.teamName) {
      await Team.findOneAndUpdate(
        { name: payload.teamInfo.teamName, event: id },
        { name: payload.teamInfo.teamName, event: id, eventName: event.title },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    res.status(201).json({ registration: reg });
  } catch (err) {
    next(err);
  }
}

async function listMyRegistrations(req, res, next) {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'email query param is required' });
    const full = (req.query.full || '').toString().toLowerCase() === 'true';

    let query = Registration.find({ 'personalInfo.email': email }).sort({ createdAt: -1 });
    if (!full) {
      query = query.select({
        event: 1,
        eventName: 1,
        registrationType: 1,
        teamInfo: 1,
        createdAt: 1,
        _id: 1,
      });
    }
    const regs = await query.lean();

    res.json({ registrations: regs });
  } catch (err) {
    next(err);
  }
}

// Save or update a draft registration (upsert by event + email)
async function saveDraftRegistration(req, res, next) {
  try {
    const { id } = req.params; // event id
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const payload = req.body || {};
    const email = (payload.email || payload?.personalInfo?.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'An email is required to save draft' });

    const doc = await DraftRegistration.findOneAndUpdate(
      { event: id, email },
      {
        event: id,
        eventName: event.title,
        email,
        registrationType: payload.registrationType || 'team',
        personalInfo: payload.personalInfo || {},
        teamInfo: payload.teamInfo || {},
        preferences: payload.preferences || {},
        agreements: payload.agreements || {},
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ draft: doc });
  } catch (err) {
    next(err);
  }
}

// Get draft registration by event + email
async function getDraftRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'email query param is required' });
    const draft = await DraftRegistration.findOne({ event: id, email }).lean();
    if (!draft) return res.status(404).json({ message: 'No draft found' });
    res.json({ draft });
  } catch (err) {
    next(err);
  }
}

// Delete draft registration by event + email
async function deleteDraftRegistration(req, res, next) {
  try {
    const { id } = req.params;
    const email = (req.query.email || req.body?.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'email is required' });
    await DraftRegistration.deleteOne({ event: id, email });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerForEvent, listMyRegistrations, saveDraftRegistration, getDraftRegistration, deleteDraftRegistration };
