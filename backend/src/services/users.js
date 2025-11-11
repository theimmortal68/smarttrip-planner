// src/services/users.js
const prisma = require('../db');

async function findOrCreateUserByGoogle(payload) {
  if (!payload?.email) throw new Error('Google payload missing email');
  return prisma.user.upsert({
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