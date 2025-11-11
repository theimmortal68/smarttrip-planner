// src/routes/auth.js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const { findOrCreateUserByGoogle } = require('../services/users');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Placeholder route for redirect-based Google OAuth.
 * Frontend apps using Google One Tap or direct ID token exchange
 * do not need to call this endpoint.
 */
router.get('/google/start', (_req, res) => {
  res.status(501).json({
    error: { code: 501, message: 'Redirect-based OAuth not implemented' },
  });
});

/**
 * POST /api/auth/google/exchange
 * The frontend sends a Google ID token here to get back a JWT for SmartTrip.
 */
router.post('/google/exchange', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res
        .status(400)
        .json({ error: { code: 400, message: 'Missing idToken' } });
    }

    // Verify the ID token using Google's library
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // { sub, email, name, picture, ... }

    // Create or update user record
    const user = await findOrCreateUserByGoogle(payload);

    // Create our own short-lived app JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role || 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '45m' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Returns the current authenticated user's info.
 */
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;