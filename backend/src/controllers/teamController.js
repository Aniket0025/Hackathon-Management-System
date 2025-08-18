const Team = require('../models/Team');

async function listTeams(req, res, next) {
  try {
    const teams = await Team.find({ event: req.query.eventId }).populate('members', 'name');
    res.json({ teams });
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const { name, event } = req.body;
    const team = await Team.create({ name, event, members: [req.user.id] });
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
