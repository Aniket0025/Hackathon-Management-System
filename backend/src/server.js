require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    // Socket.IO setup with JWT auth
    const { Server } = require('socket.io');
    const normalize = (url) => (url || '').replace(/\/$/, '');
    const allowedOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map((s) => normalize(s.trim()))
      .filter(Boolean);

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (process.env.NODE_ENV !== 'production') return callback(null, true);
          const o = normalize(origin);
          if (allowedOrigins.includes(o)) return callback(null, true);
          return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
      },
    });

    // expose io on app for controllers to emit
    app.set('io', io);

    // Auth middleware for sockets
    io.use((socket, next) => {
      try {
        // token can come via auth, query, or header
        const authToken = socket.handshake.auth?.token
          || socket.handshake.query?.token
          || socket.handshake.headers?.authorization;

        let token = null;
        if (typeof authToken === 'string') {
          token = authToken.startsWith('Bearer ')
            ? authToken.slice(7)
            : authToken;
        }
        if (!token) return next(new Error('No token'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, role }
        next();
      } catch (e) {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.user?.id;
      if (userId) {
        socket.join(`user:${userId}`);
      }
      console.log('Socket connected', { sid: socket.id, userId });

      // Simple hello for verification
      socket.emit('server:hello', { message: 'Welcome to HackHost realtime' });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected', { sid: socket.id, reason });
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
