const express = require('express')
const { auth } = require('../middleware/auth')
const { listNotifications, markRead, markAllRead, broadcastToEvent } = require('../controllers/notificationController')

const router = express.Router()

router.get('/', auth(true), listNotifications)
router.patch('/:id/read', auth(true), markRead)
router.patch('/read-all', auth(true), markAllRead)
router.post('/broadcast-to-event/:eventId', auth(true), broadcastToEvent)

module.exports = router
