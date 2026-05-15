import { Router } from "express";
import {
  handleGetAllSubjects,
  handleGetSubjectById,
  handleCreateSubject,
  handleUpdateSubject,
  handleDeleteSubject,
} from "./subject.controller";

import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.get("/", handleGetAllSubjects);

router.get("/:id", handleGetSubjectById);

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