// ============================================================================
//  src/middleware/auth.js
//  Authentication middleware. Verifies JWTs for protected routes.
//  In non-production, falls back to a dev user when no token is provided.
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

req.user = jwt.verify(token, JWT_SECRET);

const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  // No token present
  if (!token) {
    return res.status(401).json({
      error: { code: 401, message: 'Missing Authorization: Bearer' }
    });
  }

  // Token present -- verify JWT
  try {
    // Payload shape: { sub, email, role }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: { code: 403, message: 'Invalid token' } });
  }
};