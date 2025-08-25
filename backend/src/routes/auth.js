const express = require('express');
const router = express.Router();
const { register, login, me, updateMe, sendOtp, verifyOtp, forgotPassword, resetPassword, uploadAvatar, removeAvatar, firebaseLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth(true), me);
router.put('/me', auth(true), updateMe);
router.post('/me/avatar', auth(true), upload.single('avatar'), uploadAvatar);
router.delete('/me/avatar', auth(true), removeAvatar);

module.exports = router;
