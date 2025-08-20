const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const JudgeAssignment = require('../models/JudgeAssignment');
const Review = require('../models/Review');
const { sendMail } = require('../utils/mailer');

// POST /api/judges
// body: { name?, email, password, eventId? }
// Organizer-only
async function createJudge(req, res, next) {
  try {
    const { name, email, password, eventId, promoteIfExists } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    let judge = await User.findOne({ email });
    let createdNew = false;
    if (judge) {
      // If a user exists with this email, allow only if it's already a judge
      if (judge.role !== 'judge') {
        if (promoteIfExists === true) {
          // Promote existing user to judge, optionally update password
          if (password) {
            const hash = await bcrypt.hash(password, 10);
            judge.password = hash;
          }
          judge.role = 'judge';
          if (name) judge.name = name;
          await judge.save();
        } else {
          return res.status(409).json({ message: 'Email already in use by a non-judge account. Pass promoteIfExists=true to promote this user to judge.' });
        }
      }
    } else {
      const hash = await bcrypt.hash(password, 10);
      judge = await User.create({ name: name || email.split('@')[0], email, password: hash, role: 'judge' });
      createdNew = true;
    }

    let assignment = null;
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (String(event.organizer) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden: not your event' });
      assignment = await JudgeAssignment.create({ judge: judge._id, event: event._id, createdBy: req.user.id });

      // Send email notification about account and assignment
      try {
        const subject = createdNew
          ? `You have been invited as a Judge for ${event.title}`
          : `You have been assigned as a Judge for ${event.title}`;
        const lines = [];
        lines.push(`Hello ${judge.name || 'Judge'},`);
        if (createdNew) {
          lines.push('An account has been created for you to judge hackathon submissions.');
          lines.push('Login credentials:');
          lines.push(`Email: ${email}`);
          lines.push(`Password: ${password}`);
        } else {
          lines.push('You have been assigned to a new event as a judge.');
          lines.push(`Email: ${email}`);
          if (promoteIfExists === true && password) {
            lines.push(`Temporary Password: ${password}`);
          }
        }
        lines.push('');
        lines.push('Event details:');
        lines.push(`- Title: ${event.title}`);
        if (event.startDate) lines.push(`- Start: ${new Date(event.startDate).toLocaleString()}`);
        if (event.endDate) lines.push(`- End: ${new Date(event.endDate).toLocaleString()}`);
        const text = lines.join('\n');
        const html = `<p>${lines.map(l => l ? l.replace(/</g,'&lt;').replace(/>/g,'&gt;') : '&nbsp;').join('</p><p>')}</p>`;
        await sendMail({ to: email, subject, text, html });
      } catch (mailErr) {
        console.warn('[judgesController] Failed to send judge creation/assignment email:', mailErr.message);
      }
    }

    // If a new judge was created and not assigned to an event, still send credentials email
    if (createdNew && !eventId) {
      try {
        const subject = 'Your Judge Account Credentials';
        const lines = [];
        lines.push(`Hello ${judge.name || 'Judge'},`);
        lines.push('An account has been created for you to judge hackathon submissions.');
        lines.push('Login credentials:');
        lines.push(`Email: ${email}`);
        lines.push(`Password: ${password}`);
        const text = lines.join('\n');
        const html = `<p>${lines.map(l => l ? l.replace(/</g,'&lt;').replace(/>/g,'&gt;') : '&nbsp;').join('</p><p>')}</p>`;
        await sendMail({ to: email, subject, text, html });
      } catch (mailErr) {
        console.warn('[judgesController] Failed to send judge credentials email:', mailErr.message);
      }
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

    // Send assignment email
    try {
      const subject = `You have been assigned as a Judge for ${event.title}`;
      const lines = [];
      lines.push(`Hello ${judge.name || 'Judge'},`);
      lines.push('You have been assigned to an event as a judge.');
      lines.push('');
      lines.push('Event details:');
      lines.push(`- Title: ${event.title}`);
      if (event.startDate) lines.push(`- Start: ${new Date(event.startDate).toLocaleString()}`);
      if (event.endDate) lines.push(`- End: ${new Date(event.endDate).toLocaleString()}`);
      const text = lines.join('\n');
      const html = `<p>${lines.map(l => l ? l.replace(/</g,'&lt;').replace(/>/g,'&gt;') : '&nbsp;').join('</p><p>')}</p>`;
      await sendMail({ to: judge.email, subject, text, html });
    } catch (mailErr) {
      console.warn('[judgesController] Failed to send judge assignment email:', mailErr.message);
    }
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

module.exports = { createJudge, assignJudge, listAssignments, listJudges, listMyAssignedEvents, listJudgeWork };
