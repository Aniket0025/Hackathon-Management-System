const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentsController');

// Public endpoints; verification is a simple signature check server-side
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
