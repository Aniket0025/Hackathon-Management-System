const Evaluation = require('../models/Evaluation');
const Team = require('../models/Team');
let Submission;
try { Submission = require('../models/Submission'); } catch (_) { Submission = null; }
const JudgeAssignment = require('../models/JudgeAssignment');

// Create or update (upsert) an evaluation by judge for a team in an event
async function upsertEvaluation(req, res) {
  try {
    const judgeId = req.user?.id;
    if (!judgeId) return res.status(401).json({ message: 'Unauthorized' });

    const { eventId, teamId, scores = {}, comments = '' } = req.body || {};
    if (!eventId || !teamId) {
      return res.status(400).json({ message: 'eventId and teamId are required' });
    }

    // Judges may only evaluate events they are assigned to
    if (req.user?.role === 'judge') {
      const assigned = await JudgeAssignment.exists({ judge: judgeId, event: eventId });
      if (!assigned) return res.status(403).json({ message: 'Forbidden: not assigned to this event' });
    }

    const update = {
      scores: { ...scores },
      comments: comments || '',
      status: 'pending',
    };

    const evalDoc = await Evaluation.findOneAndUpdate(
      { event: eventId, team: teamId, judge: judgeId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('team', 'name').populate('judge', 'name email');

    // Recalculate Team.score based on all evaluations for this team in this event
    try {
      const evals = await Evaluation.find({ event: eventId, team: teamId }).select('scores').lean();
      const perEval = evals.map(e => {
        const s = e.scores || {};
        const nums = [s.innovation, s.impact, s.feasibility, s.presentation].filter(v => typeof v === 'number');
        if (!nums.length) return null;
        // average across criteria (0-10), scale to 100
        return (nums.reduce((a, b) => a + b, 0) / nums.length) * 10;
      }).filter(v => typeof v === 'number');
      if (perEval.length) {
        const avg = perEval.reduce((a, b) => a + b, 0) / perEval.length;
        await Team.findByIdAndUpdate(teamId, { $set: { score: Number(avg.toFixed(2)) } }).catch(() => {});
      }
      const io = req.app.get('io');
      if (io) io.emit('leaderboard:update', { event: String(eventId), reason: 'evaluation_updated' });
    } catch (_) {}

    return res.status(200).json({ evaluation: evalDoc });
  } catch (err) {
    console.error('upsertEvaluation error', err);
    return res.status(500).json({ message: 'Failed to save evaluation' });
  }
}

// List evaluations for an event
async function listByEvent(req, res) {
  try {
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const role = req.user?.role;
    const userId = req.user?.id;

    const query = { event: eventId };
    if (role === 'judge') {
      // Judges can only see their own evaluations in assigned events
      const assigned = await JudgeAssignment.exists({ judge: userId, event: eventId });
      if (!assigned) return res.status(403).json({ message: 'Forbidden: not assigned to this event' });
      query.judge = userId;
    }

    const evaluations = await Evaluation.find(query)
      .populate('team', 'name')
      .populate('judge', 'name email')
      .sort({ updatedAt: -1 });

    return res.json({ evaluations });
  } catch (err) {
    console.error('listByEvent error', err);
    return res.status(500).json({ message: 'Failed to fetch evaluations' });
  }
}

// Mark evaluation complete
async function markComplete(req, res) {
  try {
    const { id } = req.params;
    const judgeId = req.user?.id;
    if (!id) return res.status(400).json({ message: 'id required' });

    const doc = await Evaluation.findById(id);
    if (!doc) return res.status(404).json({ message: 'Evaluation not found' });

    // Judges can only complete their own evaluation
    if (req.user?.role === 'judge' && String(doc.judge) !== String(judgeId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Also ensure the judge is assigned to this evaluation's event
    if (req.user?.role === 'judge') {
      const assigned = await JudgeAssignment.exists({ judge: judgeId, event: doc.event });
      if (!assigned) return res.status(403).json({ message: 'Forbidden: not assigned to this event' });
    }

    doc.status = 'complete';
    await doc.save();

    // Recalculate Team.score for this evaluation's team in its event and emit update
    try {
      const eventId = doc.event;
      const teamId = doc.team;
      const evals = await Evaluation.find({ event: eventId, team: teamId }).select('scores').lean();
      const perEval = evals.map(e => {
        const s = e.scores || {};
        const nums = [s.innovation, s.impact, s.feasibility, s.presentation].filter(v => typeof v === 'number');
        if (!nums.length) return null;
        return (nums.reduce((a, b) => a + b, 0) / nums.length) * 10;
      }).filter(v => typeof v === 'number');
      if (perEval.length) {
        const avg = perEval.reduce((a, b) => a + b, 0) / perEval.length;
        await Team.findByIdAndUpdate(teamId, { $set: { score: Number(avg.toFixed(2)) } }).catch(() => {});
      }
      const io = req.app.get('io');
      if (io) io.emit('leaderboard:update', { event: String(eventId), reason: 'evaluation_completed' });
    } catch (_) {}

    return res.json({ evaluation: doc });
  } catch (err) {
    console.error('markComplete error', err);
    return res.status(500).json({ message: 'Failed to mark complete' });
  }
}

// Export evaluations for an event to Excel
async function exportExcel(req, res) {
  try {
    let exceljs;
    try {
      exceljs = require('exceljs');
    } catch (e) {
      return res.status(500).json({ message: 'Excel export not available: install exceljs dependency' });
    }
    const { eventId } = req.params;
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const role = req.user?.role;
    const userId = req.user?.id;

    const query = { event: eventId };
    if (role === 'judge') {
      const assigned = await JudgeAssignment.exists({ judge: userId, event: eventId });
      if (!assigned) return res.status(403).json({ message: 'Forbidden: not assigned to this event' });
      query.judge = userId;
    }

    const rows = await Evaluation.find(query)
      .populate('team', 'name')
      .populate('judge', 'name email')
      .lean();

    const teamIds = rows.map(r => r.team?._id).filter(Boolean);
    let submissionsByTeam = {};
    if (Submission && teamIds.length) {
      const subs = await Submission.find({ team: { $in: teamIds }, event: eventId }).lean().catch(() => []);
      for (const s of subs) {
        submissionsByTeam[String(s.team)] = s;
      }
    }

    const wb = new exceljs.Workbook();
    const ws = wb.addWorksheet('Evaluations');
    ws.columns = [
      { header: 'Team', key: 'team', width: 28 },
      { header: 'Judge', key: 'judge', width: 24 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Innovation', key: 'innovation', width: 12 },
      { header: 'Impact', key: 'impact', width: 10 },
      { header: 'Feasibility', key: 'feasibility', width: 12 },
      { header: 'Presentation', key: 'presentation', width: 12 },
      { header: 'Avg', key: 'avg', width: 8 },
      { header: 'GitHub', key: 'github', width: 40 },
      { header: 'Doc', key: 'doc', width: 40 },
      { header: 'Video', key: 'video', width: 40 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
    ];

    for (const r of rows) {
      const s = r.scores || {};
      const nums = [s.innovation, s.impact, s.feasibility, s.presentation].filter(v => typeof v === 'number');
      const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : undefined;
      const sub = submissionsByTeam[String(r.team?._id)] || {};

      ws.addRow({
        team: r.team?.name || '',
        judge: r.judge?.name || r.judge?.email || '',
        status: r.status,
        innovation: s.innovation ?? '',
        impact: s.impact ?? '',
        feasibility: s.feasibility ?? '',
        presentation: s.presentation ?? '',
        avg: avg ? Number(avg.toFixed(2)) : '',
        github: sub.githubUrl || '',
        doc: sub.docUrl || '',
        video: sub.videoUrl || '',
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : '',
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="evaluations-${eventId}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('exportExcel error', err);
    return res.status(500).json({ message: 'Failed to export' });
  }
}

module.exports = {
  upsertEvaluation,
  listByEvent,
  markComplete,
  exportExcel,
};
