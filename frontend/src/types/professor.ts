export type Subject = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type Lesson = {
  id: string;
  subject_id: string;
  title: string;
  original_content: string;
  ai_instructions?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  lesson_variants?: { learning_type: string }[];
};

export type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

export type QuestionType = "multiple_choice" | "true_false" | "mixed";
export type QuizStatus = "draft" | "generating" | "ready";

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question: string;
  options: string[] | null;
  correct_answer: string;
  question_type: "multiple_choice" | "true_false";
  explanation: string | null;
  order_index: number;
};

export type SubjectQuiz = {
  id: string;
  subject_id: string;
  title: string;
  time_limit_minutes: number;
  question_count: number;
  question_type: QuestionType;
  status: QuizStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  quiz_lessons?: { lesson_id: string; lessons: { id: string; title: string } | null }[];
  quiz_questions?: QuizQuestion[];
};

export type StudentInSubject = {
  id: string;
  full_name: string;
  learning_type: LearningType | null;
  enrolled_at: string;
};

export type LearningTypeCounts = {
  VISUAL: number;
  AUDITORY: number;
  KINESTHETIC: number;
  UNKNOWN: number;
};

export type SubjectStudentsResponse = {
  total: number;
  students: StudentInSubject[];
  learningTypeCounts: LearningTypeCounts;
};

export type StudentProgress = {
  id: string;
  full_name: string;
  learning_type: LearningType | null;
  enrolled_at: string;
  quizzes_total: number;
  quizzes_attempted: number;
  avg_score: number | null;
  best_score: number | null;
};