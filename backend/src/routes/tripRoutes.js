const express = require("express");
const prisma = require("../../db/prisma");
const auth = require("../middleware/auth");
const { formatTimeTo12h } = require("../utils/time");

const router = express.Router();

/**
 * Helper to determine the user's role for a given trip.
 *
 *   Returns:
 *     trip: a minimal trip object (id, creator_id, trip_members for this user)
 *     role: owner, co_owner, editor, viewer, or null if not a member
 */
async function getUserTripRole(userId, tripId) {
  const trip = await prisma.trips.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      creator_id: true,
      trip_members: {
        where: { user_id: userId },
        select: { role: true },
      },
    },
  });

  if (!trip) {
    return { trip: null, role: null };
  }

  // Treat creator as "owner"
  if (trip.creator_id === userId) {
    return { trip, role: "owner" };
  }

  const membership = trip.trip_members[0];
  return { trip, role: membership?.role || null };
}

/* ========================================================================== */
/*                               DEBUG ROUTES                                  */
/* ========================================================================== */

// This section saved for DEBUG testing

/* ========================================================================== */
/*                               TRIP ROUTES                                  */
/* ========================================================================== */

/*
    GET /api/trips
    Get all trips for the logged-in user
    (owner or member of the trip)
*/

router.get("/", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);

    if (!userId) {
      return res.status(400).json({ error: "Missing or invalid user id" });
    }

    const trips = await prisma.trips.findMany({
      where: {
        OR: [
          { creator_id: userId },
          { trip_members: { some: { user_id: userId } } },
        ],
      },
      orderBy: { start_date: "asc" },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
        trip_members: {
          where: { user_id: userId },
          select: { role: true },
        },
      },
    });

    const response = trips.map((t) => {
      // if the user is the creator, they are the owner
      const membershipRole = t.trip_members[0]?.role || null;
      const effectiveRole = t.creator_id === userId ? "owner" : membershipRole;

      return {
        id: t.id,
        name: t.location,
        location: t.location,
        startDate: t.start_date,
        endDate: t.end_date,
        role: effectiveRole,
      };
    });

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/* 
    GET /api/trips/:id
    Trip details for TripOverview page
    Any member (or owner) can view
*/
router.get("/:id", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Must be owner or any member to view
    if (trip && !role) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this trip" });
    }

    const fullTrip = await prisma.trips.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    const response = {
      id: fullTrip.id,
      name: fullTrip.location,
      location: fullTrip.location,
      startDate: fullTrip.start_date,
      endDate: fullTrip.end_date,
      notes: fullTrip.notes || "",
      role,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

/*
    POST /api/trips
    Create a new trip
    Owner is creator_id and also added
    as a trip_members row with role "owner"
*/
router.post("/", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const { name, location, startDate, endDate, notes } = req.body;

    // Require minimum trip information
    if (!name && !location && !startDate && !endDate) {
      return res
        .status(400)
        .json({
          error:
            "Minimum trip details required: Name/Location, Start & End Dates.",
        });
    }

    const trip = await prisma.trips.create({
      data: {
        creator_id: userId,
        location: location || name, // fallback
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
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

    // Ensure owner is also stored in trip_members as role "owner"
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

/*
    PUT /api/trips/:id
    Update a trip
    Allowed roles: owner, co_owner
*/
router.put("/:id", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Only owner or co_owner can update trip details
    if (!["owner", "co_owner"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this trip" });
    }

    const existing = await prisma.trips.findUnique({
      where: { id: tripId },
    });

    const { name, location, startDate, endDate, notes } = req.body;

    const updated = await prisma.trips.update({
      where: { id: tripId },
      data: {
        location: location || name || existing.location,
        start_date: startDate ? new Date(startDate) : existing.start_date,
        end_date: endDate ? new Date(endDate) : existing.end_date,
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

/*
    DELETE /api/trips/:id
    Delete a trip
    Allowed roles: owner only
*/
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Only owner can delete the trip
    if (role !== "owner") {
      return res
        .status(403)
        .json({ error: "Only the owner can delete this trip" });
    }

    await prisma.trips.delete({
      where: { id: tripId },
    });

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    next(err);
  }
});

/* ========================================================================== */
/*                             ITINERARY ROUTES                               */
/* ========================================================================== */

/*
    GET /api/trips/:tripId/itinerary
    List itinerary items for a trip
    Allowed roles: any member (owner, co_owner, editor, viewer)
*/
router.get("/:tripId/itinerary", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Must at least be a member to view itinerary
    if (trip && !role) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this itinerary" });
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

/* ------------------------------
    POST /api/trips/:tripId/itinerary
    Create an itinerary item for a trip
    Allowed roles: owner, co_owner, editor
*/
router.post("/:tripId/itinerary", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!["owner", "co_owner", "editor"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify itinerary" });
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

/* ------------------------------
    PUT /api/trips/:tripId/itinerary/:itemId
    Update an itinerary item
    Allowed roles: owner, co_owner, editor
*/
router.put("/:tripId/itinerary/:itemId", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);

    if (Number.isNaN(tripId) || Number.isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!["owner", "co_owner", "editor"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify itinerary" });
    }

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

/* ------------------------------
    DELETE /api/trips/:tripId/itinerary/:itemId
    Delete an itinerary item
    Allowed roles: owner, co_owner, editor
*/
router.delete("/:tripId/itinerary/:itemId", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);
    const itemId = Number(req.params.itemId);

    if (Number.isNaN(tripId) || Number.isNaN(itemId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!["owner", "co_owner", "editor"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify itinerary" });
    }

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

/* ========================================================================== */
/*                             TRIP MEMBER ROUTES                             */
/* ========================================================================== */

/*
    GET /api/trips/:tripId/members
    List members for a trip
    Allowed roles: owner, co_owner
*/
router.get("/:tripId/members", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    console.log(role);

    if (!["owner", "co_owner"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to manage members" });
    }

    const members = await prisma.trip_members.findMany({
      where: { trip_id: tripId },
      orderBy: { id: "asc" },
      include: {
        users: true,
      },
    });

    const response = members.map((m) => ({
      id: m.id,
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

/*
    POST /api/trips/:tripId/members
    Add (or update) a trip member by email + role
    Allowed roles: owner, co_owner
*/
router.post("/:tripId/members", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!["owner", "co_owner"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to manage members" });
    }

    const { email, role: memberRole } = req.body;

    if (!email || !memberRole) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    // Only allow these roles to be assigned via the API.
    // "owner" is reserved for the trip creator and is added automatically.
    const ALLOWED_MEMBER_ROLES = ["co_owner", "editor", "viewer"];

    if (!ALLOWED_MEMBER_ROLES.includes(memberRole)) {
      return res.status(400).json({
        error: "Invalid role. Allowed roles are co-owner, editor, or viewer.",
      });
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
        data: { role: memberRole },
        include: { users: true },
      });
    } else {
      // Create a new membership
      member = await prisma.trip_members.create({
        data: {
          trip_id: tripId,
          user_id: user.id,
          role: memberRole,
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

/*
    DELETE /api/trips/:tripId/members/:memberId
    Remove a member from a trip
    Allowed roles: owner, co-owner
    But nobody can remove the owner membership
*/
router.delete("/:tripId/members/:memberId", auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const tripId = Number(req.params.tripId);
    const memberId = Number(req.params.memberId);

    if (Number.isNaN(tripId) || Number.isNaN(memberId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (!["owner", "co_owner"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to manage members" });
    }

    const existing = await prisma.trip_members.findFirst({
      where: { id: memberId, trip_id: tripId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Trip member not found" });
    }

    // Prevent removing the owner (creator)
    if (existing.user_id === trip.creator_id || existing.role === "owner") {
      return res.status(403).json({ error: "Cannot remove the trip owner" });
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
