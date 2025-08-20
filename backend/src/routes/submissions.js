const express = require('express');
const router = express.Router();
const { listSubmissions, createSubmission, updateSubmissionScore } = require('../controllers/submissionController');
const { auth } = require('../middleware/auth');

router.get('/', listSubmissions); // ?eventId=...
router.post('/', auth(true), createSubmission);
router.patch('/:id/score', auth(true), updateSubmissionScore);

module.exports = router;
