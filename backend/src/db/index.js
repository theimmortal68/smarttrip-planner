// src/db.js
const { PrismaClient } = require('@prisma/client');

// prevent multiple Prisma instances in dev (nodemon hot-reloads)
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

module.exports = prisma;