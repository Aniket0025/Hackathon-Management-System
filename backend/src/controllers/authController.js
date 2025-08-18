const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

async function register(req, res, next) {
  try {
    const { name, email, password, role, organization } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role, organization });

    const token = generateToken(user);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Whitelist updatable fields
    const allowed = ['name', 'organization', 'location', 'phone', 'bio', 'avatarUrl', 'social'];
    const updates = {};
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') updates[key] = req.body[key];
    }

    // Prevent role/email/password changes from this endpoint
    delete updates.role;
    delete updates.email;
    delete updates.password;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateMe };
