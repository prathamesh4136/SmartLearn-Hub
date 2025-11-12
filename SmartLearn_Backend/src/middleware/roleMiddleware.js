// src/middleware/roleMiddleware.js
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (req.user.role !== role) return res.status(403).json({ message: "Forbidden: insufficient role" });
    next();
  };
}
