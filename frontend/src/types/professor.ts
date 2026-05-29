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
};