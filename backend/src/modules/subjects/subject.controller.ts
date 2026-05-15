import { Request, Response } from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subject.service";

export async function handleGetAllSubjects(_req: Request, res: Response) {
  const { data, error } = await getAllSubjects();

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }

  res.json(data);
}

export async function handleGetSubjectById(req: Request, res: Response) {
  const id = req.params.id as string;

  const { data, error } = await getSubjectById(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
      error: error?.message,
    });
  }

  res.json(data);
}

export async function handleCreateSubject(req: Request, res: Response) {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
    });
  }

  const { data, error } = await createSubject(name, description);

  if (error) {
    return res.status(500).json({
      message: "Failed to create subject",
      error: error.message,
    });
  }

  res.status(201).json(data);
}

export async function handleUpdateSubject(req: Request, res: Response) {
  const id = req.params.id as string;
  const { name, description } = req.body;

  if (name === undefined && description === undefined) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const { data, error } = await updateSubject(id, name, description);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
      error: error?.message,
    });
  }

  res.json(data);
}

export async function handleDeleteSubject(req: Request, res: Response) {
  const id = req.params.id as string;

  const { data, error } = await deleteSubject(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
      error: error?.message,
    });
  }

  res.json({
    message: "Subject deleted successfully",
    subject: data,
  });
}