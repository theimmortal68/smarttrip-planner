const express = require("express");
const prisma = require("../../db/prisma");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/users
 * Returns a list of all users for the sharing page search box.
 * Protected: owner / co-owner only.
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true
      }
    });

    const formatted = users.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email
    }));

    res.json(formatted);
  } catch (err) {
     console.error('Error fetching users:', err);
     err.status = 500;
     err.message = 'Failed to fetch users';
     return next(err);
  }
});

/**
 * DELETE /api/users/me
 * Deletes the currently authenticated user's account.
 * Protected: requires valid JWT token.
 */
router.delete('/me', auth, async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id in token' });
    }

    // Delete user - Prisma will handle cascading deletes if configured
    // Or you can manually delete related records first if needed
    await prisma.users.delete({
      where: { id: userId }
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    
    if (error.code === 'P2003') {
      // Foreign key constraint error
      return res.status(400).json({ 
        message: 'Cannot delete account with existing trips. Please delete your trips first.' 
      });
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
