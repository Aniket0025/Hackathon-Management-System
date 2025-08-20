const express = require('express');
const router = express.Router();
const { auth, requireRoles } = require('../middleware/auth');
const { createJudge, assignJudge, listAssignments, listMyAssignedEvents, listJudges } = require('../controllers/judgesController');

// Judge self routes
router.get('/my-events', auth(true), requireRoles('judge'), listMyAssignedEvents);

// Organizer routes
router.use(auth(true), requireRoles('organizer'));

router.post('/', createJudge); // create judge and optional assignment
router.post('/assign', assignJudge); // assign existing judge to event
router.get('/', listJudges); // list judges
router.get('/assignments', listAssignments); // list recent assignments

module.exports = router;
