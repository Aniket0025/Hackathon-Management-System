const Submission = require('../models/Submission');
const Team = require('../models/Team');

async function listSubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({ event: req.query.eventId }).populate('team', 'name');
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

async function createSubmission(req, res, next) {
  try {
    const { team, teamName, event, title, description, repoUrl, docsUrl, videoUrl } = req.body || {};
    if (!event) return res.status(400).json({ message: 'event is required' });
    if (!title) return res.status(400).json({ message: 'title is required' });

    let teamId = team;
    if (!teamId && teamName) {
      const t = await Team.findOne({ name: teamName, event: event }).select({ _id: 1 });
      if (!t) return res.status(400).json({ message: 'team not found for provided name and event' });
      teamId = t._id;
    }
    if (!teamId) return res.status(400).json({ message: 'team or teamName is required' });

    const submission = await Submission.create({
      team: teamId,
      event,
      title,
      description,
      repoUrl,
      docsUrl,
      videoUrl,
      status: 'submitted',
    });
    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

async function updateSubmissionScore(req, res, next) {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body || {};
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ message: 'score must be a number between 0 and 100' });
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      { $set: { score, status: 'reviewed', ...(typeof feedback === 'string' ? { feedback } : {}) } },
      { new: true }
    ).populate('team', 'name');

    if (!submission) return res.status(404).json({ message: 'submission not found' });

    // Return updated submission (including feedback if set)
    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSubmissions, createSubmission, updateSubmissionScore };
