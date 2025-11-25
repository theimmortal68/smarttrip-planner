// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService');
const { google } = require('googleapis');
const prisma = require('../../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// =======================
// Email/Password Register
// =======================

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    if (err.message.includes('Email already in use')) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// =======================
// Email/Password Login
// =======================

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await loginUser({ email, password });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
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

// =======================
// Google OAuth2
// =======================

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// GET /api/auth/google
// Start Google OAuth flow
router.get('/google', (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
    });
    res.redirect(url);
  } catch (err) {
    console.error('Error generating Google auth URL:', err);
    res.status(500).json({ message: 'Failed to start Google login' });
  }
});

// GET /api/auth/google/callback
// Handle Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Missing authorization code' });
  }

  try {
    // 1) Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 2) Fetch user profile
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data: profile } = await oauth2.userinfo.get();

    const email = profile.email;
    const firstName = profile.given_name || '';
    const lastName = profile.family_name || '';

    if (!email) {
      console.error('Google profile missing email:', profile);
      return res
        .status(400)
        .json({ message: 'Google did not provide an email address' });
    }

    // 3) Find or create a user in our DB
    let user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          email,
          first_name: firstName,
          last_name: lastName,
          // password_hash can remain null for Google-only accounts
        },
      });
    }

    // 4) Create JWT
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5) Send back a tiny HTML page that stores the token and redirects
    const frontendBase =
      process.env.FRONTEND_BASE_URL || 'https://smarttrip.myflix.media';

    const redirectPath = '/homepage';

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Signing you in...</title>
        </head>
        <body>
          <script>
            try {
              window.localStorage.setItem('token', ${JSON.stringify(token)});
              window.location.href = ${JSON.stringify(
                frontendBase + redirectPath
              )};
            } catch (e) {
              console.error('Failed to store token in localStorage', e);
              window.location.href = ${JSON.stringify(
                frontendBase + '/login?error=storage'
              )};
            }
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.status(500).json({ message: 'Failed to complete Google login' });
  }
});

module.exports = router;
