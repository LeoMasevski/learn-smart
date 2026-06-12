import { supabaseAdmin } from "../../config/supabase";

export type QuestionType = "multiple_choice" | "true_false" | "mixed";
export type QuizStatus = "draft" | "generating" | "ready";

export async function getQuizzesBySubjectId(subjectId: string) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .select(`
      *,
      quiz_lessons (
        lesson_id,
        lessons ( id, title )
      ),
      quiz_questions (
        id,
        question,
        options,
        correct_answer,
        question_type,
        explanation,
        order_index
      )
    `)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });
}

// Full version for professor/post-submit (includes correct_answer + explanation)
export async function getQuizById(quizId: string) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .select(`
      *,
      quiz_lessons (
        lesson_id,
        lessons ( id, title )
      ),
      quiz_questions (
        id,
        question,
        options,
        correct_answer,
        question_type,
        explanation,
        order_index
      )
    `)
    .eq("id", quizId)
    .single();
}

// Student-safe version — NO correct_answer, NO explanation
export async function getQuizByIdForStudent(quizId: string) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .select(`
      *,
      quiz_lessons (
        lesson_id,
        lessons ( id, title )
      ),
      quiz_questions (
        id,
        question,
        options,
        question_type,
        order_index
      )
    `)
    .eq("id", quizId)
    .single();
}

export async function createQuiz(
  subjectId: string,
  createdBy: string,
  title: string,
  timeLimitMinutes: number,
  questionCount: number,
  questionType: QuestionType
) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .insert({
      subject_id: subjectId,
      created_by: createdBy,
      title,
      time_limit_minutes: timeLimitMinutes,
      question_count: questionCount,
      question_type: questionType,
      status: "draft",
    })
    .select()
    .single();
}

export async function addLessonsToQuiz(quizId: string, lessonIds: string[]) {
  const rows = lessonIds.map((lesson_id) => ({ quiz_id: quizId, lesson_id }));
  return await supabaseAdmin.from("quiz_lessons").insert(rows);
}

export async function savequizQuestions(
  quizId: string,
  questions: {
    question: string;
    options: string[] | null;
    correct_answer: string;
    question_type: "multiple_choice" | "true_false";
    explanation?: string;
    order_index: number;
  }[]
) {
  await supabaseAdmin.from("quiz_questions").delete().eq("quiz_id", quizId);
  return await supabaseAdmin.from("quiz_questions").insert(
    questions.map((q) => ({ ...q, quiz_id: quizId }))
  );
}

export async function updateQuizStatus(quizId: string, status: QuizStatus) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", quizId)
    .select()
    .single();
}

export async function deleteQuiz(quizId: string) {
  return await supabaseAdmin
    .from("subject_quizzes")
    .delete()
    .eq("id", quizId)
    .select()
    .single();
}
