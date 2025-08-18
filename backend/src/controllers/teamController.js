const Team = require('../models/Team');
const Event = require('../models/Event');

async function listTeams(req, res, next) {
  try {
    const { eventId, eventName, q, sort, limit } = req.query;
    const filter = {};
    if (eventId) filter.event = eventId;
    if (eventName) filter.eventName = eventName;
    if (q) filter.name = { $regex: q, $options: 'i' };
    let query = Team.find(filter).populate('members', 'name');
    // Sorting
    if (sort === 'score_desc') {
      query = query.sort({ score: -1 });
    } else if (sort === 'score_asc') {
      query = query.sort({ score: 1 });
    }
    // Limiting
    const lim = Math.min(parseInt(limit, 10) || 0, 100);
    if (lim > 0) query = query.limit(lim);

    const teams = await query;
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
