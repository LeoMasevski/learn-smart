import { Request, Response } from "express";
import {
  getAllSubjects,
  getSubjectsByProfessorId,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "./subject.service";
import { getUserRole } from "../../middleware/role.middleware";
import { cleanString, isUuid } from "../../utils/validation";

function canProfessorManageSubject(userId: string, subject: any) {
  return subject?.created_by === userId;
}

export async function handleGetAllSubjects(req: Request, res: Response) {
  const user = (req as any).user;
  const role = await getUserRole(user.id);

  if (!role) {
    return res.status(403).json({ message: "Profile not found" });
  }

  const { data, error } =
    role === "PROFESSOR"
      ? await getSubjectsByProfessorId(user.id)
      : await getAllSubjects();

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }

  res.json(data);
}

export async function handleGetSubjectById(req: Request, res: Response) {
  const id = req.params.id as string;
  const user = (req as any).user;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await getSubjectById(id);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  const role = await getUserRole(user.id);
  if (!role) {
    return res.status(403).json({ message: "Profile not found" });
  }

  if (role === "PROFESSOR" && !canProfessorManageSubject(user.id, data)) {
    return res.status(403).json({
      message: "You can only access subjects you created",
    });
  }

  res.json(data);
}

export async function handleCreateSubject(req: Request, res: Response) {
  const name = cleanString(req.body.name, 150);
  const description = cleanString(req.body.description, 1000);
  const user = (req as any).user;

  if (!name) {
    return res.status(400).json({
      message: "Name is required",
    });
  }

  const { data, error } = await createSubject(name, user.id, description);

  if (error) {
    return res.status(500).json({
      message: "Failed to create subject",
    });
  }

  res.status(201).json(data);
}

export async function handleUpdateSubject(req: Request, res: Response) {
  const id = req.params.id as string;
  const user = (req as any).user;
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

  const { data, error } = await updateSubject(id, user.id, name, description);

  if (error || !data) {
    return res.status(404).json({
      message: "Subject not found",
    });
  }

  res.json(data);
}

export async function handleDeleteSubject(req: Request, res: Response) {
  const id = req.params.id as string;
  const user = (req as any).user;

  if (!isUuid(id)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await deleteSubject(id, user.id);

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
