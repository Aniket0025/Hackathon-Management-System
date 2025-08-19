const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Submission = require('../models/Submission');
const Team = require('../models/Team');
const mongoose = require('mongoose');

// Map normalized skill to category key
const SKILL_TO_CATEGORY = [
  { key: 'frontend', names: ['react', 'next', 'frontend', 'html', 'css', 'javascript', 'typescript', 'vue', 'angular'] },
  { key: 'backend', names: ['backend', 'node', 'express', 'python', 'django', 'flask', 'java', 'spring', 'postgres', 'mongodb', 'sql', 'api'] },
  { key: 'design', names: ['design', 'ui', 'ux', 'figma', 'prototyping', 'wireframe'] },
  { key: 'mobile', names: ['mobile', 'react native', 'ios', 'android', 'flutter', 'kotlin', 'swift'] },
];

function categorizeSkill(raw) {
  const s = (raw || '').toString().toLowerCase().trim();
  if (!s) return null;
  for (const c of SKILL_TO_CATEGORY) {
    if (c.names.some((n) => s.includes(n))) return c.key;
  }
  return null;
}

// Participant-scoped overview: only events the current user is registered for
async function myEventsOverview(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const User = require('../models/User');
    const user = await User.findById(userId).lean();
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const email = (user.email || '').toLowerCase();
    // Find registrations where the user is the registrant or listed in team members by email
    const regs = await Registration.find({
      $or: [
        { 'personalInfo.email': email },
        { 'teamInfo.members.email': email }
      ]
    }).select('event').lean();

    const eventIds = [...new Set(regs.map(r => String(r.event)))].map(id => new mongoose.Types.ObjectId(id));
    if (eventIds.length === 0) return res.json({ success: true, data: [] });

    // Reuse overview aggregation scoped to these eventIds
    req.query.sortBy = req.query.sortBy || 'startDate';
    req.query.order = req.query.order || 'desc';

    const now = new Date();
    const sortMap = {
      startDate: { field: 'startDate' },
      title: { field: 'title' },
      registrations: { field: 'metrics.registrations' },
      submissions: { field: 'metrics.submissions' },
      conversion: { field: 'metrics.conversion' },
      activity24h: { field: 'metrics.activity24h' },
    };
    const sortField = (sortMap[req.query.sortBy] || sortMap.startDate).field;
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: { _id: { $in: eventIds } } },
      {
        $lookup: {
          from: 'registrations',
          let: { evId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$event', '$$evId'] } } },
            { $group: { _id: null, total: { $sum: 1 }, last24h: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 24 * 60 * 60 * 1000)] }, 1, 0] } } } }
          ],
          as: 'regStats'
        }
      },
      {
        $lookup: {
          from: 'submissions',
          let: { evId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$event', '$$evId'] } } },
            { $group: { _id: null, total: { $sum: 1 }, last24h: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 24 * 60 * 60 * 1000)] }, 1, 0] } } } }
          ],
          as: 'subStats'
        }
      },
      {
        $addFields: {
          metrics: {
            registrations: { $ifNull: [{ $arrayElemAt: ['$regStats.total', 0] }, 0] },
            submissions: { $ifNull: [{ $arrayElemAt: ['$subStats.total', 0] }, 0] },
            activity24h: {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$regStats.last24h', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$subStats.last24h', 0] }, 0] }
              ]
            }
          }
        }
      },
      {
        $addFields: {
          'metrics.conversion': {
            $cond: [
              { $gt: ['$metrics.registrations', 0] },
              { $multiply: [{ $divide: ['$metrics.submissions', '$metrics.registrations'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { [sortField]: sortOrder } }
    ];

    const docs = await Event.aggregate(pipeline);
    const data = docs.map(d => ({
      id: d._id,
      title: d.title,
      status: d.status,
      startDate: d.startDate,
      endDate: d.endDate,
      metrics: {
        registrations: d.metrics?.registrations || 0,
        submissions: d.metrics?.submissions || 0,
        activity24h: d.metrics?.activity24h || 0,
        conversion: Math.round((d.metrics?.conversion || 0) * 10) / 10,
      }
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Judge/organizer leaderboard for an event
async function judgeLeaderboard(req, res, next) {
  try {
    const { eventId, type = 'submission', limit = 20 } = req.query;
    if (!eventId) return res.status(400).json({ success: false, message: 'eventId is required' });

    if (type === 'team') {
      const docs = await Team.aggregate([
        { $match: { event: new mongoose.Types.ObjectId(eventId) } },
        { $sort: { score: -1, createdAt: 1 } },
        { $limit: Number(limit) },
        { $project: { _id: 1, name: 1, score: 1 } }
      ]);
      return res.json({ success: true, data: { type: 'team', items: docs } });
    }

    // Default: submissions leaderboard
    const docs = await Submission.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      { $sort: { score: -1, createdAt: 1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'teams',
          localField: 'team',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, title: 1, score: 1, team: { _id: '$team._id', name: '$team.name' } } }
    ]);

    res.json({ success: true, data: { type: 'submission', items: docs } });
  } catch (err) {
    next(err);
  }
}

// List events for selection in UI
async function listEventsBasic(req, res, next) {
  try {
    const events = await Event.find({}, 'title status startDate endDate')
      .sort({ startDate: -1 })
      .lean();
    res.json({
      success: true,
      data: events.map(e => ({
        id: e._id,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        endDate: e.endDate,
      }))
    });
  } catch (err) {
    next(err);
  }
}

// Advanced event overview with authentic metrics and sorting
async function listEventsOverview(req, res, next) {
  try {
    const {
      status, // optional: 'upcoming' | 'ongoing' | 'completed' | 'draft'
      sortBy = 'startDate', // 'startDate' | 'registrations' | 'submissions' | 'conversion' | 'activity24h' | 'title'
      order = 'desc', // 'asc' | 'desc'
      limit, // optional number
    } = req.query;

    const now = new Date();
    const match = {};
    if (status) match.status = status;

    // If an authenticated participant requests this, restrict to their registered events
    if (req.user && req.user.role === 'participant') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id).lean();
      if (user) {
        const email = (user.email || '').toLowerCase();
        const regs = await Registration.find({
          $or: [
            { 'personalInfo.email': email },
            { 'teamInfo.members.email': email },
          ],
        }).select('event').lean();
        const eventIds = [...new Set(regs.map(r => String(r.event)))];
        if (eventIds.length === 0) {
          return res.json({ success: true, data: [] });
        }
        match._id = { $in: eventIds.map(id => new mongoose.Types.ObjectId(id)) };
      }
    }

    const sortMap = {
      startDate: { field: 'startDate' },
      title: { field: 'title' },
      registrations: { field: 'metrics.registrations' },
      submissions: { field: 'metrics.submissions' },
      conversion: { field: 'metrics.conversion' },
      activity24h: { field: 'metrics.activity24h' },
    };
    const sortField = (sortMap[sortBy] || sortMap.startDate).field;
    const sortOrder = order === 'asc' ? 1 : -1;

    const pipeline = [
      { $match: match },
      // Registrations count
      {
        $lookup: {
          from: 'registrations',
          let: { evId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$event', '$$evId'] } } },
            { $group: { _id: null, total: { $sum: 1 }, last24h: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 24 * 60 * 60 * 1000)] }, 1, 0] } } } }
          ],
          as: 'regStats'
        }
      },
      // Submissions count
      {
        $lookup: {
          from: 'submissions',
          let: { evId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$event', '$$evId'] } } },
            { $group: { _id: null, total: { $sum: 1 }, last24h: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now - 24 * 60 * 60 * 1000)] }, 1, 0] } } } }
          ],
          as: 'subStats'
        }
      },
      // Compute metrics
      {
        $addFields: {
          metrics: {
            registrations: { $ifNull: [{ $arrayElemAt: ['$regStats.total', 0] }, 0] },
            submissions: { $ifNull: [{ $arrayElemAt: ['$subStats.total', 0] }, 0] },
            activity24h: {
              $add: [
                { $ifNull: [{ $arrayElemAt: ['$regStats.last24h', 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ['$subStats.last24h', 0] }, 0] }
              ]
            }
          }
        }
      },
      // Conversion = submissions / registrations * 100
      {
        $addFields: {
          'metrics.conversion': {
            $cond: [
              { $gt: ['$metrics.registrations', 0] },
              { $multiply: [{ $divide: ['$metrics.submissions', '$metrics.registrations'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { [sortField]: sortOrder } },
    ];

    if (limit) pipeline.push({ $limit: Number(limit) });

    const docs = await Event.aggregate(pipeline);

    const data = docs.map(d => ({
      id: d._id,
      title: d.title,
      status: d.status,
      startDate: d.startDate,
      endDate: d.endDate,
      metrics: {
        registrations: d.metrics?.registrations || 0,
        submissions: d.metrics?.submissions || 0,
        activity24h: d.metrics?.activity24h || 0,
        conversion: Math.round((d.metrics?.conversion || 0) * 10) / 10,
      }
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function skillDistribution(req, res, next) {
  try {
    // Optional event filter
    const { eventId } = req.query;
    const filter = {};
    if (eventId) filter.event = eventId;

    // Fetch skills from teamInfo.desiredSkills and fallback to preferences.track
    const regs = await Registration.find(filter, { 'teamInfo.desiredSkills': 1, 'preferences.track': 1 }).lean();

    const counts = { frontend: 0, backend: 0, design: 0, mobile: 0 };

    for (const r of regs) {
      const skills = Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills : [];
      let catSet = new Set();
      for (const sk of skills) {
        const cat = categorizeSkill(sk);
        if (cat) catSet.add(cat);
      }
      // fallback: track field
      const trackCat = categorizeSkill(r?.preferences?.track);
      if (trackCat) catSet.add(trackCat);

      if (catSet.size === 0) continue;
      for (const c of catSet) counts[c] += 1;
    }

    const result = [
      { key: 'frontend', name: 'Frontend', count: counts.frontend },
      { key: 'backend', name: 'Backend', count: counts.backend },
      { key: 'design', name: 'Design', count: counts.design },
      { key: 'mobile', name: 'Mobile', count: counts.mobile },
    ];

    res.json({ categories: result });
  } catch (err) {
    next(err);
  }
}

async function teamSuggestions(req, res, next) {
  try {
    const { eventId, eventName, limit = 5 } = req.query;
    const q = {};
    if (eventId) q.event = eventId;
    if (eventName) q.eventName = eventName;

    // Pull needed fields
    const regs = await Registration.find(q, {
      event: 1,
      eventName: 1,
      'personalInfo.firstName': 1,
      'personalInfo.lastName': 1,
      'personalInfo.email': 1,
      'preferences.track': 1,
      'teamInfo.teamName': 1,
      'teamInfo.members': 1,
      'teamInfo.desiredSkills': 1,
      createdAt: 1,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group by teamName per event
    const groups = new Map(); // key: `${eventName}::${teamName}` => array of regs
    for (const r of regs) {
      const teamName = (r?.teamInfo?.teamName || '').trim();
      if (!teamName) continue; // only formed teams
      const ev = r.eventName || (r.event?._id || '').toString() || 'Unknown Event';
      const key = `${ev}::${teamName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }

    const suggestions = [];
    for (const [key, rs] of groups.entries()) {
      const [evName, teamName] = key.split('::');
      // Build unique members set from teamInfo.members if present; otherwise from personalInfo
      const memberList = [];
      const seen = new Set();
      // Sort registrations by createdAt asc for stable fallback leader selection
      rs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      for (const r of rs) {
        const members = Array.isArray(r?.teamInfo?.members) ? r.teamInfo.members : [];
        if (members.length > 0) {
          for (const m of members) {
            const email = (m?.email || '').toLowerCase();
            const id = email || `${m.firstName}-${m.lastName}`;
            if (seen.has(id)) continue;
            seen.add(id);
            memberList.push({
              name: [m.firstName, m.lastName].filter(Boolean).join(' ').trim() || email || 'Member',
              role: r?.preferences?.track || 'Member',
              avatar: null,
              skills: Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills.slice(0, 3) : [],
            });
          }
        } else {
          // fallback: the registrant themselves
          const email = (r?.personalInfo?.email || '').toLowerCase();
          const id = email || `${r?.personalInfo?.firstName}-${r?.personalInfo?.lastName}`;
          if (!seen.has(id)) {
            seen.add(id);
            memberList.push({
              name: [r?.personalInfo?.firstName, r?.personalInfo?.lastName].filter(Boolean).join(' ').trim() || email || 'Member',
              role: r?.preferences?.track || 'Member',
              avatar: null,
              skills: Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills.slice(0, 3) : [],
            });
          }
        }
      }

      // Simple compatibility heuristic: diversity of categories in desiredSkills
      const catSet = new Set();
      for (const r of rs) {
        const skills = Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills : [];
        for (const s of skills) {
          const c = categorizeSkill(s);
          if (c) catSet.add(c);
        }
      }
      const diversity = Math.min(4, catSet.size);
      const sizeFactor = Math.min(5, memberList.length);
      const compatibility = Math.round(80 + diversity * 4 + sizeFactor * 2); // 80..100

      const strengths = [];
      if (diversity >= 3) strengths.push('Balanced skill set');
      if (sizeFactor >= 3) strengths.push('High collaboration score');
      if (diversity >= 2 && sizeFactor >= 2) strengths.push('Complementary experience levels');

      // Determine leader: first member if available; else earliest registrant
      let leaderName = null;
      if (memberList.length > 0) {
        leaderName = memberList[0].name || null;
      } else if (rs.length > 0) {
        const r0 = rs[0];
        leaderName = [r0?.personalInfo?.firstName, r0?.personalInfo?.lastName].filter(Boolean).join(' ').trim() || (r0?.personalInfo?.email || null);
      }

      suggestions.push({
        id: key,
        name: teamName,
        eventName: evName,
        leaderName,
        compatibility: Math.max(0, Math.min(100, compatibility)),
        members: memberList.slice(0, 8),
        strengths: strengths.length ? strengths : ['Strong potential composition'],
        projectFit: `Good fit for ${evName}`,
      });
    }

    // Sort by compatibility and limit
    suggestions.sort((a, b) => b.compatibility - a.compatibility);
    res.json({ suggestions: suggestions.slice(0, Number(limit) || 5) });
  } catch (err) {
    next(err);
  }
}

// Get real-time analytics dashboard data
async function getDashboardAnalytics(req, res, next) {
  try {
    const { eventId } = req.query;
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Active Events (global metric if no eventId; if eventId, 1 or 0 depending on its status/time)
    let activeEvents;
    if (eventId) {
      activeEvents = await Event.countDocuments({
        _id: eventId,
        status: 'ongoing',
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
    } else {
      activeEvents = await Event.countDocuments({
        status: 'ongoing',
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
    }

    // Total Participants
    const regFilter = eventId ? { event: eventId } : {};
    const totalParticipants = await Registration.countDocuments(regFilter);
    const participantsYesterday = await Registration.countDocuments({
      ...regFilter,
      createdAt: { $gte: yesterday }
    });

    // Projects Submitted
    const subFilter = eventId ? { event: eventId } : {};
    const projectsSubmitted = await Submission.countDocuments(subFilter);
    const submissionsYesterday = await Submission.countDocuments({
      ...subFilter,
      createdAt: { $gte: yesterday }
    });

    // Success/Conversion Rate
    // If eventId provided, use per-event conversion (submissions/registrations). Else global events with submissions / total events
    let successRate = 0;
    if (eventId) {
      successRate = totalParticipants > 0 ? (projectsSubmitted / totalParticipants) * 100 : 0;
    } else {
      const eventsWithSubmissions = await Submission.distinct('event');
      const totalEvents = await Event.countDocuments({ status: { $ne: 'draft' } });
      successRate = totalEvents > 0 ? (eventsWithSubmissions.length / totalEvents) * 100 : 0;
    }

    // Engagement metrics
    const recentRegistrations = await Registration.countDocuments({
      ...regFilter,
      createdAt: { $gte: lastWeek }
    });
    const recentSubmissions = await Submission.countDocuments({
      ...subFilter,
      createdAt: { $gte: lastWeek }
    });
    const engagementRate = totalParticipants > 0 ? (recentRegistrations / totalParticipants) * 100 : 0;

    // Team formation stats
    const teamsFormed = await Registration.countDocuments({
      ...regFilter,
      registrationType: 'team',
      'teamInfo.teamName': { $ne: '' }
    });

    res.json({
      success: true,
      data: {
        activeEvents,
        totalParticipants,
        projectsSubmitted,
        successRate: Math.round(successRate * 10) / 10,
        engagementRate: Math.round(engagementRate * 10) / 10,
        teamsFormed,
        changes: {
          participants: participantsYesterday,
          submissions: submissionsYesterday
        },
        lastUpdated: now
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get participation trends over time
async function getParticipationTrends(req, res, next) {
  try {
    const { timeframe = '7d', eventId } = req.query;
    const now = new Date();
    let startDate;
    let groupBy;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        groupBy = { $hour: '$createdAt' };
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dayOfWeek: '$createdAt' };
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dayOfMonth: '$createdAt' };
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dayOfWeek: '$createdAt' };
    }
    const match = { createdAt: { $gte: startDate } };
    if (eventId) {
      match.event = mongoose.Types.ObjectId.isValid(eventId) ? new mongoose.Types.ObjectId(eventId) : eventId;
    }

    const trends = await Registration.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          date: { $first: '$createdAt' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        trends,
        timeframe,
        totalInPeriod: trends.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get real-time activity feed
async function getActivityFeed(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { eventId } = req.query;
    
    // Get recent registrations
    const regQuery = eventId ? { event: eventId } : {};
    const recentRegistrations = await Registration.find(regQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('personalInfo.firstName personalInfo.lastName eventName createdAt registrationType teamInfo.teamName')
      .lean();

    // Get recent submissions
    const subQuery = eventId ? { event: eventId } : {};
    const recentSubmissions = await Submission.find(subQuery)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('event', 'title')
      .select('title event createdAt')
      .lean();

    // Combine and format activities
    const activities = [];

    recentRegistrations.forEach(reg => {
      const name = `${reg.personalInfo.firstName} ${reg.personalInfo.lastName}`;
      const teamInfo = reg.registrationType === 'team' && reg.teamInfo?.teamName 
        ? ` (Team: ${reg.teamInfo.teamName})` 
        : '';
      
      activities.push({
        type: 'registration',
        message: `${name} registered for ${reg.eventName}${teamInfo}`,
        timestamp: reg.createdAt,
        icon: 'user-plus'
      });
    });

    recentSubmissions.forEach(sub => {
      activities.push({
        type: 'submission',
        message: `New project "${sub.title}" submitted to ${sub.event?.title || 'Unknown Event'}`,
        timestamp: sub.createdAt,
        icon: 'upload'
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        activities: activities.slice(0, limit),
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get event-specific analytics
async function getEventAnalytics(req, res, next) {
  try {
    const { eventId } = req.params;
    
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Get registrations for this event
    const registrations = await Registration.countDocuments({ event: eventId });
    const teamRegistrations = await Registration.countDocuments({ 
      event: eventId, 
      registrationType: 'team' 
    });
    const individualRegistrations = registrations - teamRegistrations;

    // Get submissions for this event
    const submissions = await Submission.countDocuments({ event: eventId });

    // Get track distribution
    const trackDistribution = await Registration.aggregate([
      { $match: { event: eventId } },
      { $group: { _id: '$preferences.track', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          status: event.status,
          startDate: event.startDate,
          endDate: event.endDate
        },
        registrations: {
          total: registrations,
          team: teamRegistrations,
          individual: individualRegistrations
        },
        submissions,
        trackDistribution,
        conversionRate: registrations > 0 ? (submissions / registrations) * 100 : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  skillDistribution, 
  teamSuggestions, 
  getDashboardAnalytics,
  getParticipationTrends,
  getActivityFeed,
  getEventAnalytics,
  listEventsBasic,
  listEventsOverview,
  myEventsOverview,
  judgeLeaderboard
};
