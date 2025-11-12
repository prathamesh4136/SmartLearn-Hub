// src/controllers/quizController.js
import Quiz from "../models/Quiz.js";
import QuizSubmission from "../models/QuizSubmission.js";

/**
 * Teacher creates a quiz
 */
export async function createQuiz(req, res, next) {
  try {
    // role check (either via req.user.role or via DB lookup)
    if (req.user?.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can create quizzes" });
    }

    const payload = {
      title: req.body.title,
      description: req.body.description || "",
      duration: req.body.duration,
      restrictTabSwitch: !!req.body.restrictTabSwitch,
      visibility: req.body.visibility || "public",
      questions: req.body.questions,
      createdBy: req.user._id,
    };

    const quiz = await Quiz.create(payload);
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
}

/**
 * List quizzes
 * Teachers should be able to see their private quizzes; students see public + assigned
 * For simplicity: return all public + (if teacher, their private too)
 */
export async function listQuizzes(req, res, next) {
  try {
    const baseQuery = { $or: [{ visibility: "public" }] };

    if (req.user?.role === "teacher") {
      // include quizzes created by teacher (both public/private)
      baseQuery.$or.push({ createdBy: req.user._id });
    }

    const quizzes = await Quiz.find(baseQuery).select("title description duration visibility createdBy createdAt");
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
}

/**
 * Get a quiz by id (include questions)
 */
export async function getQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // if private, only owner or teacher can access
    if (quiz.visibility === "private") {
      if (!req.user) return res.status(401).json({ message: "Not authorized" });
      if (req.user.role === "teacher" && String(quiz.createdBy) === String(req.user._id)) {
        return res.json(quiz);
      }
      return res.status(403).json({ message: "Forbidden: private quiz" });
    }

    res.json(quiz);
  } catch (err) {
    next(err);
  }
}

/**
 * Submit quiz answers
 * Calculates score and stores submission
 */
export async function submitQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const answers = req.body.answers || [];
    let score = 0;
    const answersWithCorrect = answers.map(a => {
      const q = quiz.questions.id(a.questionId);
      const isCorrect = q ? String(q.answer).trim() === String(a.selected).trim() : false;
      if (isCorrect) score++;
      return { questionId: a.questionId, selected: a.selected, isCorrect };
    });

    const submission = await QuizSubmission.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: answersWithCorrect,
      score,
    });

    res.status(201).json({ submission, score, total: quiz.questions.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get results for a quiz (teacher only)
 */

// quizController.js

//every body access to get result
export const getResults = async (req, res) => {
  try {
    const results = await QuizSubmission.find({ quiz: req.params.id })
      .populate("student", "name email");
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//teachers only see results
/*export const getResults = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can view quiz results" });
    }

    const results = await QuizSubmission.find({ quiz: req.params.id })
      .populate("student", "name email");

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/

//student can see only their result and techers can see every body results
/*
export const getResults = async (req, res) => {
  try {
    let query = { quiz: req.params.id };

    // Students can only see their own results
    if (req.user.role !== "teacher") {
      query.student = req.user._id;
      return res.status(403).json({ message: "Only teachers can view quiz results" });
      }

    const results = await QuizSubmission.find(query)
      .populate("student", "name email");

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

*/
//  Get student progress
export const getProgress = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Fetch all submissions of this student
    const submissions = await QuizSubmission.find({ student: req.user._id })
      .populate("quiz", "title duration")
      .sort({ createdAt: -1 })
      .lean();

    const totalQuizzes = submissions.length;
    const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgScore = totalQuizzes ? Number((totalScore / totalQuizzes).toFixed(2)) : 0;

    // Response
    return res.json({
      totalQuizzes,
      totalScore,
      avgScore,
      submissions: submissions.map((s) => ({
        id: s._id,
        quizTitle: s.quiz?.title || "Deleted quiz",
        score: s.score,
        attemptedAt: s.createdAt,
        duration: s.quiz?.duration || 0,
      })),
    });
  } catch (err) {
    console.error("getProgress error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};