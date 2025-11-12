// src/routes/authRoutes.js
import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { firebaseAdmin } from "../config/firebase.js";

const router = express.Router();

/**
 * Register User
 * - Assumes user is already created in Firebase Auth (frontend handles Firebase signup)
 * - Stores extra metadata in MongoDB
 */
router.post("/register", async (req, res) => {
  try {
    const {
      uid, // Firebase UID
      fullName,
      email,
      role,
      school,
      city,
      parentContact,
      standard,
      subject,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      uid,
      fullName,
      email,
      role,
      school,
      city,
      parentContact,
      standard,
      subject,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Login
 * - The frontend (Next.js) should handle Firebase Auth sign-in
 * - Then it sends the Firebase ID token here for verification
 */
router.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "ID Token is required" });

    // Verify with Firebase
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    // Check if user exists in DB
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      // Auto-register minimal user
      user = new User({
        uid: decoded.uid,
        fullName: decoded.name || decoded.email,
        email: decoded.email,
      });
      await user.save();
    }

    res.json({
      message: "Login successful",
      user,
      token: idToken, // send back token for frontend
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
//me
router.get("/me", protect, async (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    role: req.user.role || "student", // default to student if role not set
  })
  
});
/**
 * Update Profile
 */
router.put("/update", async (req, res) => {
  try {
    const { email, ...updates } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
