const express = require('express');
const router = express.Router();
const { listSubmissions, createSubmission } = require('../controllers/submissionController');
const { auth } = require('../middleware/auth');

router.get('/', listSubmissions); // ?eventId=...
router.post('/', auth(true), createSubmission);

module.exports = router;
