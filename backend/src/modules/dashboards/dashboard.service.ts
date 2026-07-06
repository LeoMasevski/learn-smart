import { supabaseAdmin } from "../../config/supabase";

type CompletedAttempt = {
  id: string;
  quiz_id: string;
  score: number | null;
  correct_count: number | null;
  total_count: number | null;
  started_at: string | null;
  finished_at: string | null;
};

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function buildLearningStreak(attempts: CompletedAttempt[]) {
  const days = unique(
    attempts
      .map((attempt) => attempt.finished_at || attempt.started_at)
      .filter(Boolean)
      .map((date) => new Date(date as string).toISOString().slice(0, 10))
  ).sort((a, b) => (a > b ? -1 : 1));

  if (days.length === 0) return 0;

  let streak = 0;
  const cursor = new Date(`${days[0]}T00:00:00.000Z`);

  for (const day of days) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day !== expected) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

async function getStudentCompletedAttempts(studentId: string) {
  return await supabaseAdmin
    .from("quiz_attempts")
    .select(
      "id, quiz_id, score, correct_count, total_count, started_at, finished_at"
    )
    .eq("student_id", studentId)
    .eq("status", "completed")
    .order("finished_at", { ascending: false });
}

async function getQuizMetadata(quizIds: string[]) {
  if (quizIds.length === 0) return { data: [], error: null };

  return await supabaseAdmin
    .from("subject_quizzes")
    .select(
      `
      id,
      title,
      subject_id,
      subjects (
        id,
        name
      ),
      quiz_lessons (
        lesson_id,
        lessons (
          id,
          title
        )
      )
    `
    )
    .in("id", quizIds);
}

export async function getStudentQuizResults(studentId: string) {
  const { data: attempts, error: attemptsError } =
    await getStudentCompletedAttempts(studentId);

  if (attemptsError || !attempts) {
    return { data: null, error: attemptsError };
  }

  const quizIds = unique(attempts.map((attempt) => attempt.quiz_id));
  const { data: quizzes, error: quizzesError } = await getQuizMetadata(quizIds);

  if (quizzesError || !quizzes) {
    return { data: null, error: quizzesError };
  }

  const quizzesById = new Map(quizzes.map((quiz: any) => [quiz.id, quiz]));

  const results = attempts.map((attempt: CompletedAttempt) => {
    const quiz: any = quizzesById.get(attempt.quiz_id);
    const firstLesson = quiz?.quiz_lessons?.[0];
    const lesson = firstLesson?.lessons;
    const total = attempt.total_count ?? 100;
    const score = attempt.correct_count ?? attempt.score ?? 0;
    const percentage =
      typeof attempt.score === "number"
        ? attempt.score
        : total > 0
        ? Math.round((score / total) * 100)
        : 0;

    return {
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: quiz?.title ?? "Kviz",
      lesson_id: lesson?.id ?? firstLesson?.lesson_id ?? attempt.quiz_id,
      lesson_title: lesson?.title ?? quiz?.title ?? "Kviz",
      subject_id: quiz?.subject_id ?? "",
      subject_name: quiz?.subjects?.name ?? "Neznan predmet",
      score,
      total,
      percentage,
      completed_at: attempt.finished_at ?? attempt.started_at,
    };
  });

  return { data: results, error: null };
}

export async function getStudentSubjectProgress(studentId: string) {
  const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
    .from("user_subjects")
    .select(
      `
      subject_id,
      enrolled_at,
      subjects (
        id,
        name
      )
    `
    )
    .eq("user_id", studentId)
    .order("enrolled_at", { ascending: false });

  if (enrollmentsError || !enrollments) {
    return { data: null, error: enrollmentsError };
  }

  const subjectIds = enrollments.map((row: any) => row.subject_id);
  if (subjectIds.length === 0) {
    return { data: [], error: null };
  }

  const [{ data: lessons }, { data: quizzes }, { data: attempts }] =
    await Promise.all([
      supabaseAdmin
        .from("lessons")
        .select("id, subject_id")
        .in("subject_id", subjectIds),
      supabaseAdmin
        .from("subject_quizzes")
        .select("id, subject_id")
        .in("subject_id", subjectIds)
        .eq("status", "ready"),
      getStudentCompletedAttempts(studentId),
    ]);

  const quizIds = unique((quizzes ?? []).map((quiz: any) => quiz.id));
  const { data: quizLessons } =
    quizIds.length > 0
      ? await supabaseAdmin
          .from("quiz_lessons")
          .select("quiz_id, lesson_id")
          .in("quiz_id", quizIds)
      : { data: [] as any[] };

  const subjectLessons = new Map<string, Set<string>>();
  for (const lesson of lessons ?? []) {
    const set = subjectLessons.get(lesson.subject_id) ?? new Set<string>();
    set.add(lesson.id);
    subjectLessons.set(lesson.subject_id, set);
  }

  const quizSubject = new Map<string, string>();
  for (const quiz of quizzes ?? []) {
    quizSubject.set(quiz.id, quiz.subject_id);
  }

  const quizLessonIds = new Map<string, string[]>();
  for (const row of quizLessons ?? []) {
    const ids = quizLessonIds.get(row.quiz_id) ?? [];
    ids.push(row.lesson_id);
    quizLessonIds.set(row.quiz_id, ids);
  }

  const completedAttempts = (attempts ?? []) as CompletedAttempt[];

  const progress = enrollments.map((row: any) => {
    const subject = row.subjects;
    const subjectId = row.subject_id;
    const subjectQuizIds = quizIds.filter((quizId) => quizSubject.get(quizId) === subjectId);
    const subjectAttempts = completedAttempts.filter((attempt) =>
      subjectQuizIds.includes(attempt.quiz_id)
    );
    const completedLessonIds = new Set<string>();

    for (const attempt of subjectAttempts) {
      for (const lessonId of quizLessonIds.get(attempt.quiz_id) ?? []) {
        completedLessonIds.add(lessonId);
      }
    }

    const scores = subjectAttempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => typeof score === "number");
    const lastActivity =
      subjectAttempts
        .map((attempt) => attempt.finished_at || attempt.started_at)
        .filter(Boolean)
        .sort((a, b) => ((a as string) > (b as string) ? -1 : 1))[0] ?? null;

    return {
      subject_id: subjectId,
      subject_name: subject?.name ?? "Neznan predmet",
      total_lessons: subjectLessons.get(subjectId)?.size ?? 0,
      completed_lessons: completedLessonIds.size,
      quiz_attempts: subjectAttempts.length,
      average_score: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0,
      last_activity: lastActivity,
    };
  });

  return { data: progress, error: null };
}

export async function getStudentStats(studentId: string) {
  const [{ data: attempts, error: attemptsError }, { data: enrollments }] =
    await Promise.all([
      getStudentCompletedAttempts(studentId),
      supabaseAdmin
        .from("user_subjects")
        .select("subject_id")
        .eq("user_id", studentId),
    ]);

  if (attemptsError || !attempts) {
    return { data: null, error: attemptsError };
  }

  const scores = attempts
    .map((attempt: CompletedAttempt) => attempt.score)
    .filter((score): score is number => typeof score === "number");

  return {
    data: {
      total_quizzes: attempts.length,
      average_score: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0,
      best_score: scores.length ? Math.max(...scores) : 0,
      subjects_enrolled: enrollments?.length ?? 0,
      learning_streak: buildLearningStreak(attempts as CompletedAttempt[]),
    },
    error: null,
  };
}
