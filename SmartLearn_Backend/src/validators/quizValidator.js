// src/validators/quizValidator.js
import { body } from "express-validator";

export const createQuizValidator = [
  body("title").isString().isLength({ min: 3 }).withMessage("Title min 3 chars"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be positive integer (minutes)"),
  body("questions").isArray({ min: 1 }).withMessage("At least one question is required"),
  body("questions.*.question").isString().notEmpty(),
  body("questions.*.options").isArray({ min: 2 }).withMessage("Each question must have options"),
  body("questions.*.answer").isString().notEmpty(),
];

export const submitQuizValidator = [
  body("answers").isArray().withMessage("answers must be an array"),
  body("answers.*.questionId").isString().withMessage("questionId required"),
  body("answers.*.selected").isString().withMessage("selected answer required"),
];
