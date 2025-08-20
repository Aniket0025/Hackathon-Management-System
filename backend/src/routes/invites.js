const express = require('express');
const { auth } = require('../middleware/auth');
const { createInvite, listMyInvites, acceptInvite } = require('../controllers/invites');

const router = express.Router();

// POST /api/invites
router.post('/', auth(true), createInvite);

// GET /api/invites/my
router.get('/my', auth(true), listMyInvites);

// POST /api/invites/accept/:token
router.post('/accept/:token', auth(true), acceptInvite);

module.exports = router;
