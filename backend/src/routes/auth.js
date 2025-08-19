const express = require('express');
const router = express.Router();
const { register, login, me, updateMe, sendOtp, verifyOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth(true), me);
router.put('/me', auth(true), updateMe);

module.exports = router;
