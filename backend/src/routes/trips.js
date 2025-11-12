// src/routes/trips.js
const router = require('express').Router();
const prisma = require('../db');

// List trips (temporary: all trips)
router.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      select: { id: true, name: true, startDate: true, endDate: true }
    });
    res.json(trips);
  } catch (e) { next(e); }
});

// Create trip (temporary: ownerId passed in body to test DB)
router.post('/', async (req, res, next) => {
  try {
    const { ownerId, name, startDate, endDate, notes } = req.body;
    if (!ownerId || !name || !startDate || !endDate) {
      return res.status(400).json({ error: { code: 400, message: 'ownerId, name, startDate, endDate required' }});
    }
    const trip = await prisma.trip.create({
      data: {
        ownerId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes: notes || null
      }
    });
    res.status(201).json(trip);
  } catch (e) { next(e); }
});

module.exports = router;