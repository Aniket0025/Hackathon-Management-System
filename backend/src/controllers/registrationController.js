const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Team = require('../models/Team');

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

module.exports = { registerForEvent };
