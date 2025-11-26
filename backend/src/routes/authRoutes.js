const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService');
const authenticateToken = require('../middleware/auth');
const prisma = require('../../db/prisma');

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { findOrCreateUserByGoogle } = require('../services/users');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { user, token } = await registerUser({ firstName, lastName, email, password });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.message.includes('Email already in use')) {
      return res.status(409).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // this is the "simple email + password" part:
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { user, token } = await loginUser({ email, password });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    if (err.message.includes('Invalid email or password')) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

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
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '45m' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
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

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

module.exports = router;