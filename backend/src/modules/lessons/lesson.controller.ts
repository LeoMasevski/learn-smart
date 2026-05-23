import { Request, Response } from "express";
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./lesson.service";

import { extractTextFromPdf } from "../../utils/pdf";
import { generateLessonVariantsFromText } from "../ai/ai.service";
import { createLessonVariant } from "../lesson-variants/lessonVariant.service";

export async function handleGetAllLessons(_req: Request, res: Response) {
  const { data, error } = await getAllLessons();

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch lessons",
      error: error.message,
    });
  }

  res.json(data);
}

export async function handleGetLessonById(req: Request, res: Response) {
  const id = req.params.id as string;

  const { data, error } = await getLessonById(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson not found",
      error: error?.message,
    });
  }

  res.json(data);
}

export async function handleCreateLesson(req: Request, res: Response) {
  const { subjectId, title, originalContent, aiInstructions } = req.body;
  const user = (req as any).user;
  const file = req.file;

  if (!subjectId || !title) {
    return res.status(400).json({
      message: "subjectId and title are required",
    });
  }

  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";

  let finalContent = originalContent;

  try {
    if (file) {
      const extracted = await extractTextFromPdf(file.buffer);
      finalContent = extracted.text;
    }

    if (!finalContent || finalContent.trim().length < 20) {
      return res.status(400).json({
        message: "Lesson content or a readable PDF file is required",
      });
    }

    const { data: lesson, error: lessonError } = await createLesson(
      subjectId,
      user.id,
      title,
      finalContent,
      safeAiInstructions
    );

    if (lessonError || !lesson) {
      return res.status(500).json({
        message: "Failed to create lesson",
        error: lessonError?.message,
      });
    }

    let variantsGenerated = 0;
    let aiError: string | null = null;

    try {
      const variants = await generateLessonVariantsFromText(
        title,
        finalContent,
        safeAiInstructions
      );

      for (const variant of variants) {
        await createLessonVariant(
          lesson.id,
          variant.learningType,
          variant.blocks
        );
      }

      variantsGenerated = variants.length;
    } catch (error) {
      aiError = error instanceof Error ? error.message : "Unknown AI error";
    }

    return res.status(201).json({
      message: aiError
        ? file
          ? "Lesson created from PDF, but AI generation failed"
          : "Lesson created, but AI generation failed"
        : file
          ? "Lesson created from PDF and variants generated successfully"
          : "Lesson created and variants generated successfully",
      lesson,
      variantsGenerated,
      aiError,
      pdf: file
        ? {
            originalName: file.originalname,
            size: file.size,
            extractedTextLength: finalContent.length,
          }
        : undefined,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleUpdateLesson(req: Request, res: Response) {
  const id = req.params.id as string;
  const { subjectId, title, originalContent, aiInstructions } = req.body;

  if (
    subjectId === undefined &&
    title === undefined &&
    originalContent === undefined &&
    aiInstructions === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : aiInstructions;

  const { data, error } = await updateLesson(
    id,
    subjectId,
    title,
    originalContent,
    safeAiInstructions
  );

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson not found",
      error: error?.message,
    });
  }

  res.json(data);
}

export async function handleDeleteLesson(req: Request, res: Response) {
  const id = req.params.id as string;

  const { data, error } = await deleteLesson(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson not found",
      error: error?.message,
    });
  }

  res.json({
    message: "Lesson deleted successfully",
    lesson: data,
  });
}