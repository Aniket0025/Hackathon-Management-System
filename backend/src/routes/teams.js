const express = require('express');
const router = express.Router();
const { listTeams, createTeam, joinTeam, getTeamDetails, listTeamReviews, addTeamReview } = require('../controllers/teamController');
const { auth, requireRoles } = require('../middleware/auth');

router.get('/', auth(false), listTeams); // ?eventId=...
router.get('/:id', auth(true), getTeamDetails);
router.post('/', auth(true), createTeam);
router.post('/:id/join', auth(true), joinTeam);
// Reviews
router.get('/:id/reviews', auth(true), requireRoles('organizer', 'judge'), listTeamReviews);
router.post('/:id/reviews', auth(true), requireRoles('organizer', 'judge'), addTeamReview);

module.exports = router;
