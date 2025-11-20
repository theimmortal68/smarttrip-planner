const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../db'); 

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

async function registerUser({ email, password, firstName, lastName }) {
  
  // Check if exists
  const existing = await prisma.users.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error('Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.users.create({
    data: {
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    },
  });

  // Create JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
}

async function loginUser({ email, password }) {
  // 1) Find user by email
  const user = await prisma.users.findUnique({
    where: { email },
  });

  // Either no user, or a user with no password_hash set
  if (!user || user.password_hash == null) {
    throw new Error('Invalid email or password');
  }

  // 2) Compare password with stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3) Generate JWT (match registerUser format)
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' } // or '3d' if you prefer, just be consistent
  );

  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
};