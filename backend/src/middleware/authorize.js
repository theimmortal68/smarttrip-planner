// src/middleware/authorize.js
module.exports = function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ error: { code: 403, message: 'Forbidden' } });
    }
    next();
  };
};