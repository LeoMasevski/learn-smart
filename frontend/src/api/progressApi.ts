import { api } from "./api.tsx";
import type {
  QuizResultEntry,
  StudentStats,
  SubjectProgress,
} from "../types/progress.ts";

const EMPTY_STATS: StudentStats = {
  total_quizzes: 0,
  average_score: 0,
  best_score: 0,
  subjects_enrolled: 0,
  learning_streak: 0,
};

export async function fetchQuizResults(): Promise<QuizResultEntry[]> {
  const res = await api.get("/quizzes/my-results");
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchSubjectProgress(): Promise<SubjectProgress[]> {
  const res = await api.get("/dashboards/my-progress");
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStudentStats(): Promise<StudentStats> {
  const res = await api.get("/dashboards/my-stats");
  return res.data && typeof res.data.total_quizzes === "number"
    ? res.data
    : EMPTY_STATS;
}
