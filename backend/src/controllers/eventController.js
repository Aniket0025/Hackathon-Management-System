const Event = require('../models/Event');
const JudgeAssignment = require('../models/JudgeAssignment');
const { uploadBuffer } = require('../utils/cloudinary');

async function listEvents(req, res, next) {
  try {
    const { status, organizer } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // If caller is an organizer, force filter to their own events
    if (req.user && req.user.role === 'organizer') {
      filter.organizer = req.user.id;
    } else if (req.user && req.user.role === 'judge') {
      // Judges only see events assigned to them
      const assignments = await JudgeAssignment.find({ judge: req.user.id }).select('event');
      const eventIds = assignments.map(a => a.event).filter(Boolean);
      // If no assignments, return empty list early
      if (!eventIds.length) return res.json({ events: [] });
      filter._id = { $in: eventIds };
    } else if (organizer) {
      // Allow explicit organizer filter only for non-organizers/public
      filter.organizer = organizer;
    }

    const events = await Event.find(filter).sort({ createdAt: -1 }).populate('organizer', 'name');
    res.json({ events });
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // If caller is a judge, ensure they are assigned to this event
    if (req.user && req.user.role === 'judge') {
      const assigned = await JudgeAssignment.exists({ judge: req.user.id, event: event._id });
      if (!assigned) return res.status(403).json({ message: 'Forbidden: not assigned to this event' });
    }
    res.json({ event });
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const data = { ...req.body, organizer: req.user.id };

    // If a banner image was sent, upload to Cloudinary and store its URL
    if (req.file) {
      const folder = `events/${req.user.id}/banners`;
      const uploadResult = await uploadBuffer(req.file.buffer, folder);
      data.bannerUrl = uploadResult.secure_url;
    }

    const event = await Event.create(data);
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const data = { ...req.body };

    if (req.file) {
      const folder = `events/${req.user ? req.user.id : 'unknown'}/banners`;
      const uploadResult = await uploadBuffer(req.file.buffer, folder);
      data.bannerUrl = uploadResult.secure_url;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };
