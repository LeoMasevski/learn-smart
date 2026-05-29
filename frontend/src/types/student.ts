import type { LessonData } from "../components/lesson/LessonRenderer";

export type LearningType = "VISUAL" | "AUDITORY" | "KINESTHETIC";

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