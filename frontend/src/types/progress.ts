export type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export type QuizResultEntry = {
  id: string;
  quiz_id: string;
  quiz_title: string;
  lesson_id: string;
  lesson_title: string;
  subject_id: string;
  subject_name: string;
  score: number;
  total: number;
  percentage: number;
  completed_at: string;
};

export type SubjectProgress = {
  subject_id: string;
  subject_name: string;
  total_lessons: number;
  completed_lessons: number;
  quiz_attempts: number;
  average_score: number; // 0-100
  last_activity: string | null;
};

export type StudentStats = {
  total_quizzes: number;
  average_score: number;
  best_score: number;
  subjects_enrolled: number;
  learning_streak: number;
};