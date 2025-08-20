const Notification = require('../models/Notification')
const Event = require('../models/Event')
const Team = require('../models/Team')
const Registration = require('../models/Registration')
const User = require('../models/User')

// GET /api/notifications?status=unread|all&limit=...
async function listNotifications(req, res) {
  try {
    const userId = req.user.id
    const status = (req.query.status || 'unread').toString()
    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 100)

    const match = { recipientUserIds: userId }
    if (status === 'unread') {
      match.readBy = { $ne: userId }
    }

    const items = await Notification.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const withFlags = items.map((n) => ({
      ...n,
      read: Array.isArray(n.readBy) && n.readBy.some((u) => String(u) === String(userId)),
    }))

    res.json({ notifications: withFlags })
  } catch (e) {
    res.status(500).json({ message: 'Failed to load notifications' })
  }
}

// PATCH /api/notifications/:id/read
async function markRead(req, res) {
  try {
    const userId = req.user.id
    const { id } = req.params
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipientUserIds: userId },
      { $addToSet: { readBy: userId } },
      { new: true }
    ).lean()
    if (!updated) return res.status(404).json({ message: 'Notification not found' })
    res.json({ notification: updated })
  } catch (e) {
    res.status(500).json({ message: 'Failed to update notification' })
  }
}

// PATCH /api/notifications/read-all
async function markAllRead(req, res) {
  try {
    const userId = req.user.id
    await Notification.updateMany(
      { recipientUserIds: userId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    )
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ message: 'Failed to mark all as read' })
  }
}

module.exports = { listNotifications, markRead, markAllRead }

// POST /api/notifications/broadcast-to-event/:eventId
async function broadcastToEvent(req, res) {
  try {
    const { eventId } = req.params
    const userId = req.user.id
    // Organizer-only and must own the event
    const ev = await Event.findById(eventId).select('organizer title')
    if (!ev) return res.status(404).json({ message: 'Event not found' })
    if (!ev.organizer || String(ev.organizer) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to notify this event' })
    }

    const { title, message, type = 'info', link, teamIds = [], userIds = [] } = req.body || {}
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title is required' })
    }

    // Collect participant user IDs
    const recipientSet = new Set()

    // 1) From Teams linked to this event (members are User ObjectIds)
    const teamFilter = Array.isArray(teamIds) && teamIds.length > 0
      ? { _id: { $in: teamIds }, event: eventId }
      : { event: eventId }
    const teams = await Team.find(teamFilter).select('members').lean()
    for (const t of teams) {
      for (const m of (t.members || [])) recipientSet.add(String(m))
    }

    // 2) From individual and team Registrations (email -> User) only when not restricting to specific teams
    const regs = await Registration.find({ event: eventId })
      .select({ 'personalInfo.email': 1, 'teamInfo.members.email': 1 })
      .lean()
    const emails = new Set()
    for (const r of regs) {
      const pe = r?.personalInfo?.email
      if (pe) emails.add(String(pe).toLowerCase())
      const members = r?.teamInfo?.members || []
      for (const m of members) {
        if (m?.email) emails.add(String(m.email).toLowerCase())
      }
    }
    if (emails.size > 0) {
      const users = await User.find({ email: { $in: Array.from(emails) } }).select('_id').lean()
      for (const u of users) recipientSet.add(String(u._id))
    }

    // 3) Explicit userIds provided
    if (Array.isArray(userIds)) {
      for (const uid of userIds) if (uid) recipientSet.add(String(uid))
    }

    const recipientUserIds = Array.from(recipientSet)

    if (recipientUserIds.length === 0) {
      return res.status(200).json({ success: true, created: false, recipients: 0 })
    }

    const created = await Notification.create({
      title,
      message,
      type,
      link,
      eventId,
      recipientUserIds,
      readBy: [],
    })

    // Real-time emit to each recipient (if socket server available)
    const io = req.app.get('io')
    if (io && recipientUserIds.length > 0) {
      for (const rid of recipientUserIds) {
        io.to(`user:${rid}`).emit('notification:new', {
          _id: created._id,
          title: created.title,
          message: created.message,
          type: created.type,
          link: created.link,
          eventId: created.eventId,
          createdAt: created.createdAt,
        })
      }
    }

    res.status(201).json({ success: true, created: true, notification: created, recipients: recipientUserIds.length })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to broadcast notification' })
  }
}

module.exports.broadcastToEvent = broadcastToEvent
