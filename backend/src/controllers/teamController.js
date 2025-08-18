const Team = require('../models/Team');
const Event = require('../models/Event');

async function listTeams(req, res, next) {
  try {
    const { eventId, eventName } = req.query;
    const filter = {};
    if (eventId) filter.event = eventId;
    if (eventName) filter.eventName = eventName;
    const teams = await Team.find(filter).populate('members', 'name');
    res.json({ teams });
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const { name, event } = req.body;
    const ev = await Event.findById(event).select('title');
    if (!ev) return res.status(400).json({ message: 'Invalid event' });
    const team = await Team.create({ name, event, eventName: ev.title, members: [req.user.id] });
    res.status(201).json({ team });
  } catch (err) {
    next(err);
  }
}

async function joinTeam(req, res, next) {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.user.id } },
      { new: true }
    ).populate('members', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ team });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTeams, createTeam, joinTeam };
