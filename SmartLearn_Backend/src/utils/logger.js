// src/utils/logger.js
export function logError(err, ctx = {}) {
  // In production swap this to Winston / Bunyan and log to file / centralized logging
  console.error("[ERROR]", (ctx && ctx.route) || "", err && err.stack ? err.stack : err);
}
