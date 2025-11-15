import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired } from '../middleware/auth.js';
import { sendError } from '../utils/errors.js';
import {
  createTripSchema,
  updateTripSchema,
  inviteMemberSchema,
  itineraryItemSchema,
} from '../validation/trips.js';

const prisma = new PrismaClient();
const router = Router();

// GET /api/trips
router.get('/', authRequired, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { ownerId: req.user.id },
      orderBy: { startDate: 'asc' },
    });
    res.json(trips);
  } catch (err) {
    console.error('Error listing trips', err);
    sendError(res, 500, 'Failed to list trips', 500);
  }
});

// POST /api/trips
router.post('/', authRequired, async (req, res) => {
  try {
    const parsed = createTripSchema.parse(req.body);
    const trip = await prisma.trip.create({
      data: {
        ownerId: req.user.id,
        name: parsed.name,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        notes: parsed.notes ?? null,
      },
    });
    res.status(201).json(trip);
  } catch (err) {
    if (err.name === 'ZodError') {
      return sendError(res, 400, err.errors.map(e => e.message).join('; '), 400);
    }
    console.error('Error creating trip', err);
    sendError(res, 500, 'Failed to create trip', 500);
  }
});

// GET /api/trips/:id
router.get('/:id', authRequired, async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
      },
      include: {
        members: true,
        itinerary: true,
      },
    });
    if (!trip) {
      return sendError(res, 404, 'Trip not found', 404);
    }
    res.json(trip);
  } catch (err) {
    console.error('Error getting trip', err);
    sendError(res, 500, 'Failed to get trip', 500);
  }
});

// PATCH /api/trips/:id
router.patch('/:id', authRequired, async (req, res) => {
  try {
    const parsed = updateTripSchema.parse(req.body);
    const existing = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id,
      },
    });
    if (!existing) {
      return sendError(res, 404, 'Trip not found', 404);
    }
    const trip = await prisma.trip.update({
      where: { id: existing.id },
      data: {
        name: parsed.name ?? existing.name,
        startDate: parsed.startDate ? new Date(parsed.startDate) : existing.startDate,
        endDate: parsed.endDate ? new Date(parsed.endDate) : existing.endDate,
        notes: parsed.notes ?? existing.notes,
      },
    });
    res.json(trip);
  } catch (err) {
    if (err.name === 'ZodError') {
      return sendError(res, 400, err.errors.map(e => e.message).join('; '), 400);
    }
    console.error('Error updating trip', err);
    sendError(res, 500, 'Failed to update trip', 500);
  }
});

// DELETE /api/trips/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const existing = await prisma.trip.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) {
      return sendError(res, 404, 'Trip not found', 404);
    }
    await prisma.itineraryItem.deleteMany({ where: { tripId: existing.id } });
    await prisma.tripMember.deleteMany({ where: { tripId: existing.id } });
    await prisma.trip.delete({ where: { id: existing.id } });
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error deleting trip', err);
    sendError(res, 500, 'Failed to delete trip', 500);
  }
});

// POST /api/trips/:id/members
router.post('/:id/members', authRequired, async (req, res) => {
  try {
    const parsed = inviteMemberSchema.parse(req.body);
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!trip) {
      return sendError(res, 404, 'Trip not found', 404);
    }
    // TODO: look up or create user by email; stubbed as owner for now.
    const member = await prisma.tripMember.create({
      data: {
        tripId: trip.id,
        userId: req.user.id,
        role: parsed.role,
      },
    });
    res.status(201).json({ inviteId: member.id });
  } catch (err) {
    if (err.name === 'ZodError') {
      return sendError(res, 400, err.errors.map(e => e.message).join('; '), 400);
    }
    console.error('Error inviting member', err);
    sendError(res, 500, 'Failed to invite member', 500);
  }
});

// POST /api/trips/:id/itinerary
router.post('/:id/itinerary', authRequired, async (req, res) => {
  try {
    const parsed = itineraryItemSchema.parse(req.body);
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!trip) {
      return sendError(res, 404, 'Trip not found', 404);
    }
    const item = await prisma.itineraryItem.create({
      data: {
        tripId: trip.id,
        dayIndex: parsed.dayIndex,
        title: parsed.title,
        notes: null,
        startTime: parsed.time ? new Date(parsed.time) : null,
        endTime: null,
        placeId: parsed.placeId ?? null,
        lat: null,
        lng: null,
        createdBy: req.user.id,
      },
    });
    res.status(201).json({ itemId: item.id });
  } catch (err) {
    if (err.name === 'ZodError') {
      return sendError(res, 400, err.errors.map(e => e.message).join('; '), 400);
    }
    console.error('Error creating itinerary item', err);
    sendError(res, 500, 'Failed to create itinerary item', 500);
  }
});

export default router;
