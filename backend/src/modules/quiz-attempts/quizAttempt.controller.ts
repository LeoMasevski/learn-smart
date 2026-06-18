import { Request, Response } from "express";
import {
  startAttempt,
  submitAttempt,
  getMyAttemptForQuiz,
  getQuizResultsForProfessor,
} from "./quizAttempt.service";
import { getQuizById, getQuizByIdForStudent } from "../subject-quizzes/subjectQuiz.service";
import { isUserEnrolledInSubject } from "../user-subjects/userSubject.service";
import { isUuid } from "../../utils/validation";

export async function handleStartAttempt(req: Request, res: Response) {
  const user = (req as any).user;
  const { quizId } = req.body;

  if (!quizId) return res.status(400).json({ message: "quizId is required" });
  if (!isUuid(quizId)) return res.status(400).json({ message: "Invalid quiz id" });

  // Use full version just to check status
  const { data: quiz } = await getQuizById(quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  if (quiz.status !== "ready") return res.status(400).json({ message: "Quiz is not ready yet" });

  const { isEnrolled } = await isUserEnrolledInSubject(user.id, quiz.subject_id);
  if (!isEnrolled) {
    return res.status(403).json({ message: "You are not enrolled in this subject" });
  }

  const { data, error } = await startAttempt(quizId, user.id);
  if (error || !data) return res.status(500).json({ message: "Failed to start attempt" });

  // Return student-safe quiz — no correct_answer, no explanation
  const { data: safeQuiz } = await getQuizByIdForStudent(quizId);

  res.status(201).json({ attempt: data, quiz: safeQuiz });
}

export async function handleSubmitAttempt(req: Request, res: Response) {
  const user = (req as any).user;
  const attemptId = req.params.attemptId as string;
  const { answers, timeTakenSeconds } = req.body;

  if (!isUuid(attemptId)) {
    return res.status(400).json({ message: "Invalid attempt id" });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "answers array is required" });
  }

  if (answers.length > 100) {
    return res.status(400).json({ message: "Too many answers submitted" });
  }

  const boundedTimeTaken = Math.min(
    Math.max(Number(timeTakenSeconds) || 0, 0),
    24 * 60 * 60
  );

  const { data, error } = await submitAttempt(
    attemptId,
    user.id,
    answers,
    boundedTimeTaken
  );

  if (error || !data) {
    return res.status(error?.message === "Already completed" ? 409 : 500).json({
      message: error?.message ?? "Failed to submit attempt",
    });
  }

  // Return enriched result with per-question feedback
  const { data: quiz } = await getQuizById(data.quiz_id);

  res.json({ attempt: data, quiz });
}

export async function handleGetMyAttempt(req: Request, res: Response) {
  const user = (req as any).user;
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const { data, error } = await getMyAttemptForQuiz(quizId, user.id);
  if (error) return res.status(500).json({ message: "Failed to fetch attempt" });

  res.json(data ?? null);
}

export async function handleGetMyAttemptReview(req: Request, res: Response) {
  const user = (req as any).user;
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const { data, error } = await getMyAttemptForQuiz(quizId, user.id);
  if (error) return res.status(500).json({ message: "Failed to fetch attempt" });
  if (!data || data.status !== "completed") {
    return res.status(404).json({ message: "No completed attempt found for this quiz" });
  }

  const { data: quiz } = await getQuizById(data.quiz_id);

  res.json({ attempt: data, quiz });
}

export async function handleGetQuizResults(req: Request, res: Response) {
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const { data, error } = await getQuizResultsForProfessor(quizId);
  if (error) return res.status(500).json({ message: "Failed to fetch results" });

  const results = (data ?? []).map((row: any) => ({
    attempt_id: row.id,
    score: row.score,
    correct_count: row.correct_count,
    total_count: row.total_count,
    time_taken_seconds: row.time_taken_seconds,
    started_at: row.started_at,
    finished_at: row.finished_at,
    student: row.profiles ?? null,
  }));

  const avg = results.length
    ? Math.round(results.reduce((s: number, r: any) => s + r.score, 0) / results.length)
    : null;

  res.json({ total_attempts: results.length, average_score: avg, results });
}
