const express = require('express');
const router = express.Router();
const { register, login, me, updateMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth(true), me);
router.put('/me', auth(true), updateMe);

module.exports = router;
