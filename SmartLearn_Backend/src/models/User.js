//src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, unique: true, index: true }, // Firebase UID
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    school: { type: String },
    city: { type: String },
    parentContact: { type: String },
    standard: { type: String },
    subject: { type: String },
    // any other metadata
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
