import { Request, Response } from "express";
import {
  getQuizzesBySubjectId,
  getQuizzesBySubjectIdForStudent,
  getQuizById,
  getQuizByIdForStudent,
  createQuiz,
  addLessonsToQuiz,
  savequizQuestions,
  updateQuizStatus,
  deleteQuiz,
  type QuestionType,
} from "./subjectQuiz.service";
import { getLessonById } from "../lessons/lesson.service";
import { generateSubjectQuiz } from "../ai/ai.service";
import { getUserRole } from "../../middleware/role.middleware";
import { isUserEnrolledInSubject } from "../user-subjects/userSubject.service";
import { cleanString, isUuid } from "../../utils/validation";

export async function handleGetQuizzesBySubject(req: Request, res: Response) {
  const user = (req as any).user;
  const subjectId = req.params.subjectId as string;

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const role = await getUserRole(user.id);
  if (!role) return res.status(403).json({ message: "Profile not found" });

  if (role === "STUDENT") {
    const { isEnrolled } = await isUserEnrolledInSubject(user.id, subjectId);
    if (!isEnrolled) {
      return res.status(403).json({ message: "You are not enrolled in this subject" });
    }
  }

  const { data, error } =
    role === "STUDENT"
      ? await getQuizzesBySubjectIdForStudent(subjectId)
      : await getQuizzesBySubjectId(subjectId);

  if (error) return res.status(500).json({ message: "Failed to fetch quizzes" });
  res.json(data);
}

export async function handleGetQuizById(req: Request, res: Response) {
  const user = (req as any).user;
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const role = await getUserRole(user.id);
  if (!role) return res.status(403).json({ message: "Profile not found" });

  const { data, error } =
    role === "STUDENT"
      ? await getQuizByIdForStudent(quizId)
      : await getQuizById(quizId);

  if (error || !data) return res.status(404).json({ message: "Quiz not found" });

  if (role === "STUDENT") {
    const { isEnrolled } = await isUserEnrolledInSubject(user.id, data.subject_id);
    if (!isEnrolled) {
      return res.status(403).json({ message: "You are not enrolled in this subject" });
    }
  }

  res.json(data);
}

export async function handleCreateQuiz(req: Request, res: Response) {
  const user = (req as any).user;
  const subjectId = cleanString(req.body.subjectId, 64);
  const title = cleanString(req.body.title, 200);
  const { timeLimitMinutes, questionCount, questionType } = req.body;
  const lessonIds = Array.isArray(req.body.lessonIds) ? req.body.lessonIds : [];

  if (!subjectId || !title || !lessonIds?.length) {
    return res.status(400).json({ message: "subjectId, title and at least one lessonId are required" });
  }

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const safeLessonIds = Array.from(
    new Set(lessonIds.filter((lessonId: unknown) => isUuid(lessonId)))
  ) as string[];

  if (safeLessonIds.length === 0 || safeLessonIds.length > 50) {
    return res.status(400).json({ message: "Invalid lessonIds" });
  }

  const validTypes: QuestionType[] = ["multiple_choice", "true_false", "mixed"];
  if (!validTypes.includes(questionType)) {
    return res.status(400).json({ message: "Invalid question type" });
  }

  const count = Math.min(Math.max(Number(questionCount) || 10, 3), 50);
  const timeLimit = Math.min(Math.max(Number(timeLimitMinutes) || 15, 5), 180);

  const { data: quiz, error: quizError } = await createQuiz(
    subjectId,
    user.id,
    title,
    timeLimit,
    count,
    questionType as QuestionType
  );

  if (quizError || !quiz) {
    return res.status(500).json({ message: "Failed to create quiz" });
  }

  const { error: lessonError } = await addLessonsToQuiz(quiz.id, safeLessonIds);
  if (lessonError) {
    await deleteQuiz(quiz.id);
    return res.status(400).json({ message: "Failed to attach lessons to quiz" });
  }

  res.status(201).json({ message: "Quiz created", quiz });
}

export async function handleGenerateQuizQuestions(req: Request, res: Response) {
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const { data: quiz, error: quizError } = await getQuizById(quizId);
  if (quizError || !quiz) return res.status(404).json({ message: "Quiz not found" });

  if (quiz.status === "generating") {
    return res.status(409).json({ message: "Quiz is already being generated" });
  }

  await updateQuizStatus(quizId, "generating");

  try {
    const lessonIds: string[] = (quiz.quiz_lessons ?? []).map((ql: any) => ql.lesson_id);
    if (lessonIds.length === 0) {
      await updateQuizStatus(quizId, "draft");
      return res.status(400).json({ message: "Quiz has no lessons attached" });
    }

    const lessonContents: { title: string; content: string }[] = [];
    for (const lessonId of lessonIds) {
      const { data: lesson } = await getLessonById(lessonId);
      if (lesson) {
        lessonContents.push({ title: lesson.title, content: lesson.original_content });
      }
    }

    const questions = await generateSubjectQuiz(
      lessonContents,
      quiz.question_count,
      quiz.question_type as "multiple_choice" | "true_false" | "mixed"
    );

    await savequizQuestions(quizId, questions);
    await updateQuizStatus(quizId, "ready");

    const { data: updatedQuiz } = await getQuizById(quizId);
    res.json({ message: "Quiz generated successfully", quiz: updatedQuiz });
  } catch (err) {
    console.error(err);
    await updateQuizStatus(quizId, "draft");
    res.status(500).json({
      message: "Failed to generate quiz questions",
    });
  }
}

export async function handleDeleteQuiz(req: Request, res: Response) {
  const quizId = req.params.quizId as string;

  if (!isUuid(quizId)) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }

  const { data, error } = await deleteQuiz(quizId);
  if (error || !data) return res.status(404).json({ message: "Quiz not found" });
  res.json({ message: "Quiz deleted successfully" });
}
