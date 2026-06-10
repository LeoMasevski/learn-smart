import { Request, Response } from "express";
import {
  getQuizzesBySubjectId,
  getQuizById,
  createQuiz,
  addLessonsToQuiz,
  savequizQuestions,
  updateQuizStatus,
  deleteQuiz,
  type QuestionType,
} from "./subjectQuiz.service";
import { getLessonById } from "../lessons/lesson.service";
import { generateSubjectQuiz } from "../ai/ai.service";

export async function handleGetQuizzesBySubject(req: Request, res: Response) {
  const subjectId = req.params.subjectId as string;
  const { data, error } = await getQuizzesBySubjectId(subjectId);
  if (error) return res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
  res.json(data);
}

export async function handleGetQuizById(req: Request, res: Response) {
  const quizId = req.params.quizId as string;
  const { data, error } = await getQuizById(quizId);
  if (error || !data) return res.status(404).json({ message: "Quiz not found", error: error?.message });
  res.json(data);
}

export async function handleCreateQuiz(req: Request, res: Response) {
  const user = (req as any).user;
  const { subjectId, title, timeLimitMinutes, questionCount, questionType, lessonIds } = req.body;

  if (!subjectId || !title || !lessonIds?.length) {
    return res.status(400).json({ message: "subjectId, title and at least one lessonId are required" });
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
    return res.status(500).json({ message: "Failed to create quiz", error: quizError?.message });
  }

  await addLessonsToQuiz(quiz.id, lessonIds as string[]);

  res.status(201).json({ message: "Quiz created", quiz });
}

export async function handleGenerateQuizQuestions(req: Request, res: Response) {
  const quizId = req.params.quizId as string;

  const { data: quiz, error: quizError } = await getQuizById(quizId);
  if (quizError || !quiz) return res.status(404).json({ message: "Quiz not found" });

  if (quiz.status === "generating") {
    return res.status(409).json({ message: "Quiz is already being generated" });
  }

  await updateQuizStatus(quizId, "generating");

  try {
    const lessonIds: string[] = (quiz.quiz_lessons ?? []).map((ql: any) => ql.lesson_id);
    if (lessonIds.length === 0) {
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
    await updateQuizStatus(quizId, "draft");
    res.status(500).json({
      message: "Failed to generate quiz questions",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

export async function handleDeleteQuiz(req: Request, res: Response) {
  const quizId = req.params.quizId as string;
  const { data, error } = await deleteQuiz(quizId);
  if (error || !data) return res.status(404).json({ message: "Quiz not found", error: error?.message });
  res.json({ message: "Quiz deleted successfully" });
}
