const express = require('express');
const router = express.Router();
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { registerForEvent, saveDraftRegistration, getDraftRegistration, deleteDraftRegistration } = require('../controllers/registrationController');
const { auth, requireRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth(false), listEvents);
router.get('/:id', getEvent);
// Public registration endpoint
router.post('/:id/register', registerForEvent);
// Draft registration endpoints (public, email supplied by client)
router.get('/:id/registration/draft', getDraftRegistration);
router.post('/:id/registration/draft', saveDraftRegistration);
router.delete('/:id/registration/draft', deleteDraftRegistration);
router.post('/', auth(true), requireRoles('organizer', 'admin'), upload.single('banner'), createEvent);
router.put('/:id', auth(true), requireRoles('organizer', 'admin'), upload.single('banner'), updateEvent);
router.delete('/:id', auth(true), requireRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
