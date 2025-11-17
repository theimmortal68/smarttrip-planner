import jwt from 'jsonwebtoken';
import { sendError } from '../utils/errors.js';

export function authRequired(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 401, 'Missing or invalid Authorization header', 401);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return sendError(res, 500, 'Server configuration error', 500);
    }
    const payload = jwt.verify(token, secret);

    // { sub, email, role }
    if (!payload.sub || !payload.email || !payload.role) {
      return sendError(res, 401, 'Invalid token payload', 401);
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error('JWT verification failed', err);
    return sendError(res, 401, 'Invalid or expired token', 401);
  }
}
