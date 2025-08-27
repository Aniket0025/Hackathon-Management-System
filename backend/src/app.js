const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const teamRoutes = require('./routes/teams');
const analyticsRoutes = require('./routes/analytics');
const communityRoutes = require('./routes/community');
const submissionRoutes = require('./routes/submissions');
const mailRoutes = require('./routes/mail');
const judgesRoutes = require('./routes/judges');
const notificationsRoutes = require('./routes/notifications');
const evaluationsRoutes = require('./routes/evaluations');
const invitesRoutes = require('./routes/invites');
const paymentsRoutes = require('./routes/payments');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const subscribersRoutes = require('./routes/subscribers');

const app = express();

// Security & utils
app.use(helmet());
app.use(morgan('dev'));
// Increase body size limits to avoid 'entity.too.large' for bigger payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS
const normalize = (url) => (url || '').replace(/\/$/, '');
const origins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => normalize(s.trim()))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin (e.g., curl, same-origin SSR)
    if (!origin) return callback(null, true);
    // In development, allow all origins for easier local testing
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    const o = normalize(origin);
    if (origins.includes(o)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Dev-only CORS fallback to ensure headers on all responses (especially OPTIONS)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

// Rate limit (basic)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use(limiter);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/judges', judgesRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/invites', invitesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscribers', subscribersRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
