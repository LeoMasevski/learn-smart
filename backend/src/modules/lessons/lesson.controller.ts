import { Request, Response } from "express";
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./lesson.service";

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
  const { subjectId, title, originalContent } = req.body;
  const user = (req as any).user;

  if (!subjectId || !title || !originalContent) {
    return res.status(400).json({
      message: "subjectId, title and originalContent are required",
    });
  }

  const { data, error } = await createLesson(
    subjectId,
    user.id,
    title,
    originalContent
  );

  if (error) {
    return res.status(500).json({
      message: "Failed to create lesson",
      error: error.message,
    });
  }

  res.status(201).json(data);
}

export async function handleUpdateLesson(req: Request, res: Response) {
  const id = req.params.id as string;
  const { subjectId, title, originalContent } = req.body;

  if (
    subjectId === undefined &&
    title === undefined &&
    originalContent === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const { data, error } = await updateLesson(
    id,
    subjectId,
    title,
    originalContent
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