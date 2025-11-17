import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { sendError } from '../utils/errors.js';
import { placesLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// TODO: integrate with Google Places Autocomplete API using GOOGLE_API_KEY.
router.get('/autocomplete', authRequired, placesLimiter, async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return sendError(res, 400, 'Query parameter q is required', 400);
  }

  res.json([
    {
      description: `${q} (sample place)`,
      place_id: 'sample_place_id',
    },
  ]);
});

export default router;
