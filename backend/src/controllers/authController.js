const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const EmailVerification = require('../models/EmailVerification');
const { sendMail } = require('../utils/mailer');
const nodemailer = require('nodemailer');
const { uploadBuffer, deleteByPublicId, tryExtractPublicIdFromUrl } = require('../utils/cloudinary');
const { initFirebaseAdmin } = require('../utils/firebaseAdmin');

async function register(req, res, next) {
  try {
    const { name, email, password, role, organization, verificationToken } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    // Require verified email via verificationToken
    if (!verificationToken) return res.status(400).json({ message: 'Email not verified. Provide verificationToken from OTP verification.' });
    try {
      const payload = jwt.verify(verificationToken, process.env.JWT_SECRET);
      if (payload.purpose !== 'email_verification' || payload.email !== email) {
        return res.status(400).json({ message: 'Invalid verification token' });
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

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

// --- Firebase Login (Google) ---
async function firebaseLogin(req, res, next) {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    const admin = initFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.firebase?.identities?.email?.[0] || 'User',
      picture: decoded.picture,
    };

    if (!email) return res.status(400).json({ message: 'Email not present on Firebase token' });

    // Validate role (if provided). For new users, role is required.
    const allowedRoles = ['participant', 'organizer', 'judge'];
    let requestedRole = undefined;
    if (typeof role === 'string' && role.trim()) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      requestedRole = role;
    }

    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      // New user must provide a valid role
      if (!requestedRole) {
        return res.status(400).json({ message: 'role is required for new Google users' });
      }
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        role: requestedRole,
        provider: 'google',
        firebaseUid: uid,
        // no password for google users
      });
    } else {
      // If an existing local user, attach firebaseUid and mark provider if not set
      let changed = false;
      if (!user.firebaseUid) { user.firebaseUid = uid; changed = true; }
      if (user.provider !== 'google') { user.provider = 'google'; changed = true; }
      // If user's role is missing and a valid role is provided, set it once
      if (!user.role && requestedRole) { user.role = requestedRole; changed = true; }
      // Do not override an existing role
      if (changed) await user.save();
    }

    // Optionally set avatarUrl if empty
    if (picture && !user.avatarUrl) {
      try { user.avatarUrl = picture; await user.save(); } catch (_) {}
    }

    const token = generateToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, updateMe, firebaseLogin };

// --- OTP Email Verification Flow ---

async function sendOtp(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Prevent sending OTP for already-registered emails
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await EmailVerification.findOneAndUpdate(
      { email },
      { email, otpHash, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    // Build transporter like the provided example, using env
    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // true if using port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP is: <b>${otp}</b></p>`,
    });

    const payload = { message: 'OTP sent' };
    if (String(process.env.DEBUG_RETURN_OTP).toLowerCase() === 'true') {
      payload.otp = otp;
    }
    return res.json(payload);
  } catch (err) { next(err); }
}

async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const rec = await EmailVerification.findOne({ email });
    if (!rec) return res.status(400).json({ message: 'OTP not found. Request a new code.' });
    if (rec.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired. Request a new code.' });

    // Optional attempt limiting
    if (rec.attempts >= 5) return res.status(429).json({ message: 'Too many attempts. Request a new code.' });

    const ok = await bcrypt.compare(otp, rec.otpHash);
    if (!ok) {
      rec.attempts += 1;
      await rec.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Success: issue short-lived verification token and delete record
    await EmailVerification.deleteOne({ _id: rec._id });
    const verificationToken = jwt.sign(
      { email, purpose: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ message: 'Email verified', verificationToken });
  } catch (err) { next(err); }
}

module.exports.sendOtp = sendOtp;
module.exports.verifyOtp = verifyOtp;

// --- Forgot Password Flow ---

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    // Do not leak existence; respond success even if not found
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent.' });

    const token = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const frontendBase = process.env.FRONTEND_BASE || 'http://localhost:3000';
    const resetUrl = `${frontendBase}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await sendMail({
      to: email,
      subject: 'Reset your password',
      text: `Click the link to reset your password: ${resetUrl} (valid for 15 minutes)`,
      html: `<p>Click the link to reset your password (valid for 15 minutes):</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'token and password are required' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (payload.purpose !== 'password_reset' || !payload.email) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
}

module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;

// --- Avatar Upload ---
async function uploadAvatar(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const folder = `users/${req.user.id}/avatar`;
    const result = await uploadBuffer(req.file.buffer, folder, {
      transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
      format: 'jpg',
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: result.secure_url },
      { new: true }
    ).select('-password');

    return res.json({ user, avatarUrl: result.secure_url });
  } catch (err) {
    next(err);
  }
}

module.exports.uploadAvatar = uploadAvatar;

// --- Avatar Remove ---
async function removeAvatar(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prevUrl = user.avatarUrl;
    user.avatarUrl = undefined;
    await user.save();

    // Best-effort delete in Cloudinary (ignore errors)
    if (prevUrl) {
      const publicId = tryExtractPublicIdFromUrl(prevUrl);
      if (publicId) {
        try { await deleteByPublicId(publicId); } catch (_) {}
      }
    }

    return res.json({ user, message: 'Avatar removed' });
  } catch (err) {
    next(err);
  }
}

module.exports.removeAvatar = removeAvatar;
