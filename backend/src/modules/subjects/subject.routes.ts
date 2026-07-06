import { Router } from "express";
import {
  handleGetAllSubjects,
  handleGetSubjectById,
  handleCreateSubject,
  handleUpdateSubject,
  handleDeleteSubject,
} from "./subject.controller";
import { handleGetSubjectStudents, handleGetSubjectStudentProgress } from "../user-subjects/userSubject.controller";

import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", requireAuth, handleGetAllSubjects);

router.get(
  "/:id/students",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleGetSubjectStudents
);

router.get(
  "/:id/student-progress",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleGetSubjectStudentProgress
);

router.get("/:id", requireAuth, handleGetSubjectById);

router.post(
  "/",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleCreateSubject
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleUpdateSubject
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleDeleteSubject
);

export default router;
