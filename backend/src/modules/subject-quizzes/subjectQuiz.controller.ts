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
  updateQuizQuestionCount,
  getQuizQuestionById,
  updateQuizQuestion,
  addQuizQuestion,
  deleteQuizQuestion,
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

function parseQuestionPayload(body: any) {
  const question = cleanString(body.question, 2000);
  const correctAnswer = cleanString(body.correct_answer, 500);
  const questionType = body.question_type;
  const explanation = body.explanation != null ? cleanString(body.explanation, 1000) || null : null;

  if (!question || !correctAnswer) {
    return { error: "question and correct_answer are required" };
  }

  if (!["multiple_choice", "true_false"].includes(questionType)) {
    return { error: "Invalid question type" };
  }

  let options: string[];
  if (questionType === "true_false") {
    options = ["Res", "Ni res"];
    if (!options.includes(correctAnswer)) {
      return { error: 'correct_answer must be "Res" or "Ni res" for true_false questions' };
    }
  } else {
    if (!Array.isArray(body.options)) {
      return { error: "options array is required for multiple_choice questions" };
    }
    const cleanedOptions: string[] = body.options
      .map((o: unknown) => cleanString(o, 500))
      .filter((o: string) => o.length > 0);
    if (cleanedOptions.length < 2) {
      return { error: "multiple_choice questions require at least 2 options" };
    }
    if (!cleanedOptions.includes(correctAnswer)) {
      return { error: "correct_answer must match one of the options" };
    }
    options = cleanedOptions;
  }

  return {
    data: {
      question,
      options,
      correct_answer: correctAnswer,
      question_type: questionType as "multiple_choice" | "true_false",
      explanation,
    },
  };
}

export async function handleAddQuizQuestion(req: Request, res: Response) {
  const quizId = req.params.quizId as string;
  if (!isUuid(quizId)) return res.status(400).json({ message: "Invalid quiz id" });

  const { data: quiz, error: quizError } = await getQuizById(quizId);
  if (quizError || !quiz) return res.status(404).json({ message: "Quiz not found" });

  const { data: payload, error: validationError } = parseQuestionPayload(req.body);
  if (validationError || !payload) {
    return res.status(400).json({ message: validationError });
  }

  const nextOrderIndex = (quiz.quiz_questions ?? []).length;

  const { data: created, error } = await addQuizQuestion(quizId, {
    ...payload,
    order_index: nextOrderIndex,
  });
  if (error || !created) {
    return res.status(500).json({ message: "Failed to add question" });
  }

  await updateQuizQuestionCount(quizId, nextOrderIndex + 1);

  res.status(201).json({ message: "Question added", question: created });
}

export async function handleUpdateQuizQuestion(req: Request, res: Response) {
  const quizId = req.params.quizId as string;
  const questionId = req.params.questionId as string;
  if (!isUuid(quizId) || !isUuid(questionId)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const { data: existing, error: existingError } = await getQuizQuestionById(questionId);
  if (existingError || !existing || existing.quiz_id !== quizId) {
    return res.status(404).json({ message: "Question not found" });
  }

  const { data: payload, error: validationError } = parseQuestionPayload(req.body);
  if (validationError || !payload) {
    return res.status(400).json({ message: validationError });
  }

  const { data: updated, error } = await updateQuizQuestion(questionId, payload);
  if (error || !updated) {
    return res.status(500).json({ message: "Failed to update question" });
  }

  res.json({ message: "Question updated", question: updated });
}

export async function handleDeleteQuizQuestion(req: Request, res: Response) {
  const quizId = req.params.quizId as string;
  const questionId = req.params.questionId as string;
  if (!isUuid(quizId) || !isUuid(questionId)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const { data: existing, error: existingError } = await getQuizQuestionById(questionId);
  if (existingError || !existing || existing.quiz_id !== quizId) {
    return res.status(404).json({ message: "Question not found" });
  }

  const { data: quiz } = await getQuizById(quizId);
  const remaining = (quiz?.quiz_questions ?? []).length - 1;
  if (remaining < 1) {
    return res.status(400).json({ message: "Quiz must have at least one question" });
  }

  const { data: deleted, error } = await deleteQuizQuestion(questionId);
  if (error || !deleted) {
    return res.status(500).json({ message: "Failed to delete question" });
  }

  await updateQuizQuestionCount(quizId, remaining);

  res.json({ message: "Question deleted" });
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
