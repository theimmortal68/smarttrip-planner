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
        creator_id: true,
        name: true,
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
        name: t.name,
        location: t.location,
        startDate: t.start_date,
        endDate: t.end_date,
        role: effectiveRole,
      };
    });

    res.json(response);
    } catch (err) {
        console.error("Error in GET /api/trips:", err);
        err.status = 500;
        err.message = 'Failed to fetch trips';
        return next(err);
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
        name: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    const response = {
      id: fullTrip.id,
      name: fullTrip.name,
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
router.post("", auth, async (req, res, next) => {
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
        name: name,
        location: location,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        notes: notes || null,
      },
      select: {
        id: true,
        name: true,
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
      name: trip.name,
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
        name: name || existing.name,
        location: location || existing.location,
        start_date: startDate ? new Date(startDate) : existing.start_date,
        end_date: endDate ? new Date(endDate) : existing.end_date,
        notes: notes ?? existing.notes,
      },
      select: {
        id: true,
        name: true,
        location: true,
        start_date: true,
        end_date: true,
        notes: true,
      },
    });

    const response = {
      id: updated.id,
      name: updated.name,
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
    if (!role) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this itinerary" });
    }

    const items = await prisma.itinerary_items.findMany({
      where: { trip_id: tripId },
      orderBy: [
        { sort_order: "asc" },
        { start_time: "asc" },
      ],
      select: {
        id: true,
        item_type: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        venue: true,
        address: true,
        phone: true,
        website: true,
        email: true,
        provider: true,
        confirmation_number: true,
        total_cost: true,
        number_of_guests: true,
        location_name: true,
        activity_type: true,
        google_place_id: true,
        notes: true,
      },
    });

    if (items.length === 0) {
      return res.json([]);
    }

    const itemIds = items.map((i) => i.id);

    // Fetch child records for all items
    const [flights, carRentals, lodging, activities] = await Promise.all([
      prisma.flight_itinerary.findMany({
        where: { itinerary_item_id: { in: itemIds } },
        select: {
          id: true,
          itinerary_item_id: true,
          flight_number: true,
          airline: true,
          departure_airport: true,
          arrival_airport: true,
        },
      }),
      prisma.car_rental_itinerary.findMany({
        where: { itinerary_item_id: { in: itemIds } },
        select: {
          id: true,
          itinerary_item_id: true,
          pickup_location: true,
          pickup_address: true,
          pickup_phone: true,
          dropoff_location: true,
          dropoff_address: true,
          dropoff_phone: true,
          car_type: true,
        },
      }),
      prisma.lodging_itinerary.findMany({
        where: { itinerary_item_id: { in: itemIds } },
        select: {
          id: true,
          itinerary_item_id: true,
          lodging_type: true,
          rooms: true,
          beds: true,
          price_per_room: true,
        },
      }),
      prisma.activity_itinerary.findMany({
        where: { itinerary_item_id: { in: itemIds } },
        select: {
          id: true,
          itinerary_item_id: true,
          activity_type: true,
          difficulty_level: true,
          meeting_location: true,
          meeting_instructions: true,
          certification_required: true,
          certification_details: true,
          min_age: true,
          max_participants: true,
          equipment_needed: true,
          dress_code: true,
          booking_required: true,
          additional_costs: true,
          additional_costs_description: true,
        },
      }),
    ]);

    // Build lookup maps keyed by itinerary_item_id
    const flightMap = {};
    for (const f of flights) {
      flightMap[f.itinerary_item_id] = {
        id: f.id,
        itineraryItemId: f.itinerary_item_id,
        flightNumber: f.flight_number,
        airline: f.airline,
        departureAirport: f.departure_airport,
        arrivalAirport: f.arrival_airport,
      };
    }

    const carRentalMap = {};
    for (const c of carRentals) {
      carRentalMap[c.itinerary_item_id] = {
        id: c.id,
        itineraryItemId: c.itinerary_item_id,
        pickupLocation: c.pickup_location,
        pickupAddress: c.pickup_address,
        pickupPhone: c.pickup_phone,
        dropoffLocation: c.dropoff_location,
        dropoffAddress: c.dropoff_address,
        dropoffPhone: c.dropoff_phone,
        carType: c.car_type,
      };
    }

    const lodgingMap = {};
    for (const l of lodging) {
      lodgingMap[l.itinerary_item_id] = {
        id: l.id,
        itineraryItemId: l.itinerary_item_id,
        lodgingType: l.lodging_type,
        rooms: l.rooms,
        beds: l.beds,
        pricePerRoom: l.price_per_room,
      };
    }

    const activityMap = {};
    for (const a of activities) {
      activityMap[a.itinerary_item_id] = {
        id: a.id,
        itineraryItemId: a.itinerary_item_id,
        activityType: a.activity_type,
        difficultyLevel: a.difficulty_level,
        meetingLocation: a.meeting_location,
        meetingInstructions: a.meeting_instructions,
        certificationRequired: a.certification_required,
        certificationDetails: a.certification_details,
        minAge: a.min_age,
        maxParticipants: a.max_participants,
        equipmentNeeded: a.equipment_needed,
        dressCode: a.dress_code,
        bookingRequired: a.booking_required,
        additionalCosts: a.additional_costs,
        additionalCostsDescription: a.additional_costs_description,
      };
    }

    const response = items.map((item) => {
      const flight = flightMap[item.id] || null;
      const carRental = carRentalMap[item.id] || null;
      const lodgingItem = lodgingMap[item.id] || null;
      const activityItem = activityMap[item.id] || null;

      const { date: startDate, time: startTime } = splitDateTime(item.start_time);
      const { date: endDate, time: endTime } = splitDateTime(item.end_time);

      return {
        id: item.id,
        itemType: item.item_type,
        title: item.title,
        description: item.description,
        startDate,
        startTime,
        endDate,
        endTime,
        venue: item.venue,
        address: item.address,
        phone: item.phone,
        website: item.website,
        email: item.email,
        provider: item.provider,
        confirmationNumber: item.confirmation_number,
        totalCost: item.total_cost,
        numberOfGuests: item.number_of_guests,
        locationName: item.location_name,
        activityType: item.activity_type,
        googlePlaceId: item.google_place_id,
        notes: item.notes,
        details: {
          flight,
          carRental,
          lodging: lodgingItem,
          activity: activityItem,
        },
      };
    });

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
      itemType,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      venue,
      address,
      phone,
      website,
      email,
      provider,
      confirmationNumber,
      totalCost,
      numberOfGuests,
      locationName,
      activityType,
      googlePlaceId,
      notes,
      details = {},
    } = req.body;

    if (!itemType || !title) {
      return res
        .status(400)
        .json({ error: "itemType and title are required" });
    }

    // Convert separate UI fields into MySQL DATETIME
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime   = combineDateAndTime(endDate, endTime);

    // Create base itinerary item
    const item = await prisma.itinerary_items.create({
      data: {
        trip_id: tripId,
        item_type: itemType,
        title,
        description: description ?? null,
        start_time: startDateTime ? new Date(startDateTime) : null,
        end_time: endDateTime ? new Date(endDateTime) : null,
        venue: venue ?? null,
        address: address ?? null,
        phone: phone ?? null,
        website: website ?? null,
        email: email ?? null,
        provider: provider ?? null,
        confirmation_number: confirmationNumber ?? null,
        total_cost: totalCost ?? null,
        number_of_guests: numberOfGuests ?? null,
        location_name: locationName ?? null,
        activity_type: activityType ?? null,
        google_place_id: googlePlaceId ?? null,
        notes: notes ?? null,
        created_by: userId,
        updated_by: userId,
      },
      select: {
        id: true,
        item_type: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        venue: true,
        address: true,
        phone: true,
        website: true,
        email: true,
        provider: true,
        confirmation_number: true,
        total_cost: true,
        number_of_guests: true,
        location_name: true,
        activity_type: true,
        google_place_id: true,
        notes: true,
      },
    });

    let flight = null;
    let carRental = null;
    let lodging = null;
    let activity = null;

    // Create child record based on itemType, if details provided
    switch (itemType) {
      case "flight": {
        const flightDetails = details.flight || {};
        flight = await prisma.flight_itinerary.create({
          data: {
            itinerary_item_id: item.id,
            flight_number: flightDetails.flightNumber ?? null,
            airline: flightDetails.airline ?? null,
            departure_airport: flightDetails.departureAirport ?? null,
            arrival_airport: flightDetails.arrivalAirport ?? null,
          },
          select: {
            id: true,
            itinerary_item_id: true,
            flight_number: true,
            airline: true,
            departure_airport: true,
            arrival_airport: true,
          },
        });
        flight = {
          id: flight.id,
          itineraryItemId: flight.itinerary_item_id,
          flightNumber: flight.flight_number,
          airline: flight.airline,
          departureAirport: flight.departure_airport,
          arrivalAirport: flight.arrival_airport,
        };
        break;
      }
      case "car_rental": {
        const carDetails = details.carRental || {};
        carRental = await prisma.car_rental_itinerary.create({
          data: {
            itinerary_item_id: item.id,
            pickup_location: carDetails.pickupLocation ?? null,
            pickup_address: carDetails.pickupAddress ?? null,
            pickup_phone: carDetails.pickupPhone ?? null,
            dropoff_location: carDetails.dropoffLocation ?? null,
            dropoff_address: carDetails.dropoffAddress ?? null,
            dropoff_phone: carDetails.dropoffPhone ?? null,
            car_type: carDetails.carType ?? null,
          },
          select: {
            id: true,
            itinerary_item_id: true,
            pickup_location: true,
            pickup_address: true,
            pickup_phone: true,
            dropoff_location: true,
            dropoff_address: true,
            dropoff_phone: true,
            car_type: true,
          },
        });
        carRental = {
          id: carRental.id,
          itineraryItemId: carRental.itinerary_item_id,
          pickupLocation: carRental.pickup_location,
          pickupAddress: carRental.pickup_address,
          pickupPhone: carRental.pickup_phone,
          dropoffLocation: carRental.dropoff_location,
          dropoffAddress: carRental.dropoff_address,
          dropoffPhone: carRental.dropoff_phone,
          carType: carRental.car_type,
        };
        break;
      }
      case "lodging": {
        const lodgingDetails = details.lodging || {};
        lodging = await prisma.lodging_itinerary.create({
          data: {
            itinerary_item_id: item.id,
            lodging_type: lodgingDetails.lodgingType ?? null,
            rooms: lodgingDetails.rooms ?? null,
            beds: lodgingDetails.beds ?? null,
            price_per_room: lodgingDetails.pricePerRoom ?? null,
          },
          select: {
            id: true,
            itinerary_item_id: true,
            lodging_type: true,
            rooms: true,
            beds: true,
            price_per_room: true,
          },
        });
        lodging = {
          id: lodging.id,
          itineraryItemId: lodging.itinerary_item_id,
          lodgingType: lodging.lodging_type,
          rooms: lodging.rooms,
          beds: lodging.beds,
          pricePerRoom: lodging.price_per_room,
        };
        break;
      }
      case "activity": {
        const activityDetails = details.activity || {};
        activity = await prisma.activity_itinerary.create({
          data: {
            itinerary_item_id: item.id,
            activity_type: activityDetails.activityType ?? null,
            difficulty_level: activityDetails.difficultyLevel ?? null,
            meeting_location: activityDetails.meetingLocation ?? null,
            meeting_instructions: activityDetails.meetingInstructions ?? null,
            certification_required: activityDetails.certificationRequired ?? null,
            certification_details: activityDetails.certificationDetails ?? null,
            min_age: activityDetails.minAge ?? null,
            max_participants: activityDetails.maxParticipants ?? null,
            equipment_needed: activityDetails.equipmentNeeded ?? null,
            dress_code: activityDetails.dressCode ?? null,
            booking_required: activityDetails.bookingRequired ?? null,
            additional_costs: activityDetails.additionalCosts ?? null,
            additional_costs_description:
              activityDetails.additionalCostsDescription ?? null,
          },
          select: {
            id: true,
            itinerary_item_id: true,
            activity_type: true,
            difficulty_level: true,
            meeting_location: true,
            meeting_instructions: true,
            certification_required: true,
            certification_details: true,
            min_age: true,
            max_participants: true,
            equipment_needed: true,
            dress_code: true,
            booking_required: true,
            additional_costs: true,
            additional_costs_description: true,
          },
        });
        activity = {
          id: activity.id,
          itineraryItemId: activity.itinerary_item_id,
          activityType: activity.activity_type,
          difficultyLevel: activity.difficulty_level,
          meetingLocation: activity.meeting_location,
          meetingInstructions: activity.meeting_instructions,
          certificationRequired: activity.certification_required,
          certificationDetails: activity.certification_details,
          minAge: activity.min_age,
          maxParticipants: activity.max_participants,
          equipmentNeeded: activity.equipment_needed,
          dressCode: activity.dress_code,
          bookingRequired: activity.booking_required,
          additionalCosts: activity.additional_costs,
          additionalCostsDescription: activity.additional_costs_description,
        };
        break;
      }
      default:
        // base item only; no child record
        break;
    }

    const { updStartDate, updStartTime } = splitDateTime(item.start_time);
    const { updEndDate, updEndTime } = splitDateTime(item.end_time);

      

    const response = {
      id: item.id,
      itemType: item.item_type,
      title: item.title,
      description: item.description,
      startDate: updStartDate ? updStartDate : null,
      startTime: updStartTime ? updStartTime : null,
      endDate: updEndDate ? updEndDate : null,
      endTime: updEndTime ? updEndTime : null,
      venue: item.venue,
      address: item.address,
      phone: item.phone,
      website: item.website,
      email: item.email,
      provider: item.provider,
      confirmationNumber: item.confirmation_number,
      totalCost: item.total_cost,
      numberOfGuests: item.number_of_guests,
      locationName: item.location_name,
      activityType: item.activity_type,
      googlePlaceId: item.google_place_id,
      notes: item.notes,
      details: {
        flight,
        carRental,
        lodging,
        activity,
      },
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
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      venue,
      address,
      phone,
      website,
      email,
      provider,
      confirmationNumber,
      totalCost,
      numberOfGuests,
      locationName,
      activityType,
      googlePlaceId,
      notes,
      details = {},
    } = req.body;

    // Convert separate UI fields into MySQL DATETIME
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime   = combineDateAndTime(endDate, endTime);

    const updated = await prisma.itinerary_items.update({
      where: { id: itemId },
      data: {
        title: title ?? existing.title,
        description: description ?? existing.description,
        start_time: startDateTime ? new Date(startDateTime) : existing.start_time,
        end_time: endDateTime ? new Date(endDateTime) : existing.end_time,
        venue: venue ?? existing.venue,
        address: address ?? existing.address,
        phone: phone ?? existing.phone,
        website: website ?? existing.website,
        email: email ?? existing.email,
        provider: provider ?? existing.provider,
        confirmation_number: confirmationNumber ?? existing.confirmation_number,
        total_cost: totalCost ?? existing.total_cost,
        number_of_guests: numberOfGuests ?? existing.number_of_guests,
        location_name: locationName ?? existing.location_name,
        activity_type: activityType ?? existing.activity_type,
        google_place_id: googlePlaceId ?? existing.google_place_id,
        notes: notes ?? existing.notes,
        updated_by: userId,
        updated_at: new Date(),
      },
      select: {
        id: true,
        item_type: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        venue: true,
        address: true,
        phone: true,
        website: true,
        email: true,
        provider: true,
        confirmation_number: true,
        total_cost: true,
        number_of_guests: true,
        location_name: true,
        activity_type: true,
        google_place_id: true,
        notes: true,
      },
    });

    const itemType = existing.item_type; // trust existing type

    let flight = null;
    let carRental = null;
    let lodging = null;
    let activity = null;

    // Update or create matching child record, if details provided
    switch (itemType) {
      case "flight": {
        const flightDetails = details.flight || {};
        if (Object.keys(flightDetails).length > 0) {
          const existingFlight = await prisma.flight_itinerary.findFirst({
            where: { itinerary_item_id: itemId },
          });

          if (existingFlight) {
            const f = await prisma.flight_itinerary.update({
              where: { id: existingFlight.id },
              data: {
                flight_number:
                  flightDetails.flightNumber ?? existingFlight.flight_number,
                airline: flightDetails.airline ?? existingFlight.airline,
                departure_airport:
                  flightDetails.departureAirport ??
                  existingFlight.departure_airport,
                arrival_airport:
                  flightDetails.arrivalAirport ??
                  existingFlight.arrival_airport,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                flight_number: true,
                airline: true,
                departure_airport: true,
                arrival_airport: true,
              },
            });
            flight = {
              id: f.id,
              itineraryItemId: f.itinerary_item_id,
              flightNumber: f.flight_number,
              airline: f.airline,
              departureAirport: f.departure_airport,
              arrivalAirport: f.arrival_airport,
            };
          } else {
            const f = await prisma.flight_itinerary.create({
              data: {
                itinerary_item_id: itemId,
                flight_number: flightDetails.flightNumber ?? null,
                airline: flightDetails.airline ?? null,
                departure_airport: flightDetails.departureAirport ?? null,
                arrival_airport: flightDetails.arrivalAirport ?? null,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                flight_number: true,
                airline: true,
                departure_airport: true,
                arrival_airport: true,
              },
            });
            flight = {
              id: f.id,
              itineraryItemId: f.itinerary_item_id,
              flightNumber: f.flight_number,
              airline: f.airline,
              departureAirport: f.departure_airport,
              arrivalAirport: f.arrival_airport,
            };
          }
        }
        break;
      }
      case "car_rental": {
        const carDetails = details.carRental || {};
        if (Object.keys(carDetails).length > 0) {
          const existingCar = await prisma.car_rental_itinerary.findFirst({
            where: { itinerary_item_id: itemId },
          });

          if (existingCar) {
            const c = await prisma.car_rental_itinerary.update({
              where: { id: existingCar.id },
              data: {
                pickup_location:
                  carDetails.pickupLocation ?? existingCar.pickup_location,
                pickup_address:
                  carDetails.pickupAddress ?? existingCar.pickup_address,
                pickup_phone:
                  carDetails.pickupPhone ?? existingCar.pickup_phone,
                dropoff_location:
                  carDetails.dropoffLocation ?? existingCar.dropoff_location,
                dropoff_address:
                  carDetails.dropoffAddress ?? existingCar.dropoff_address,
                dropoff_phone:
                  carDetails.dropoffPhone ?? existingCar.dropoff_phone,
                car_type: carDetails.carType ?? existingCar.car_type,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                pickup_location: true,
                pickup_address: true,
                pickup_phone: true,
                dropoff_location: true,
                dropoff_address: true,
                dropoff_phone: true,
                car_type: true,
              },
            });
            carRental = {
              id: c.id,
              itineraryItemId: c.itinerary_item_id,
              pickupLocation: c.pickup_location,
              pickupAddress: c.pickup_address,
              pickupPhone: c.pickup_phone,
              dropoffLocation: c.dropoff_location,
              dropoffAddress: c.dropoff_address,
              dropoffPhone: c.dropoff_phone,
              carType: c.car_type,
            };
          } else {
            const c = await prisma.car_rental_itinerary.create({
              data: {
                itinerary_item_id: itemId,
                pickup_location: carDetails.pickupLocation ?? null,
                pickup_address: carDetails.pickupAddress ?? null,
                pickup_phone: carDetails.pickupPhone ?? null,
                dropoff_location: carDetails.dropoffLocation ?? null,
                dropoff_address: carDetails.dropoffAddress ?? null,
                dropoff_phone: carDetails.dropoffPhone ?? null,
                car_type: carDetails.carType ?? null,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                pickup_location: true,
                pickup_address: true,
                pickup_phone: true,
                dropoff_location: true,
                dropoff_address: true,
                dropoff_phone: true,
                car_type: true,
              },
            });
            carRental = {
              id: c.id,
              itineraryItemId: c.itinerary_item_id,
              pickupLocation: c.pickup_location,
              pickupAddress: c.pickup_address,
              pickupPhone: c.pickup_phone,
              dropoffLocation: c.dropoff_location,
              dropoffAddress: c.dropoff_address,
              dropoffPhone: c.dropoff_phone,
              carType: c.car_type,
            };
          }
        }
        break;
      }
      case "lodging": {
        const lodgingDetails = details.lodging || {};
        if (Object.keys(lodgingDetails).length > 0) {
          const existingLodging = await prisma.lodging_itinerary.findFirst({
            where: { itinerary_item_id: itemId },
          });

          if (existingLodging) {
            const l = await prisma.lodging_itinerary.update({
              where: { id: existingLodging.id },
              data: {
                lodging_type:
                  lodgingDetails.lodgingType ?? existingLodging.lodging_type,
                rooms: lodgingDetails.rooms ?? existingLodging.rooms,
                beds: lodgingDetails.beds ?? existingLodging.beds,
                price_per_room:
                  lodgingDetails.pricePerRoom ??
                  existingLodging.price_per_room,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                lodging_type: true,
                rooms: true,
                beds: true,
                price_per_room: true,
              },
            });
            lodging = {
              id: l.id,
              itineraryItemId: l.itinerary_item_id,
              lodgingType: l.lodging_type,
              rooms: l.rooms,
              beds: l.beds,
              pricePerRoom: l.price_per_room,
            };
          } else {
            const l = await prisma.lodging_itinerary.create({
              data: {
                itinerary_item_id: itemId,
                lodging_type: lodgingDetails.lodgingType ?? null,
                rooms: lodgingDetails.rooms ?? null,
                beds: lodgingDetails.beds ?? null,
                price_per_room: lodgingDetails.pricePerRoom ?? null,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                lodging_type: true,
                rooms: true,
                beds: true,
                price_per_room: true,
              },
            });
            lodging = {
              id: l.id,
              itineraryItemId: l.itinerary_item_id,
              lodgingType: l.lodging_type,
              rooms: l.rooms,
              beds: l.beds,
              pricePerRoom: l.price_per_room,
            };
          }
        }
        break;
      }
      case "activity": {
        const activityDetails = details.activity || {};
        if (Object.keys(activityDetails).length > 0) {
          const existingActivity = await prisma.activity_itinerary.findFirst({
            where: { itinerary_item_id: itemId },
          });

          if (existingActivity) {
            const a = await prisma.activity_itinerary.update({
              where: { id: existingActivity.id },
              data: {
                activity_type:
                  activityDetails.activityType ??
                  existingActivity.activity_type,
                difficulty_level:
                  activityDetails.difficultyLevel ??
                  existingActivity.difficulty_level,
                meeting_location:
                  activityDetails.meetingLocation ??
                  existingActivity.meeting_location,
                meeting_instructions:
                  activityDetails.meetingInstructions ??
                  existingActivity.meeting_instructions,
                certification_required:
                  activityDetails.certificationRequired ??
                  existingActivity.certification_required,
                certification_details:
                  activityDetails.certificationDetails ??
                  existingActivity.certification_details,
                min_age: activityDetails.minAge ?? existingActivity.min_age,
                max_participants:
                  activityDetails.maxParticipants ??
                  existingActivity.max_participants,
                equipment_needed:
                  activityDetails.equipmentNeeded ??
                  existingActivity.equipment_needed,
                dress_code:
                  activityDetails.dressCode ?? existingActivity.dress_code,
                booking_required:
                  activityDetails.bookingRequired ??
                  existingActivity.booking_required,
                additional_costs:
                  activityDetails.additionalCosts ??
                  existingActivity.additional_costs,
                additional_costs_description:
                  activityDetails.additionalCostsDescription ??
                  existingActivity.additional_costs_description,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                activity_type: true,
                difficulty_level: true,
                meeting_location: true,
                meeting_instructions: true,
                certification_required: true,
                certification_details: true,
                min_age: true,
                max_participants: true,
                equipment_needed: true,
                dress_code: true,
                booking_required: true,
                additional_costs: true,
                additional_costs_description: true,
              },
            });
            activity = {
              id: a.id,
              itineraryItemId: a.itinerary_item_id,
              activityType: a.activity_type,
              difficultyLevel: a.difficulty_level,
              meetingLocation: a.meeting_location,
              meetingInstructions: a.meeting_instructions,
              certificationRequired: a.certification_required,
              certificationDetails: a.certification_details,
              minAge: a.min_age,
              maxParticipants: a.max_participants,
              equipmentNeeded: a.equipment_needed,
              dressCode: a.dress_code,
              bookingRequired: a.booking_required,
              additionalCosts: a.additional_costs,
              additionalCostsDescription: a.additional_costs_description,
            };
          } else {
            const a = await prisma.activity_itinerary.create({
              data: {
                itinerary_item_id: itemId,
                activity_type: activityDetails.activityType ?? null,
                difficulty_level: activityDetails.difficultyLevel ?? null,
                meeting_location: activityDetails.meetingLocation ?? null,
                meeting_instructions:
                  activityDetails.meetingInstructions ?? null,
                certification_required:
                  activityDetails.certificationRequired ?? null,
                certification_details:
                  activityDetails.certificationDetails ?? null,
                min_age: activityDetails.minAge ?? null,
                max_participants: activityDetails.maxParticipants ?? null,
                equipment_needed: activityDetails.equipmentNeeded ?? null,
                dress_code: activityDetails.dressCode ?? null,
                booking_required: activityDetails.bookingRequired ?? null,
                additional_costs: activityDetails.additionalCosts ?? null,
                additional_costs_description:
                  activityDetails.additionalCostsDescription ?? null,
              },
              select: {
                id: true,
                itinerary_item_id: true,
                activity_type: true,
                difficulty_level: true,
                meeting_location: true,
                meeting_instructions: true,
                certification_required: true,
                certification_details: true,
                min_age: true,
                max_participants: true,
                equipment_needed: true,
                dress_code: true,
                booking_required: true,
                additional_costs: true,
                additional_costs_description: true,
              },
            });
            activity = {
              id: a.id,
              itineraryItemId: a.itinerary_item_id,
              activityType: a.activity_type,
              difficultyLevel: a.difficulty_level,
              meetingLocation: a.meeting_location,
              meetingInstructions: a.meeting_instructions,
              certificationRequired: a.certification_required,
              certificationDetails: a.certification_details,
              minAge: a.min_age,
              maxParticipants: a.max_participants,
              equipmentNeeded: a.equipment_needed,
              dressCode: a.dress_code,
              bookingRequired: a.booking_required,
              additionalCosts: a.additional_costs,
              additionalCostsDescription: a.additional_costs_description,
            };
          }
        }
        break;
      }
      default:
        break;
    }

    const { updStartDate, updStartTime } = splitDateTime(updated.start_time);
    const { updEndDate, updEndTime } = splitDateTime(updated.end_time);

    const response = {
      id: updated.id,
      itemType: updated.item_type,
      title: updated.title,
      description: updated.description,
      startDate: updStartDate ? updStartDate : null,
      startTime: updStartTime ? updStartTime : null,
      endDate: updEndDate ? updEndDate : null,
      endTime: updEndTime ? updEndTime : null,
      venue: updated.venue,
      address: updated.address,
      phone: updated.phone,
      website: updated.website,
      email: updated.email,
      provider: updated.provider,
      confirmationNumber: updated.confirmation_number,
      totalCost: updated.total_cost,
      numberOfGuests: updated.number_of_guests,
      locationName: updated.location_name,
      activityType: updated.activity_type,
      googlePlaceId: updated.google_place_id,
      notes: updated.notes,
      details: {
        flight,
        carRental,
        lodging,
        activity,
      },
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

    // Clean up child rows (safe even if none exist)
    await Promise.all([
      prisma.flight_itinerary.deleteMany({
        where: { itinerary_item_id: itemId },
      }),
      prisma.car_rental_itinerary.deleteMany({
        where: { itinerary_item_id: itemId },
      }),
      prisma.lodging_itinerary.deleteMany({
        where: { itinerary_item_id: itemId },
      }),
      prisma.activity_itinerary.deleteMany({
        where: { itinerary_item_id: itemId },
      }),
    ]);

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
      firstName: m.users?.first_name || null,
      lastName: m.users?.last_name || null,
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

    // Ensure trip_id is correct
    if (Number.isNaN(tripId)) {
      return res.status(400).json({ error: "Invalid trip id" });
    }

    const { trip, role } = await getUserTripRole(userId, tripId);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Check for proper permissions
    if (!["owner", "co_owner"].includes(role)) {
      return res
        .status(403)
        .json({ error: "Not authorized to manage members" });
    }

    // Make sure both email is entered and role is selected
    let { email, role: memberRole } = req.body;
    
    if (!email || !memberRole) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    // Only allow these roles to be assigned via the API.
    // "owner" is reserved for the trip creator and is added automatically.
    // If frontend sends incorrect role, make role DEFAULT
    const ALLOWED_MEMBER_ROLES = ["co_owner", "editor", "viewer"];
    const DEFAULT_MEMBER_ROLE = "viewer";

    if (!ALLOWED_MEMBER_ROLES.includes(memberRole)) {
      memberRole = DEFAULT_MEMBER_ROLE;
    }

    // NOTE: users table does not store roles.
    // This stub user is created so the email can be referenced as a trip member.

    // Find user by email
    let user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      // No user yet – create a stub user so they can be referenced as a member.
      // password can be null, and first/last name can be added later.
      user = await prisma.users.create({
        data: {
          email,
          first_name: null,
          last_name: null,
          password_hash: null,
        },
      });
    }

    // NOTE: trip_member table provides users with role permissions per trip
    
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
    // trip_members table fields
    id: member.id,
    tripId: member.trip_id,
    role: member.role,
    joinedAt: member.joined_at,

    // nested user info from users table
    user: {
      id: member.user_id,
      firstName: member.users?.first_name || null,
      lastName: member.users?.last_name || null,
      email: member.users?.email || null
    },
  };

    res.status(existing ? 200 : 201).json(response);
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
