const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const ctrl = require('../controllers/evaluationsController');

// Create/Update evaluation (judge only)
router.post('/', auth(true), requireRole('judge'), ctrl.upsertEvaluation);

// List evaluations for an event (judge -> own only; organizer -> all)
router.get('/:eventId', auth(true), requireRole('judge', 'organizer'), ctrl.listByEvent);

// Mark evaluation complete (judge own; organizer permitted -> controller enforces ownership for judge)
router.patch('/:id/complete', auth(true), requireRole('judge', 'organizer'), ctrl.markComplete);

// Export evaluations to Excel
router.get('/:eventId/export', auth(true), requireRole('judge', 'organizer'), ctrl.exportExcel);

module.exports = router;
