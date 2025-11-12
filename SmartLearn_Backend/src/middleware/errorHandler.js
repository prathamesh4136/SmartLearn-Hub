// src/middleware/errorHandler.js
import { logError } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  logError(err, { route: req.path });
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
}
