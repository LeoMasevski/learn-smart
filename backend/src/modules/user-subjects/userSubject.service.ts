import { supabaseAdmin } from "../../config/supabase";

export async function getStudentsForSubject(subjectId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .select(`
      enrolled_at,
      profiles (
        id,
        full_name,
        learning_type
      )
    `)
    .eq("subject_id", subjectId)
    .order("enrolled_at", { ascending: false });
}

export async function getSubjectStudentProgress(
  subjectId: string,
  professorId?: string
) {
  // 1. All enrolled students
  const { data: enrolled, error: eErr } = await supabaseAdmin
    .from("user_subjects")
    .select(`enrolled_at, profiles ( id, full_name, learning_type )`)
    .eq("subject_id", subjectId);

  if (eErr || !enrolled) return { data: null, error: eErr };

  // 2. All ready quizzes for subject
  let quizQuery = supabaseAdmin
    .from("subject_quizzes")
    .select("id")
    .eq("subject_id", subjectId);

  if (professorId) {
    quizQuery = quizQuery.eq("created_by", professorId);
  }

  const { data: quizzes } = await quizQuery.eq("status", "ready");

  const quizIds = (quizzes ?? []).map((q: any) => q.id);
  const totalQuizzes = quizIds.length;

  // 3. All completed attempts for those quizzes
  let attempts: any[] = [];
  if (quizIds.length > 0) {
    const { data: att } = await supabaseAdmin
      .from("quiz_attempts")
      .select("student_id, quiz_id, score")
      .in("quiz_id", quizIds)
      .eq("status", "completed");
    attempts = att ?? [];
  }

  // 4. Aggregate per student
  const students = enrolled
    .map((row: any) => {
      const profile = row.profiles;
      if (!profile) return null;

      const studentAttempts = attempts.filter((a) => a.student_id === profile.id);
      const scores = studentAttempts.map((a) => a.score as number);
      const uniqueQuizzes = new Set(studentAttempts.map((a) => a.quiz_id)).size;

      return {
        id: profile.id,
        full_name: profile.full_name,
        learning_type: profile.learning_type ?? null,
        enrolled_at: row.enrolled_at,
        quizzes_total: totalQuizzes,
        quizzes_attempted: uniqueQuizzes,
        avg_score: scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : null,
        best_score: scores.length ? Math.max(...scores) : null,
      };
    })
    .filter(Boolean);

  return { data: students, error: null };
}

export async function getUserSubjects(userId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .select(`
      enrolled_at,
      subjects (
        id,
        name,
        description,
        created_by,
        created_at,
        updated_at,
        professor:profiles!subjects_created_by_fkey (
          id,
          full_name
        )
      )
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
}

export async function isUserEnrolledInSubject(userId: string, subjectId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_subjects")
    .select("user_id")
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  return { isEnrolled: Boolean(data && !error), error };
}

export async function enrollUserInSubject(userId: string, subjectId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .upsert(
      {
        user_id: userId,
        subject_id: subjectId,
      },
      {
        onConflict: "user_id,subject_id",
      }
    )
    .select()
    .single();
}

export async function removeUserFromSubject(userId: string, subjectId: string) {
  return await supabaseAdmin
    .from("user_subjects")
    .delete()
    .eq("user_id", userId)
    .eq("subject_id", subjectId)
    .select()
    .single();
}
