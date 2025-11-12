// src/models/QuizSubmission.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selected: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("QuizSubmission", submissionSchema);
