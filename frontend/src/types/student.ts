import type { LessonData } from "../components/lesson/LessonRenderer";

export type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export type QuizQuestionForStudent = {
  id: string;
  question: string;
  options: string[] | null;
  question_type: "multiple_choice" | "true_false";
  order_index: number;
  // correct_answer intentionally omitted — not sent to student until after submit
};

export type SubjectQuizForStudent = {
  id: string;
  subject_id: string;
  title: string;
  time_limit_minutes: number;
  question_count: number;
  question_type: "multiple_choice" | "true_false" | "mixed";
  status: "draft" | "generating" | "ready";
  quiz_questions?: QuizQuestionForStudent[];
};

export type QuizAttemptAnswer = {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  status: "in_progress" | "completed";
  score: number | null;
  correct_count: number | null;
  total_count: number | null;
  time_taken_seconds: number | null;
  started_at: string;
  finished_at: string | null;
  quiz_attempt_answers?: QuizAttemptAnswer[];
};

export type StudentSubject = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StudentLesson = {
  id: string;
  subject_id: string;
  created_by: string;
  title: string;
  original_content: string;
  ai_instructions?: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonVariant = {
  id: string;
  lesson_id: string;
  learning_type: LearningType;
  content_blocks: LessonData["blocks"];
  generated_at: string;
};