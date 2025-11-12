// src/config/db.js
import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error("MONGO_URI is required");
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
