const express = require("express");
const prisma = require("../../db/prisma");
const auth = require("../middleware/auth");
const { formatTimeTo12h } = require("../utils/time");

const router = express.Router();


// Helper to determine the user's role for a given trip
async function getUserTripRole(userId, tripId) {
  const trip = await prisma.trips.findUnique({
    where: { id: tripId }
  });

  if (!trip) {
    return { trip: null, role: null };
  }

  if (trip.creator_id === userId) {
    // Treat creator as 'owner'
    return { trip, role: 'owner' };
  }

  const membership = await prisma.trip_members.findFirst({
    where: { trip_id: tripId, user_id: userId }
  });

  return { trip, role: membership?.role || null };
}

// ------------------------------
// GET /api/trips
// Get all trips for the logged-in user
// ------------------------------
router.get("/", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const trips = await prisma.trips.findMany({
      where: { creator_id: userId },
      orderBy: { start_date: "asc" },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
      },
    });

    // Map DB fields → frontend-friendly response
    const response = trips.map((t) => ({
      id: t.id,
      name: t.location,
      location: t.location,
      startDate: t.start_date,
      endDate: t.end_date,
    }));

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// GET /api/trips/:id
// Trip details for TripOverview page
// ------------------------------
router.get("/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.id);

    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const response = {
      id: trip.id,
      name: trip.location,
      location: trip.location,
      startDate: trip.start_date,
      endDate: trip.end_date,
      notes: trip.notes || "",
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// POST /api/trips
// Create a new trip
// ------------------------------
router.post("/", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const { name, location, startDate, endDate, notes } = req.body;

    const trip = await prisma.trips.create({
      data: {
        creator_id: userId,
        location: location || name, // fallback
        start_date: new Date(startDate) ?? existing.start_date,
        end_date: new Date(endDate) ?? existing.end_date,
        notes: notes || null,
      },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    // Ensure owner is loaded to trip_members with owner
    await prisma.trip_members.upsert({
      where: {
        user_id_trip_id: {
          user_id: userId,
          trip_id: trip.id,
        },
      },
      update: {
        role: "owner",
      },
      create: {
        user_id: userId,
        trip_id: trip.id,
        role: "owner",
      },
    });

    const response = {
      id: trip.id,
      name: trip.location,
      location: trip.location,
      startDate: trip.start_date,
      endDate: trip.end_date,
      notes: trip.notes,
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// PUT /api/trips/:id
// Update a trip
// ------------------------------
router.put("/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.id);

    // Ensure the trip belongs to the current user
    const existing = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { name, location, startDate, endDate, notes } = req.body;

    const updated = await prisma.trips.update({
      where: { id: tripId },
      data: {
        location: location || name || existing.location,
        start_date: new Date(startDate) ?? existing.start_date,
        end_date: new Date(endDate) ?? existing.end_date,
        notes: notes ?? existing.notes,
      },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    const response = {
      id: updated.id,
      name: updated.location,
      location: updated.location,
      startDate: updated.start_date,
      endDate: updated.end_date,
      notes: updated.notes,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// DELETE /api/trips/:id
// Delete a trip
// ------------------------------
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.id);

    const existing = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Trip not found" });
    }

    await prisma.trips.delete({
      where: { id: tripId },
    });

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// GET /api/trips/:tripId/itinerary
// List itinerary items for a trip (owner only)
// ------------------------------
router.get("/:tripId/itinerary", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const items = await prisma.itinerary_items.findMany({
      where: { trip_id: tripId },
      orderBy: [
        { day_index: "asc" },
        { sort_order: "asc" },
        { start_time: "asc" },
      ],
      select: {
        id: true,
        day_index: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        location_name: true,
        activity_type: true,
        notes: true,
      },
    });

    const response = items.map((item) => ({
      id: item.id,
      dayIndex: item.day_index,
      title: item.title,
      description: item.description,
      startTime: formatTimeTo12h(item.start_time),
      endTime: formatTimeTo12h(item.end_time),
      locationName: item.location_name,
      activityType: item.activity_type,
      notes: item.notes,
    }));

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// POST /api/trips/:tripId/itinerary
// Create an itinerary item for a trip
// ------------------------------
router.post("/:tripId/itinerary", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Expect camelCase from frontend
    const {
      dayIndex,
      title,
      description,
      startTime,
      endTime,
      locationName,
      activityType,
      notes,
    } = req.body;

    const item = await prisma.itinerary_items.create({
      data: {
        trip_id: tripId,
        day_index: dayIndex ?? null,
        title,
        description: description ?? null,
        start_time: startTime ? new Date(startTime) : null,
        end_time: endTime ? new Date(endTime) : null,
        location_name: locationName ?? null,
        activity_type: activityType ?? null,
        notes: notes ?? null,
        created_by: userId,
        updated_by: userId,
      },
      select: {
        id: true,
        day_index: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        location_name: true,
        activity_type: true,
        notes: true,
      },
    });

    const response = {
      id: item.id,
      dayIndex: item.day_index,
      title: item.title,
      description: item.description,
      startTime: formatTimeTo12h(item.start_time),
      endTime: formatTimeTo12h(item.end_time),
      locationName: item.location_name,
      activityType: item.activity_type,
      notes: item.notes,
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// PUT /api/trips/:tripId/itinerary/:itemId
// Update an itinerary item
// ------------------------------
router.put("/:tripId/itinerary/:itemId", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);

    if (Number.isNaN(tripId) || Number.isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Ensure the item belongs to this trip
    const existing = await prisma.itinerary_items.findFirst({
      where: { id: itemId, trip_id: tripId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Itinerary item not found" });
    }

    const {
      dayIndex,
      title,
      description,
      startTime,
      endTime,
      locationName,
      activityType,
      notes,
    } = req.body;

    const updated = await prisma.itinerary_items.update({
      where: { id: itemId },
      data: {
        day_index: dayIndex ?? existing.day_index,
        title: title ?? existing.title,
        description: description ?? existing.description,
        start_time: startTime ? new Date(startTime) : existing.start_time,
        end_time: endTime ? new Date(endTime) : existing.end_time,
        location_name: locationName ?? existing.location_name,
        activity_type: activityType ?? existing.activity_type,
        notes: notes ?? existing.notes,
        updated_by: userId,
        updated_at: new Date(),
      },
      select: {
        id: true,
        day_index: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        location_name: true,
        activity_type: true,
        notes: true,
      },
    });

    const response = {
      id: updated.id,
      dayIndex: updated.day_index,
      title: updated.title,
      description: updated.description,
      startTime: formatTimeTo12h(updated.start_time),
      endTime: formatTimeTo12h(updated.end_time),
      locationName: updated.location_name,
      activityType: updated.activity_type,
      notes: updated.notes,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// DELETE /api/trips/:tripId/itinerary/:itemId
// Delete an itinerary item
// ------------------------------
router.delete("/:tripId/itinerary/:itemId", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);

    if (Number.isNaN(tripId) || Number.isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Ensure the item belongs to this trip
    const existing = await prisma.itinerary_items.findFirst({
      where: { id: itemId, trip_id: tripId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Itinerary item not found" });
    }

    await prisma.itinerary_items.delete({
      where: { id: itemId },
    });

    res.json({ message: "Itinerary item deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// GET /api/trips/:tripId/members
// List members for a trip (owner only)
// ------------------------------
router.get("/:tripId/members", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const members = await prisma.trip_members.findMany({
      where: { trip_id: tripId },
      orderBy: { id: "asc" },
      include: {
        users: true, // join to users table for name/email
      },
    });

    const response = members.map((m) => ({
      id: m.id, // trip_members id (used for delete)
      userId: m.user_id,
      name: m.users?.name || null,
      email: m.users?.email || null,
      role: m.role,
      joinedAt: m.joined_at,
    }));

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// POST /api/trips/:tripId/members
// Add (or update) a trip member by email + role
// ------------------------------
router.post("/:tripId/members", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    // Find the user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User with that email not found" });
    }

    // Check if they are already a member of this trip
    const existing = await prisma.trip_members.findFirst({
      where: { trip_id: tripId, user_id: user.id },
    });

    let member;

    if (existing) {
      // Update the role if they already exist
      member = await prisma.trip_members.update({
        where: { id: existing.id },
        data: { role },
        include: { users: true },
      });
    } else {
      // Create a new membership
      member = await prisma.trip_members.create({
        data: {
          trip_id: tripId,
          user_id: user.id,
          role,
        },
        include: { users: true },
      });
    }

    const response = {
      id: member.id,
      userId: member.user_id,
      name: member.users?.name || null,
      email: member.users?.email || null,
      role: member.role,
      joinedAt: member.joined_at,
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// ------------------------------
// DELETE /api/trips/:tripId/members/:memberId
// Remove a member from a trip (owner only)
// ------------------------------
router.delete("/:tripId/members/:memberId", auth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const tripId = Number(req.params.tripId);
    const memberId = Number(req.params.memberId);

    if (Number.isNaN(tripId) || Number.isNaN(memberId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Ensure the trip belongs to the current user
    const trip = await prisma.trips.findFirst({
      where: { id: tripId, creator_id: userId },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Ensure this member belongs to the given trip
    const existing = await prisma.trip_members.findFirst({
      where: { id: memberId, trip_id: tripId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Trip member not found" });
    }

    await prisma.trip_members.delete({
      where: { id: memberId },
    });

    res.json({ message: "Trip member removed successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
