// src/routes/quizRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createQuiz, listQuizzes, getQuiz, submitQuiz, getResults } from "../controllers/quizController.js";
import { createQuizValidator, submitQuizValidator } from "../validators/quizValidator.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getProgress } from "../controllers/quizController.js";



const router = express.Router();

// list - authenticated (public quizzes returned for students; teacher sees own)
router.get("/", protect, listQuizzes);

// create - teacher
router.post("/", protect, createQuizValidator, validateRequest, createQuiz);

// get quiz
router.get("/:id", protect, getQuiz);

// submit
router.post("/:id/submit", protect, submitQuizValidator, validateRequest, submitQuiz);

// results - teacher only (controller enforces ownership)
router.get("/:id/results", protect, getResults);

// progress - student only
router.get("/progress/me", protect, getProgress);

export default router;
