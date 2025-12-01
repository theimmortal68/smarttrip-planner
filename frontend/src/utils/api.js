// API utility functions for communicating with the backend

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get the JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============================================================================
// TRIP ROUTES
// ============================================================================

/**
 * GET /api/trips
 * Get all trips for the logged-in user
 */
export const getAllTrips = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch trips');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
};

/**
 * GET /api/trips/:id
 * Get trip details by ID
 */
export const getTripById = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch trip details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
};

/**
 * POST /api/trips
 * Create a new trip
 */
export const createTrip = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create trip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

/**
 * PUT /api/trips/:id
 * Update a trip (owner, co_owner only)
 */
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update trip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

/**
 * DELETE /api/trips/:id
 * Delete a trip (owner only)
 */
export const deleteTrip = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete trip');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// ============================================================================
// ITINERARY ROUTES
// ============================================================================

/**
 * GET /api/trips/:tripId/itinerary
 * List itinerary items for a trip
 * Allowed roles: any member (owner, co_owner, editor, viewer)
 */
export const getItineraryItems = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch itinerary items');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching itinerary items:', error);
    throw error;
  }
};

/**
 * POST /api/trips/:tripId/itinerary
 * Create an itinerary item for a trip
 * Allowed roles: owner, co_owner, editor
 */
export const createItineraryItem = async (tripId, itemData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create itinerary item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating itinerary item:', error);
    throw error;
  }
};

/**
 * PUT /api/trips/:tripId/itinerary/:itemId
 * Update an itinerary item
 * Allowed roles: owner, co_owner, editor
 */
export const updateItineraryItem = async (tripId, itemId, itemData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update itinerary item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating itinerary item:', error);
    throw error;
  }
};

/**
 * DELETE /api/trips/:tripId/itinerary/:itemId
 * Delete an itinerary item
 * Allowed roles: owner, co_owner, editor
 */
export const deleteItineraryItem = async (tripId, itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/itinerary/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete itinerary item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting itinerary item:', error);
    throw error;
  }
};

// ============================================================================
// TRIP MEMBER ROUTES
// ============================================================================

/**
 * GET /api/trips/:tripId/members
 * List members for a trip
 * Allowed roles: owner, co_owner
 */
export const getTripMembers = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch trip members');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching trip members:', error);
    throw error;
  }
};

/**
 * POST /api/trips/:tripId/members
 * Add (or update) a trip member by email + role
 * Allowed roles: owner, co_owner
 */
export const addTripMember = async (tripId, memberData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to add trip member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding trip member:', error);
    throw error;
  }
};

/**
 * DELETE /api/trips/:tripId/members/:memberId
 * Remove a member from a trip
 * Allowed roles: owner, co-owner
 */
export const removeTripMember = async (tripId, memberId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to remove trip member');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing trip member:', error);
    throw error;
  }
};

// ============================================================================
// USER ROUTES
// ============================================================================

/**
 * GET /api/users
 * Get all registered users (for member selection)
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

/**
 * GET /api/auth/me
 * Get current authenticated user's info
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch user info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};
