const router = require('express').Router();
const { skillDistribution, teamSuggestions } = require('../controllers/analyticsController');

// GET /api/analytics/skills
router.get('/skills', skillDistribution);
router.get('/suggestions', teamSuggestions);

module.exports = router;
