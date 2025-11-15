import { z } from 'zod';

export const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  startDate: z.string().min(1, 'startDate is required'),
  endDate: z.string().min(1, 'endDate is required'),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['owner', 'co-owner', 'editor', 'viewer']),
});

export const itineraryItemSchema = z.object({
  dayIndex: z.number().int().nonnegative(),
  title: z.string().min(1, 'title is required'),
  time: z.string().optional(),
  placeId: z.string().optional(),
});
