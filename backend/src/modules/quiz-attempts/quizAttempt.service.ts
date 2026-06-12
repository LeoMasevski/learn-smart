import { supabaseAdmin } from "../../config/supabase";

export async function startAttempt(quizId: string, studentId: string) {
  // Only one in_progress attempt per student per quiz
  await supabaseAdmin
    .from("quiz_attempts")
    .update({ status: "abandoned" })
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .eq("status", "in_progress");

  return await supabaseAdmin
    .from("quiz_attempts")
    .insert({ quiz_id: quizId, student_id: studentId, status: "in_progress" })
    .select()
    .single();
}

export async function submitAttempt(
  attemptId: string,
  studentId: string,
  answers: { question_id: string; selected_answer: string }[],
  timeTakenSeconds: number
) {
  // Verify ownership
  const { data: attempt, error: aeErr } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, quiz_id, status")
    .eq("id", attemptId)
    .eq("student_id", studentId)
    .single();

  if (aeErr || !attempt) return { data: null, error: aeErr ?? new Error("Attempt not found") };
  if (attempt.status === "completed") return { data: null, error: new Error("Already completed") };

  // Fetch correct answers for questions in this attempt
  const questionIds = answers.map((a) => a.question_id);
  const { data: questions, error: qErr } = await supabaseAdmin
    .from("quiz_questions")
    .select("id, correct_answer")
    .in("id", questionIds);

  if (qErr || !questions) return { data: null, error: qErr ?? new Error("Questions not found") };

  const correctMap: Record<string, string> = {};
  for (const q of questions) correctMap[q.id] = q.correct_answer;

  const answerRows = answers.map((a) => ({
    attempt_id: attemptId,
    question_id: a.question_id,
    selected_answer: a.selected_answer,
    is_correct: correctMap[a.question_id] === a.selected_answer,
  }));

  await supabaseAdmin.from("quiz_attempt_answers").upsert(answerRows, { onConflict: "attempt_id,question_id" });

  const correctCount = answerRows.filter((r) => r.is_correct).length;
  const total = answerRows.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return await supabaseAdmin
    .from("quiz_attempts")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      score,
      correct_count: correctCount,
      total_count: total,
      time_taken_seconds: timeTakenSeconds,
    })
    .eq("id", attemptId)
    .select(`
      *,
      quiz_attempt_answers (
        question_id,
        selected_answer,
        is_correct
      )
    `)
    .single();
}

export async function getMyAttemptForQuiz(quizId: string, studentId: string) {
  return await supabaseAdmin
    .from("quiz_attempts")
    .select(`
      *,
      quiz_attempt_answers (
        question_id,
        selected_answer,
        is_correct
      )
    `)
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function getQuizResultsForProfessor(quizId: string) {
  const { data: attempts, error } = await supabaseAdmin
    .from("quiz_attempts")
    .select(`
      id,
      score,
      correct_count,
      total_count,
      time_taken_seconds,
      started_at,
      finished_at,
      status,
      student_id
    `)
    .eq("quiz_id", quizId)
    .eq("status", "completed")
    .order("score", { ascending: false });

  if (error || !attempts) return { data: attempts, error };

  const studentIds = [...new Set(attempts.map((a) => a.student_id))];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, learning_type")
    .in("id", studentIds);

  const profileMap: Record<string, { id: string; full_name: string; learning_type: string | null }> = {};
  for (const p of profiles ?? []) profileMap[p.id] = p;

  const data = attempts.map((a) => ({ ...a, profiles: profileMap[a.student_id] ?? null }));

  return { data, error: null };
}
