import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { rateLimit } from "../../middleware/security.middleware";
import {
  handleGetQuizzesBySubject,
  handleGetQuizById,
  handleCreateQuiz,
  handleGenerateQuizQuestions,
  handleAddQuizQuestion,
  handleUpdateQuizQuestion,
  handleDeleteQuizQuestion,
  handleDeleteQuiz,
} from "./subjectQuiz.controller";

const router = Router();
const aiGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyPrefix: "quiz-ai",
});

// GET /quizzes/subject/:subjectId  — professor & student
router.get(
  "/subject/:subjectId",
  requireAuth,
  handleGetQuizzesBySubject
);

// GET /quizzes/:quizId  — professor & student
router.get(
  "/:quizId",
  requireAuth,
  handleGetQuizById
);

// POST /quizzes  — professor only
router.post(
  "/",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleCreateQuiz
);

// POST /quizzes/:quizId/generate  — professor only
router.post(
  "/:quizId/generate",
  requireAuth,
  requireRole(["PROFESSOR"]),
  aiGenerationRateLimit,
  handleGenerateQuizQuestions
);

// POST /quizzes/:quizId/questions  — professor only
router.post(
  "/:quizId/questions",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleAddQuizQuestion
);

// PUT /quizzes/:quizId/questions/:questionId  — professor only
router.put(
  "/:quizId/questions/:questionId",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleUpdateQuizQuestion
);

// DELETE /quizzes/:quizId/questions/:questionId  — professor only
router.delete(
  "/:quizId/questions/:questionId",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleDeleteQuizQuestion
);

// DELETE /quizzes/:quizId  — professor only
router.delete(
  "/:quizId",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleDeleteQuiz
);

export default router;
