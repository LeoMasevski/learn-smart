import { Request, Response } from "express";
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsBySubjectId,
} from "./lesson.service";

import { extractContentFromPdf, extractTextFromPdf } from "../../utils/pdf";
import { generateLessonVariantsFromText } from "../ai/ai.service";
import {
  createLessonVariant,
  getLessonVariantsByLessonId,
  getLessonVariantByLearningType,
} from "../lesson-variants/lessonVariant.service";
import {
  deleteLessonImages,
  listLessonImages,
  uploadLessonImages,
} from "../lesson-images/lessonImage.service";
import { assertPdfBuffer } from "../../middleware/upload.middleware";
import { cleanString, isUuid } from "../../utils/validation";

const maxLessonContentLength = 80_000;
const learningTypes = ["VISUAL", "AUDITORY", "KINESTHETIC"] as const;

function queueLessonVariantGeneration(args: {
  lessonId: string;
  title: string;
  originalContent: string;
  aiInstructions: string;
  pdfBuffer?: Buffer;
}) {
  setImmediate(() => {
    void generateLessonVariantsInBackground(args);
  });
}

async function generateLessonVariantsInBackground({
  lessonId,
  title,
  originalContent,
  aiInstructions,
  pdfBuffer,
}: {
  lessonId: string;
  title: string;
  originalContent: string;
  aiInstructions: string;
  pdfBuffer?: Buffer;
}) {
  try {
    await Promise.all(
      learningTypes.map((learningType) =>
        createLessonVariant(lessonId, learningType, [
          createGenerationStatusBlock(),
        ])
      )
    );

    let lessonImages = await listLessonImages(lessonId);

    if (pdfBuffer && lessonImages.length === 0) {
      try {
        const extracted = await extractContentFromPdf(pdfBuffer);
        if (extracted.images.length > 0) {
          lessonImages = await uploadLessonImages(lessonId, extracted.images);
        }
      } catch (error) {
        console.error("Background PDF image processing failed:", error);
      }
    }

    const variants = await generateLessonVariantsFromText(
      title,
      originalContent,
      aiInstructions,
      lessonImages
    );

    await Promise.all(
      variants.map((variant) =>
        createLessonVariant(lessonId, variant.learningType, variant.blocks)
      )
    );
  } catch (error) {
    console.error(`Background lesson generation failed for ${lessonId}:`, error);
  }
}

function createGenerationStatusBlock() {
  return {
    type: "generation_status",
    status: "generating",
  };
}

export async function handleGetAllLessons(_req: Request, res: Response) {
  const { data, error } = await getAllLessons();

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch lessons",
    });
  }

  res.json(data);
}

export async function handleGetLessonById(req: Request, res: Response) {
  const id = req.params.id as string;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

  const { data, error } = await getLessonById(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }

  res.json(data);
}

export async function handleGetLessonVariants(req: Request, res: Response) {
  const lessonId = req.params.id as string;

  if (!isUuid(lessonId)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

  const { data, error } = await getLessonVariantsByLessonId(lessonId);

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch lesson variants",
    });
  }

  res.json(data);
}

export async function handleGenerateLessonVariants(req: Request, res: Response) {
  const lessonId = req.params.id as string;

  if (!isUuid(lessonId)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

  const { data: lesson, error: lessonError } = await getLessonById(lessonId);

  if (lessonError || !lesson) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }

  queueLessonVariantGeneration({
    lessonId: lesson.id,
    title: lesson.title,
    originalContent: lesson.original_content,
    aiInstructions: lesson.ai_instructions || "",
  });

  return res.status(202).json({
    message: "Lesson variant generation started",
    generationQueued: true,
  });
}

export async function handleCreateLesson(req: Request, res: Response) {
  const subjectId = cleanString(req.body.subjectId, 64);
  const title = cleanString(req.body.title, 200);
  const originalContent =
    typeof req.body.originalContent === "string" ? req.body.originalContent : "";
  const aiInstructions = req.body.aiInstructions;
  const user = (req as any).user;
  const file = req.file;

  if (!subjectId || !title) {
    return res.status(400).json({
      message: "subjectId and title are required",
    });
  }

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const safeAiInstructions =
    typeof aiInstructions === "string" ? aiInstructions.slice(0, 1000) : "";

  let finalContent = originalContent.trim();
  let pdfBufferForGeneration: Buffer | undefined;

  try {
    if (file) {
      assertPdfBuffer(file.buffer);
      pdfBufferForGeneration = Buffer.from(file.buffer);
      const extracted = await extractTextFromPdf(file.buffer);
      finalContent = extracted.text.trim();
    }

    if (!finalContent || finalContent.trim().length < 20) {
      return res.status(400).json({
        message: "Lesson content or a readable PDF file is required",
      });
    }

    if (finalContent.length > maxLessonContentLength) {
      finalContent = finalContent.slice(0, maxLessonContentLength);
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
      });
    }

    queueLessonVariantGeneration({
      lessonId: lesson.id,
      title,
      originalContent: finalContent,
      aiInstructions: safeAiInstructions,
      pdfBuffer: pdfBufferForGeneration,
    });

    return res.status(201).json({
      message: file
        ? "Lesson created from PDF. AI variants are generating in the background"
        : "Lesson created. AI variants are generating in the background",
      lesson,
      variantsGenerated: 0,
      generationQueued: true,
      aiError: null,
      imageUploadError: null,
      pdf: file
        ? {
            originalName: file.originalname,
            size: file.size,
            extractedTextLength: finalContent.length,
          }
        : undefined,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to process lesson",
    });
  }
}

export async function handleUpdateLesson(req: Request, res: Response) {
  const id = req.params.id as string;
  const subjectId =
    req.body.subjectId === undefined
      ? undefined
      : cleanString(req.body.subjectId, 64);
  const title =
    req.body.title === undefined ? undefined : cleanString(req.body.title, 200);
  const originalContent =
    req.body.originalContent === undefined
      ? undefined
      : String(req.body.originalContent).trim().slice(0, maxLessonContentLength);
  const aiInstructions = req.body.aiInstructions;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

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

  if (subjectId !== undefined && !isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
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
    });
  }

  res.json(data);
}

export async function handleDeleteLesson(req: Request, res: Response) {
  const id = req.params.id as string;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

  const { data, error } = await deleteLesson(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }

  try {
    await deleteLessonImages(id);
  } catch (error) {
    console.error("Failed to delete lesson images:", error);
  }

  res.json({
    message: "Lesson deleted successfully",
    lesson: data,
  });
}

export async function handleGetLessonsBySubject(req: Request, res: Response) {
  const subjectId = req.params.subjectId as string;

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await getLessonsBySubjectId(subjectId);

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch lessons for subject",
    });
  }

  res.json(data);
}

export async function handleGetLessonVariantByLearningType(
  req: Request,
  res: Response
) {
  const lessonId = req.params.id as string;
  const learningType = (req.params.learningType as string).toUpperCase();

  if (!isUuid(lessonId)) {
    return res.status(400).json({ message: "Invalid lesson id" });
  }

  const validTypes = ["VISUAL", "AUDITORY", "KINESTHETIC"];

  if (!validTypes.includes(learningType)) {
    return res.status(400).json({
      message: "Invalid learning type",
    });
  }

  const { data, error } = await getLessonVariantByLearningType(
    lessonId,
    learningType as "VISUAL" | "AUDITORY" | "KINESTHETIC"
  );

  if (error || !data) {
    return res.status(404).json({
      message: "Lesson variant not found",
    });
  }

  res.json(data);
}
