const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  const h = req.headers.authorization || "";
  const [, token] = h.split(" ");
  if (!token) return res.status(401).json({ error: { code: 401, message: "Missing Authorization: Bearer" } });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { sub, email, role }
    next();
  } catch {
    res.status(403).json({ error: { code: 403, message: "Invalid token" } });
  }
};