import { Request, Response } from "express";
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsBySubjectId,
} from "./lesson.service";

import { extractContentFromPdf, type ExtractedPdfImage } from "../../utils/pdf";
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

  try {
    const lessonImages = await listLessonImages(lesson.id);
    const variants = await generateLessonVariantsFromText(
      lesson.title,
      lesson.original_content,
      lesson.ai_instructions || "",
      lessonImages
    );

    for (const variant of variants) {
      await createLessonVariant(
        lesson.id,
        variant.learningType,
        variant.blocks
      );
    }

    return res.json({
      message: "Lesson variants generated successfully",
      variantsGenerated: variants.length,
      lessonImagesUsed: lessonImages.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to generate lesson variants",
    });
  }
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
  let pdfImageCount = 0;
  let uploadedPdfImageCount = 0;
  let imageExtractionError: string | null = null;
  let extractedPdfImages: ExtractedPdfImage[] = [];

  try {
    if (file) {
      assertPdfBuffer(file.buffer);
      const extracted = await extractContentFromPdf(file.buffer);
      finalContent = extracted.text.trim();
      extractedPdfImages = extracted.images;
      pdfImageCount = extracted.images.length;
      imageExtractionError = extracted.imageExtractionError || null;
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

    let variantsGenerated = 0;
    let aiError: string | null = null;
    let imageUploadError: string | null = null;
    let lessonImages: Awaited<ReturnType<typeof uploadLessonImages>> = [];

    try {
      if (extractedPdfImages.length > 0) {
        lessonImages = await uploadLessonImages(lesson.id, extractedPdfImages);
        uploadedPdfImageCount = lessonImages.length;
      }
    } catch (error) {
      console.error(error);
      imageUploadError = "PDF image upload failed";
    }

    try {
      const variants = await generateLessonVariantsFromText(
        title,
        finalContent,
        safeAiInstructions,
        lessonImages
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
      console.error(error);
      aiError = "AI generation failed";
    }

    const message = aiError
      ? file
        ? "Lesson created from PDF, but AI generation failed"
        : "Lesson created, but AI generation failed"
      : imageUploadError
      ? "Lesson created from PDF and variants generated, but PDF image upload failed"
      : file
      ? "Lesson created from PDF with images and variants generated successfully"
      : "Lesson created and variants generated successfully";

    return res.status(201).json({
      message,
      lesson,
      variantsGenerated,
      aiError,
      imageUploadError,
      pdf: file
        ? {
            originalName: file.originalname,
            size: file.size,
            extractedTextLength: finalContent.length,
            extractedImageCount: pdfImageCount,
            uploadedImageCount: uploadedPdfImageCount,
            imageExtractionError,
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
