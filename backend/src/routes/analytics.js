const router = require('express').Router();
const { auth, requireRoles } = require('../middleware/auth');
const { 
  skillDistribution, 
  teamSuggestions, 
  getDashboardAnalytics,
  getParticipationTrends,
  getActivityFeed,
  getEventAnalytics,
  listEventsBasic,
  listEventsOverview,
  myEventsOverview,
  judgeLeaderboard,
  organizerEventsOverview,
} = require('../controllers/analyticsController');

// GET /api/analytics/dashboard - Real-time dashboard data
router.get('/dashboard', getDashboardAnalytics);

// GET /api/analytics/trends - Participation trends
router.get('/trends', getParticipationTrends);

// GET /api/analytics/activity - Real-time activity feed
router.get('/activity', getActivityFeed);

// GET /api/analytics/events/:eventId - Event-specific analytics
router.get('/events/:eventId', getEventAnalytics);

// GET /api/analytics/events - List events (basic info)
router.get('/events', listEventsBasic);

// GET /api/analytics/events-overview - Event-wise metrics with sorting (participant-scoped if authenticated)
router.get('/events-overview', auth(false), listEventsOverview);

// GET /api/analytics/my-events - Participant-scoped events overview
router.get('/my-events', auth(true), requireRoles('participant'), myEventsOverview);

// GET /api/analytics/judge/leaderboard - Leaderboard for judges/organizers
router.get('/judge/leaderboard', auth(true), requireRoles('judge', 'organizer', 'admin'), judgeLeaderboard);

// GET /api/analytics/organizer/events-overview - Organizer-scoped events overview
router.get('/organizer/events-overview', auth(true), requireRoles('organizer', 'admin'), organizerEventsOverview);

// GET /api/analytics/skills - Skill distribution
router.get('/skills', skillDistribution);

// GET /api/analytics/suggestions - Team suggestions
router.get('/suggestions', teamSuggestions);

module.exports = router;
