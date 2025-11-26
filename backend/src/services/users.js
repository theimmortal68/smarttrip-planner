// backend/services/users.js
const prisma = require('../../db/prisma');

/**
 * Finds an existing user by Google email or creates one if not found.
 * @param {Object} googlePayload - The payload returned by Google's ID token
 * @returns {Promise<Object>} The user record in the database
 */
async function findOrCreateUserByGoogle(googlePayload) {
  const {
    email,
    given_name,     // first name
    family_name,    // last name
    name,           // full name
    sub: googleId,  // Google's unique user ID
  } = googlePayload;

  if (!email) {
    throw new Error('Google account has no email associated.');
  }

  // First, check if the user already exists
  let user = await prisma.users.findUnique({
    where: { email },
  });

  if (user) {
    // Optionally: update first/last name if Google has newer info
    return user;
  }

  // If not found, create a new user using Google data
  user = await prisma.users.create({
    data: {
      email,
      first_name: given_name || name?.split(' ')[0] || null,
      last_name: family_name || name?.split(' ').slice(1).join(' ') || null,
      password_hash: null, // password is not used for Google accounts
    }
  });

  return user;
}

module.exports = {
  findOrCreateUserByGoogle,
};