import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import tripsRouter from './routes/trips.js';
import placesRouter from './routes/places.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    credentials: true,
  }),
);

app.use(globalLimiter);

app.use('/health', healthRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/places', placesRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Not found',
    },
  });
});

export default app;
