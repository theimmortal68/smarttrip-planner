// ============================================================================
//  src/services/users.js
//  User-related service helpers. Currently supports Google OAuth users by
//  finding or creating a record based on Google ID token payload.
// ============================================================================

const prisma = require('../../db');

/**
 * Find an existing user by Google email, or create one if not found.
 * Uses Prisma upsert on the users table.
 *
 * @param {object} payload - Google ID token payload (sub, email, name, picture).
 * @returns {Promise<object>} - The Prisma user record.
 */
async function findOrCreateUserByGoogle(payload) {
  if (!payload?.email) {
    throw new Error('Google payload missing email');
  }

  return prisma.users.upsert({
    where: { email: payload.email },
    update: {
      name: payload.name || undefined,
      avatarUrl: payload.picture || undefined,
    },
    create: {
      email: payload.email,
      name: payload.name || null,
      avatarUrl: payload.picture || null,
      role: 'owner',
    },
  });
}

module.exports = { findOrCreateUserByGoogle };