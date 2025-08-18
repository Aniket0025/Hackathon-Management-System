const Event = require('../models/Event');

async function listEvents(req, res, next) {
  try {
    const { status, organizer } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // If caller is an organizer, force filter to their own events
    if (req.user && req.user.role === 'organizer') {
      filter.organizer = req.user.id;
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
    res.json({ event });
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const data = { ...req.body, organizer: req.user.id };
    const event = await Event.create(data);
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
