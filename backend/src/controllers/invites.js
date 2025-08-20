const crypto = require('crypto');
const Invite = require('../models/Invite');
const User = require('../models/User');
const Event = require('../models/Event');
const { sendMail } = require('../utils/mailer');

function safeBaseUrl(req) {
  const origin = req.headers.origin || '';
  // Fallback to localhost frontend default
  return origin || process.env.FRONTEND_URL || 'http://localhost:3000';
}

exports.createInvite = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { recipientEmail, eventId, teamName } = req.body || {};
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!recipientEmail || !eventId) return res.status(400).json({ message: 'recipientEmail and eventId are required' });

    const ev = await Event.findById(eventId).select('_id title').lean();
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const token = crypto.randomBytes(24).toString('hex');

    const invite = await Invite.create({
      sender: userId,
      recipientEmail: String(recipientEmail).toLowerCase().trim(),
      event: ev._id,
      teamName: teamName || undefined,
      token,
    });

    // Send email with accept link
    try {
      const base = safeBaseUrl(req);
      const acceptUrl = `${base}/invites?token=${encodeURIComponent(token)}`;
      const subject = `You are invited to join a team for ${ev.title || 'an event'}`;
      const html = `
        <p>You have been invited to join a team${teamName ? ` <b>${teamName}</b>` : ''} for the event <b>${ev.title || ''}</b>.</p>
        <p>Click the button below to accept and complete your registration:</p>
        <p><a href="${acceptUrl}" style="background:#0ea5e9;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Accept Invite</a></p>
        <p>If the button does not work, copy and paste this link into your browser:<br>${acceptUrl}</p>
      `;
      await sendMail({ to: recipientEmail, subject, html, text: `Accept invite: ${acceptUrl}` });
    } catch (e) {
      // Log and continue; invite still created
      console.error('invite email error:', e?.message || e);
    }

    return res.json({ message: 'Invite sent', invite: { id: invite._id, token: invite.token, status: invite.status } });
  } catch (err) {
    console.error('createInvite error:', err);
    return res.status(500).json({ message: 'Failed to create invite' });
  }
};

exports.listMyInvites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const me = await User.findById(userId).select('email').lean();
    if (!me?.email) return res.json({ invites: [] });
    const email = String(me.email).toLowerCase();
    const invites = await Invite.find({ recipientEmail: email, status: 'pending' })
      .populate('event', 'title startDate endDate')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ invites });
  } catch (err) {
    console.error('listMyInvites error:', err);
    return res.status(500).json({ message: 'Failed to load invites' });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const me = await User.findById(userId).select('email').lean();
    const inv = await Invite.findOne({ token }).populate('event', '_id').lean();
    if (!inv) return res.status(404).json({ message: 'Invite not found' });
    if (inv.status !== 'pending') return res.status(400).json({ message: 'Invite already handled' });
    if (me?.email && inv.recipientEmail && me.email.toLowerCase() !== String(inv.recipientEmail).toLowerCase()) {
      return res.status(403).json({ message: 'This invite is not addressed to your account' });
    }

    await Invite.updateOne({ _id: inv._id }, { $set: { status: 'accepted' } });
    return res.json({ message: 'Invite accepted', eventId: inv.event?._id || inv.event });
  } catch (err) {
    console.error('acceptInvite error:', err);
    return res.status(500).json({ message: 'Failed to accept invite' });
  }
};
