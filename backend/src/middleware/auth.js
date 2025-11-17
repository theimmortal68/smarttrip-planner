// ============================================================================
//  src/middleware/auth.js
//  Authentication middleware. Verifies JWTs for protected routes.
//  In non-production, falls back to a dev user when no token is provided.
// ============================================================================

const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  // No token present
  if (!token) {
    // Dev fallback. Pretends user "insert user #" is logged in when no token is used.
    // This allows Thunder Client / frontend dev to hit APIs without auth wired.
    if (process.env.NODE_ENV !== 'production') {
      req.user = { sub: 1, email: 'dev@example.com', role: 'owner' };
      return next();
    }

    return res
      .status(401)
      .json({ error: { code: 401, message: 'Missing Authorization: Bearer' } });
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