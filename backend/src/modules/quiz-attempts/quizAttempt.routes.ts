import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  handleStartAttempt,
  handleSubmitAttempt,
  handleGetMyAttempt,
  handleGetQuizResults,
} from "./quizAttempt.controller";

const router = Router();

// POST /quiz-attempts/start  — student starts a quiz
router.post("/start", requireAuth, requireRole(["STUDENT"]), handleStartAttempt);

// POST /quiz-attempts/:attemptId/submit  — student submits answers
router.post("/:attemptId/submit", requireAuth, requireRole(["STUDENT"]), handleSubmitAttempt);

// GET /quiz-attempts/quiz/:quizId/my  — student gets their last attempt
router.get("/quiz/:quizId/my", requireAuth, requireRole(["STUDENT"]), handleGetMyAttempt);

// GET /quiz-attempts/quiz/:quizId/results  — professor sees all student results
router.get("/quiz/:quizId/results", requireAuth, requireRole(["PROFESSOR"]), handleGetQuizResults);

export default router;
