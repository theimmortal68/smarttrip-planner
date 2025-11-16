// ============================================================================
//  src/middleware/authorize.js
//  Role-based authorization helper.
//  Usage:
//    router.get("/admin", auth, requireRole("admin"), handler)
// ============================================================================

/**
 * Middleware that restricts access to users with allowed roles.
 *
 * @param  {...string} allowed - List of allowed role values.
 * @returns {Function} Express middleware.
 */
module.exports = function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !allowed.includes(role)) {
      return res
        .status(403)
        .json({ error: { code: 403, message: 'Forbidden' } });
    }

    next();
  };
};