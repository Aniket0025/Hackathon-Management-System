const express = require('express');
const router = express.Router();
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { registerForEvent } = require('../controllers/registrationController');
const { auth, requireRoles } = require('../middleware/auth');

router.get('/', auth(false), listEvents);
router.get('/:id', getEvent);
// Public registration endpoint
router.post('/:id/register', registerForEvent);
router.post('/', auth(true), requireRoles('organizer', 'admin'), createEvent);
router.put('/:id', auth(true), requireRoles('organizer', 'admin'), updateEvent);
router.delete('/:id', auth(true), requireRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
