const express = require('express');
const router = express.Router();
const { listTeams, createTeam, joinTeam } = require('../controllers/teamController');
const { auth } = require('../middleware/auth');

router.get('/', listTeams); // ?eventId=...
router.post('/', auth(true), createTeam);
router.post('/:id/join', auth(true), joinTeam);

module.exports = router;
