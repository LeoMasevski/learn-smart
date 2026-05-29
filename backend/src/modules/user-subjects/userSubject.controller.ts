import { Request, Response } from "express";
import {
  getUserSubjects,
  enrollUserInSubject,
  removeUserFromSubject,
} from "./userSubject.service";

export async function handleGetMySubjects(req: Request, res: Response) {
  const user = (req as any).user;

  const { data, error } = await getUserSubjects(user.id);

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch enrolled subjects",
      error: error.message,
    });
  }

  const subjects = data.map((item: any) => item.subjects).filter(Boolean);

  res.json(subjects);
}

export async function handleEnrollSubject(req: Request, res: Response) {
  const user = (req as any).user;
  const subjectId = req.params.subjectId as string;

  const { data, error } = await enrollUserInSubject(user.id, subjectId);

  if (error) {
    return res.status(500).json({
      message: "Failed to enroll in subject",
      error: error.message,
    });
  }

  res.status(201).json({
    message: "Successfully enrolled in subject",
    enrollment: data,
  });
}

export async function handleRemoveSubject(req: Request, res: Response) {
  const user = (req as any).user;
  const subjectId = req.params.subjectId as string;

  const { data, error } = await removeUserFromSubject(user.id, subjectId);

  if (error || !data) {
    return res.status(404).json({
      message: "Enrollment not found",
      error: error?.message,
    });
  }

  res.json({
    message: "Successfully removed subject",
    enrollment: data,
  });
}