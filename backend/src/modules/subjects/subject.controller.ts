import { Request, Response } from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subject.service";
import { cleanString, isUuid } from "../../utils/validation";

export async function handleGetAllSubjects(_req: Request, res: Response) {
  const { data, error } = await getAllSubjects();

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }

  res.json(data);
}

export async function handleGetSubjectById(req: Request, res: Response) {
  const id = req.params.id as string;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await getSubjectById(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  res.json(data);
}

export async function handleCreateSubject(req: Request, res: Response) {
  const name = cleanString(req.body.name, 150);
  const description = cleanString(req.body.description, 1000);

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
    });
  }

  const { data, error } = await createSubject(name, description);

  if (error) {
    return res.status(500).json({
      message: "Failed to create subject",
    });
  }

  res.status(201).json(data);
}

export async function handleUpdateSubject(req: Request, res: Response) {
  const id = req.params.id as string;
  const name =
    req.body.name === undefined ? undefined : cleanString(req.body.name, 150);
  const description =
    req.body.description === undefined
      ? undefined
      : cleanString(req.body.description, 1000);

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  if (name === undefined && description === undefined) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  const { data, error } = await updateSubject(id, name, description);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  res.json(data);
}

export async function handleDeleteSubject(req: Request, res: Response) {
  const id = req.params.id as string;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await deleteSubject(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  res.json({
    message: "Subject deleted successfully",
    subject: data,
  });
}
