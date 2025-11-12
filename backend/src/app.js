
// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Route modules
const authRoutes = require('./routes/auth');
const tripsRoutes = require('./routes/trips');

const app = express();



/**
 * For deploying behind a proxy. It helps Express
 * read the correct client IP and proto for secure cookies, etc.
 */
app.set('trust proxy', 1);

/**
 *  Setting the global limiter  
 */
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

/**
 * Parse JSON bodies and log requests
 */
app.use(express.json());
app.use(morgan('dev'));

/**
 * CORS allow-list from env (comma-separated), with local defaults.
 * Example .env:
 *   CORS_ALLOWLIST=http://localhost:5173,https://your-frontend.vercel.app
 */
const allowlist =
  (process.env.CORS_ALLOWLIST || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(s => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser tools where origin may be undefined
      if (!origin) return cb(null, true);
      return cb(null, allowlist.includes(origin));
    },
    credentials: true,
  })
);

/**
 * Health check
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'SmartTrip backend running' });
});

/**
 * Mount API routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: { code: 404, message: 'Not Found' } });
});

/**
 * Central error handler
 */
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: { code: status, message } });
});

module.exports = app;