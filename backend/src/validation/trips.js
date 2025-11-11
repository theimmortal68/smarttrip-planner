const { z } = require('zod');

exports.TripCreate = z.object({
  name: z.string().min(1),
  startDate: z.string().min(1), // ISO date
  endDate: z.string().min(1),
  notes: z.string().optional()
});

exports.InviteMember = z.object({
  email: z.string().email(),
  role: z.enum(['owner','co_owner','editor','viewer'])
});

exports.AddItineraryItem = z.object({
  dayIndex: z.number().int().nonnegative(),
  title: z.string().min(1),
  time: z.string().optional(),     // or startTime/endTime later
  placeId: z.string().optional()
});