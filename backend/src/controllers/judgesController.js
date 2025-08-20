const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const JudgeAssignment = require('../models/JudgeAssignment');

// POST /api/judges
// body: { name?, email, password, eventId? }
// Organizer-only
async function createJudge(req, res, next) {
  try {
    const { name, email, password, eventId } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    let judge = await User.findOne({ email });
    if (judge) {
      // If a user exists with this email, allow only if it's already a judge
      if (judge.role !== 'judge') return res.status(409).json({ message: 'Email already in use by a non-judge account' });
    } else {
      const hash = await bcrypt.hash(password, 10);
      judge = await User.create({ name: name || email.split('@')[0], email, password: hash, role: 'judge' });
    }

    let assignment = null;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      assignment = await JudgeAssignment.create({ judge: judge._id, event: event._id, createdBy: req.user.id });
    }

    return res.status(201).json({
      judge: { id: judge._id, name: judge.name, email: judge.email, role: judge.role },
      assignment,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/judges/assign  { judgeId, eventId }
async function assignJudge(req, res, next) {
  try {
    const { judgeId, eventId } = req.body || {};
    if (!judgeId || !eventId) return res.status(400).json({ message: 'judgeId and eventId are required' });

    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== 'judge') return res.status(404).json({ message: 'Judge not found' });
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const assignment = await JudgeAssignment.create({ judge: judge._id, event: event._id, createdBy: req.user.id });
    return res.status(201).json({ assignment });
  } catch (err) { next(err); }
}

// GET /api/judges/assignments
async function listAssignments(req, res, next) {
  try {
    const docs = await JudgeAssignment.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('judge', 'name email')
      .populate('event', 'title');
    const items = docs.map(d => ({
      id: d._id,
      judge: d.judge ? { id: d.judge._id, name: d.judge.name, email: d.judge.email } : null,
      event: d.event ? { id: d.event._id, title: d.event.title } : null,
      createdAt: d.createdAt,
    }));
    return res.json({ assignments: items });
  } catch (err) { next(err); }
}

// GET /api/judges/my-events
// Judge-only: list events assigned to the authenticated judge
async function listMyAssignedEvents(req, res, next) {
  try {
    const judgeId = req.user?.id;
    if (!judgeId) return res.status(401).json({ message: 'Unauthorized' });

    const docs = await JudgeAssignment.find({ judge: judgeId })
      .sort({ createdAt: -1 })
      .populate('event', 'title startDate endDate status bannerUrl location');

    const events = docs
      .filter(d => d.event)
      .map(d => ({
        id: d.event._id,
        title: d.event.title,
        startDate: d.event.startDate,
        endDate: d.event.endDate,
        status: d.event.status,
        bannerUrl: d.event.bannerUrl,
        location: d.event.location,
        assignmentId: d._id,
        assignedAt: d.createdAt,
      }));

    return res.json({ events });
  } catch (err) { next(err); }
}

// GET /api/judges
async function listJudges(req, res, next) {
  try {
    const judges = await User.find({ role: 'judge' }).select('name email').sort({ createdAt: -1 }).limit(200);
    return res.json({ judges: judges.map(j => ({ id: j._id, name: j.name, email: j.email })) });
  } catch (err) { next(err); }
}

module.exports = { createJudge, assignJudge, listAssignments, listMyAssignedEvents, listJudges };
