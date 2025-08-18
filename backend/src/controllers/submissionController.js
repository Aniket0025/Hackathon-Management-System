const Submission = require('../models/Submission');

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
    const { team, event, title, description, repoUrl } = req.body;
    const submission = await Submission.create({ team, event, title, description, repoUrl, status: 'submitted' });
    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

module.exports = { listSubmissions, createSubmission };
