// src/models/Quiz.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // array of option strings
  answer: { type: String, required: true },    // exact text of correct option
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  duration: { type: Number, required: true }, // minutes
  restrictTabSwitch: { type: Boolean, default: false },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
