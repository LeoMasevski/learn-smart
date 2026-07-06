import { Request, Response } from "express";
import {
  getUserSubjects,
  enrollUserInSubject,
  removeUserFromSubject,
  getStudentsForSubject,
  getSubjectStudentProgress,
} from "./userSubject.service";
import { isUuid } from "../../utils/validation";

export async function handleGetSubjectStudents(req: Request, res: Response) {
  const subjectId = (req.params.id ?? req.params.subjectId) as string;

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await getStudentsForSubject(subjectId);

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch students for subject",
    });
  }

  const students = (data ?? [])
    .map((item: any) => {
      const profile = item.profiles;
      if (!profile) return null;
      return {
        id: profile.id,
        full_name: profile.full_name,
        learning_type: profile.learning_type ?? null,
        enrolled_at: item.enrolled_at,
      };
    })
    .filter(Boolean);

  const learningTypeCounts = { VISUAL: 0, AUDITORY: 0, KINESTHETIC: 0, UNKNOWN: 0 };
  for (const s of students as any[]) {
    const lt = s.learning_type as string | null;
    if (lt === "VISUAL" || lt === "AUDITORY" || lt === "KINESTHETIC") {
      learningTypeCounts[lt]++;
    } else {
      learningTypeCounts.UNKNOWN++;
    }
  }

  res.json({
    total: students.length,
    students,
    learningTypeCounts,
  });
}

export async function handleGetSubjectStudentProgress(req: Request, res: Response) {
  const subjectId = (req.params.id ?? req.params.subjectId) as string;
  const user = (req as any).user;

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await getSubjectStudentProgress(subjectId, user.id);
  if (error || !data) return res.status(500).json({ message: "Failed to fetch student progress" });
  res.json(data);
}

export async function handleGetMySubjects(req: Request, res: Response) {
  const user = (req as any).user;

  const { data, error } = await getUserSubjects(user.id);

  if (error) {
    return res.status(500).json({
      message: "Failed to fetch enrolled subjects",
    });
  }

  const subjects = data.map((item: any) => item.subjects).filter(Boolean);

  res.json(subjects);
}

export async function handleEnrollSubject(req: Request, res: Response) {
  const user = (req as any).user;
  const subjectId = req.params.subjectId as string;

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await enrollUserInSubject(user.id, subjectId);

  if (error) {
    return res.status(500).json({
      message: "Failed to enroll in subject",
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

  if (!isUuid(subjectId)) {
    return res.status(400).json({ message: "Invalid subject id" });
  }

  const { data, error } = await removeUserFromSubject(user.id, subjectId);

  if (error || !data) {
    return res.status(404).json({
      message: "Enrollment not found",
    });
  }

  res.json({
    message: "Successfully removed subject",
    enrollment: data,
  });
}
