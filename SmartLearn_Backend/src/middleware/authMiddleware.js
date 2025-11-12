// src/middleware/authMiddleware.js
import { firebaseAdmin } from "../config/firebase.js";
import User from "../models/User.js"; // optional - if you store users in DB
import { logError } from "../utils/logger.js";


/**
 * protect middleware expects header `Authorization: Bearer <idToken>`
 * Decodes Firebase ID token and attaches user info to req.user
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "Not authorized: no token" });

    const decoded = await firebaseAdmin.auth().verifyIdToken(token).catch(err => {
      throw new Error("Invalid or expired token");
    });

    // minimal user info
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
      // role will be fetched from DB if you store roles there
    };

    // Optionally, load full user from DB to get role (recommended)
    // If your User model uses 'uid' or 'email' to find record:
    if (User) {
      const u = await User.findOne({ uid: decoded.uid }).select("role");
      if (u) req.user._id = u._id;
      if (u && u.role) req.user.role = u.role;
    }

    next();
  } catch (err) {
    logError(err, { route: req.path });
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
