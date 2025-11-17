import rateLimit from 'express-rate-limit';

// Global limiter: 60 requests per minute per IP
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Places autocomplete: 5 req/sec per IP
export const placesLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 429,
      message: 'Too many autocomplete requests. Please slow down.',
    },
  },
});
