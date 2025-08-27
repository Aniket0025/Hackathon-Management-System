const express = require('express');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

// POST /api/subscribers
router.post('/', async (req, res) => {
  try {
    const { email, source } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress;
    const ua = req.headers['user-agent'];

    // Upsert to avoid duplicates
    const doc = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $setOnInsert: {
          email: email.toLowerCase().trim(),
          source: source || 'homepage',
        },
        $set: {
          meta: { ip, userAgent: ua },
        },
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: 'Subscribed successfully', data: { id: doc._id, email: doc.email } });
  } catch (err) {
    if (err?.code === 11000) {
      // Duplicate key
      return res.status(200).json({ message: 'Already subscribed' });
    }
    console.error('subscribe error:', err);
    return res.status(500).json({ message: 'Failed to subscribe' });
  }
});

module.exports = router;
