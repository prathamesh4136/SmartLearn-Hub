//server/src/controllers/authController.js
import admin from "../config/firebase.js";
import User from "../models/User.js";

// POST /api/auth/signup
// Body: { uid, email, role }
export const signupUser = async (req, res) => {
  try {
    const { uid, email, role } = req.body;

    if (!uid || !email || !role) {
      return res.status(400).json({ message: "uid, email, role are required" });
    }

    // Ensure UID exists in Firebase
    let fbUser;
    try {
      fbUser = await admin.auth().getUser(uid);
    } catch {
      return res.status(400).json({ message: "Firebase user not found for given uid" });
    }

    // Create or return existing Mongo user
    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, role });
    }

    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error("signupUser error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};

// POST /api/auth/login
// Body: { token }   // Firebase ID token from the frontend
export const loginUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "token is required" });

    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found in database. Please signup." });
    }

    return res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// GET /api/auth/me  (protected)
// Header: Authorization: Bearer <Firebase_ID_Token>
export const getMe = async (req, res) => {
  try {
    const uid = req.user?.uid;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
