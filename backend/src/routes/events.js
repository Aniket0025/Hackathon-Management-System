const express = require('express');
const router = express.Router();
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { auth, requireRoles } = require('../middleware/auth');

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', auth(true), requireRoles('organizer', 'admin'), createEvent);
router.put('/:id', auth(true), requireRoles('organizer', 'admin'), updateEvent);
router.delete('/:id', auth(true), requireRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
