// ============================================================================
//  src/routes/auth.js
//  Authentication routes for SmartTrip.
//  * Google ID token exchange -- SmartTrip JWT
//  * Current user info (/me)
// ============================================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const auth = require('../middleware/auth');
const { findOrCreateUserByGoogle } = require('../services/users');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================================================
//  GET /api/auth/google/start
//  Placeholder for redirect-based Google OAuth.
//  Frontends using Google One Tap / direct ID token exchange
//  do not need this endpoint.
// ============================================================================
router.get('/google/start', (_req, res) => {
  res.status(501).json({
    error: { code: 501, message: 'Redirect-based OAuth not implemented' },
  });
});

// ============================================================================
//  POST /api/auth/google/exchange
//  Frontend sends a Google ID token and receives an app-specific JWT.
//  Flow:
//    First, verify the Google ID token
//    Next, find or create a user record in our DB
//    Finally, issue a timed JWT for SmartTrip
// ============================================================================
router.post('/google/exchange', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: { code: 400, message: 'Missing idToken' },
      });
    }

    // Verify the ID token using Google's library
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload(); // { sub, email, name, picture, etc }

    // Create or update user record based on Google identity
    const user = await findOrCreateUserByGoogle(payload);

    // Create our own timed app JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role || 'owner' },
      process.env.JWT_SECRET,
      { expiresIn: '45m' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
//  GET /api/auth/me
//  Returns the current authenticated user's info based on the JWT payload.
// ============================================================================
router.get('/me', auth, (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;