import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'SmartTrip backend running',
  });
});

export default router;
