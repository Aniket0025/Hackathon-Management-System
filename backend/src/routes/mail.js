const express = require('express');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/mail/send
// body: { to, subject, text?, html? }
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body || {};
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ message: 'to, subject and text or html are required' });
    }

    const info = await sendMail({ to, subject, text, html });
    return res.json({ message: 'Email sent', id: info.messageId });
  } catch (err) {
    console.error('send mail error:', err);
    return res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

// GET /api/mail/test?to=someone@example.com
router.get('/test', async (req, res) => {
  try {
    const to = req.query.to;
    if (!to) return res.status(400).json({ message: 'Provide ?to=email@example.com' });

    const info = await sendMail({
      to,
      subject: 'Test email from Hackathon Management System',
      text: 'This is a plain text test email.',
      html: '<p>This is a <b>test</b> email.</p>',
    });

    return res.json({ message: 'Test email sent', id: info.messageId });
  } catch (err) {
    console.error('test mail error:', err);
    return res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
});

module.exports = router;
