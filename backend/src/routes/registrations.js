const express = require('express');
const router = express.Router();
const { listMyRegistrations } = require('../controllers/registrationController');

// Public endpoint: look up by email (client-side provided)
router.get('/mine', listMyRegistrations);

module.exports = router;
