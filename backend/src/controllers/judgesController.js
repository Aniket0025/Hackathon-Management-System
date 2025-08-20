const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const JudgeAssignment = require('../models/JudgeAssignment');
const Review = require('../models/Review');

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
      if (String(event.organizer) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden: not your event' });
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

    if (String(event.organizer) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden: not your event' });
    const assignment = await JudgeAssignment.create({ judge: judge._id, event: event._id, createdBy: req.user.id });
    return res.status(201).json({ assignment });
  } catch (err) { next(err); }
}

// GET /api/judges/assignments
async function listAssignments(req, res, next) {
  try {
    // Only assignments created by this organizer OR for events hosted by this organizer
    const myEventIds = await Event.find({ organizer: req.user.id }).distinct('_id');
    const filter = { $or: [ { createdBy: req.user.id }, { event: { $in: myEventIds } } ] };
    const docs = await JudgeAssignment.find(filter)
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

// GET /api/judges
async function listJudges(req, res, next) {
  try {
    // Only judges that this organizer has assignments to, or are assigned to events they host
    const myEventIds = await Event.find({ organizer: req.user.id }).distinct('_id');
    const assignments = await JudgeAssignment.find({ $or: [ { createdBy: req.user.id }, { event: { $in: myEventIds } } ] })
      .select('judge')
      .lean();
    const judgeIds = [...new Set(assignments.map(a => String(a.judge)))];
    if (judgeIds.length === 0) return res.json({ judges: [] });
    const judges = await User.find({ _id: { $in: judgeIds }, role: 'judge' })
      .select('name email')
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ judges: judges.map(j => ({ id: j._id, name: j.name, email: j.email })) });
  } catch (err) { next(err); }
}

// GET /api/judges/:id/work
// Returns reviews done by the judge, restricted to events hosted by the requesting organizer
async function listJudgeWork(req, res, next) {
  try {
    const judgeId = req.params.id;
    // Find organizer's events
    const myEventIds = await Event.find({ organizer: req.user.id }).distinct('_id');
    if (myEventIds.length === 0) return res.json({ reviews: [] });

    // Fetch reviews by judge for those events
    const reviews = await Review.find({ judge: judgeId, event: { $in: myEventIds } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('event', 'title')
      .populate('team', 'name')
      .populate('judge', 'name email')
      .lean();

    const items = reviews.map(r => ({
      id: r._id,
      score: r.score,
      feedback: r.feedback,
      createdAt: r.createdAt,
      event: r.event ? { id: r.event._id, title: r.event.title } : null,
      team: r.team ? { id: r.team._id, name: r.team.name } : null,
      judge: r.judge ? { id: r.judge._id, name: r.judge.name, email: r.judge.email } : null,
    }));
    return res.json({ reviews: items });
  } catch (err) { next(err); }
}

module.exports = { createJudge, assignJudge, listAssignments, listJudges, listJudgeWork };
