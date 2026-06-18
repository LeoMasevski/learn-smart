import { api } from "./api.tsx";
import type { QuizResultEntry, SubjectProgress, StudentStats } from "../types/progress.ts";

//  Mock data za zdaj

export const MOCK_QUIZ_RESULTS: QuizResultEntry[] = [
  {
    id: "r1",
    quiz_id: "q1",
    quiz_title: "Uvod v JavaScript",
    lesson_id: "l1",
    lesson_title: "Spremenljivke in tipi",
    subject_id: "s1",
    subject_name: "Programiranje",
    score: 8,
    total: 10,
    percentage: 80,
    completed_at: "2025-05-28T10:15:00Z",
  },
  {
    id: "r2",
    quiz_id: "q2",
    quiz_title: "Funkcije v JS",
    lesson_id: "l2",
    lesson_title: "Funkcije in parametri",
    subject_id: "s1",
    subject_name: "Programiranje",
    score: 6,
    total: 10,
    percentage: 60,
    completed_at: "2025-06-01T14:30:00Z",
  },
  {
    id: "r3",
    quiz_id: "q3",
    quiz_title: "Osnove omrežij",
    lesson_id: "l3",
    lesson_title: "TCP/IP in HTTP",
    subject_id: "s2",
    subject_name: "Računalniška omrežja",
    score: 9,
    total: 10,
    percentage: 90,
    completed_at: "2025-06-03T09:00:00Z",
  },
  {
    id: "r4",
    quiz_id: "q4",
    quiz_title: "Algoritmi – osnove",
    lesson_id: "l4",
    lesson_title: "Iskanje in razvrščanje",
    subject_id: "s3",
    subject_name: "Algoritmi",
    score: 7,
    total: 10,
    percentage: 70,
    completed_at: "2025-06-05T16:45:00Z",
  },
  {
    id: "r5",
    quiz_id: "q5",
    quiz_title: "Asinhrono programiranje",
    lesson_id: "l5",
    lesson_title: "Promises in async/await",
    subject_id: "s1",
    subject_name: "Programiranje",
    score: 10,
    total: 10,
    percentage: 100,
    completed_at: "2025-06-07T11:20:00Z",
  },
];

export const MOCK_SUBJECT_PROGRESS: SubjectProgress[] = [
  {
    subject_id: "s1",
    subject_name: "Programiranje",
    total_lessons: 8,
    completed_lessons: 5,
    quiz_attempts: 3,
    average_score: 80,
    last_activity: "2025-06-07T11:20:00Z",
  },
  {
    subject_id: "s2",
    subject_name: "Računalniška omrežja",
    total_lessons: 6,
    completed_lessons: 3,
    quiz_attempts: 1,
    average_score: 90,
    last_activity: "2025-06-03T09:00:00Z",
  },
  {
    subject_id: "s3",
    subject_name: "Algoritmi",
    total_lessons: 10,
    completed_lessons: 2,
    quiz_attempts: 1,
    average_score: 70,
    last_activity: "2025-06-05T16:45:00Z",
  },
];

export const MOCK_STATS: StudentStats = {
  total_quizzes: 5,
  average_score: 80,
  best_score: 100,
  subjects_enrolled: 3,
  learning_streak: 4,
};

// ─── API helpers (fall back to mock if backend not ready) ────────────────────

export async function fetchQuizResults(): Promise<QuizResultEntry[]> {
  try {
    const res = await api.get("/quizzes/my-results");
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    return MOCK_QUIZ_RESULTS;
  } catch {
    return MOCK_QUIZ_RESULTS;
  }
}

export async function fetchSubjectProgress(): Promise<SubjectProgress[]> {
  try {
    const res = await api.get("/dashboards/my-progress");
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    return MOCK_SUBJECT_PROGRESS;
  } catch {
    return MOCK_SUBJECT_PROGRESS;
  }
}

export async function fetchStudentStats(): Promise<StudentStats> {
  try {
    const res = await api.get("/dashboards/my-stats");
    if (res.data && typeof res.data.total_quizzes === "number") return res.data;
    return MOCK_STATS;
  } catch {
    return MOCK_STATS;
  }
}

export async function saveQuizResult(payload: {
  quiz_id: string;
  lesson_id: string;
  score: number;
  total: number;
}): Promise<void> {
  try {
    await api.post("/quizzes/results", payload);
  } catch {
    // silently ignore when backend not ready
  }
}