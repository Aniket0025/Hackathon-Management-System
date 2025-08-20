const Event = require('../models/Event');

// POST /api/payments/create-order
// body: { eventId: string }
// reads fee from Event.fees
async function createOrder(req, res, next) {
  try {
    const { eventId } = req.body || {};
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const event = await Event.findById(eventId).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const fee = Number(event.fees || 0);
    if (fee <= 0) {
      // No payment required
      return res.json({ order: null, amount: 0, currency: 'INR', free: true });
    }

    const amountPaise = Math.round(fee * 100);
    // Pure mock: return a simulated order
    const order = {
      id: `order_mock_${Date.now()}`,
      amount: amountPaise,
      currency: 'INR',
      receipt: `evt_${eventId}_${Date.now()}`,
      status: 'created',
      notes: { eventId: String(eventId), eventTitle: event.title || '' },
    };
    return res.json({ order, amount: amountPaise, currency: 'INR', mock: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/verify
// body: { orderId, paymentId, signature }
async function verifyPayment(req, res, next) {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ message: 'orderId is required' });
    // Always verified in simulation
    return res.json({ verified: true, mock: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment };
