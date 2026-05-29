import { Router } from "express";

import {
  handleGetAllLessons,
  handleGetLessonById,
  handleGetLessonVariants,
  handleGetLessonVariantByLearningType,
  handleGetLessonsBySubject,
  handleGenerateLessonVariants,
  handleCreateLesson,
  handleUpdateLesson,
  handleDeleteLesson,
} from "./lesson.controller";

import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { uploadPdf } from "../../middleware/upload.middleware";

const router = Router();

router.get("/", handleGetAllLessons);

router.get(
  "/subject/:subjectId",
  requireAuth,
  handleGetLessonsBySubject
);

router.get(
  "/:id/variants",
  requireAuth,
  handleGetLessonVariants
);

router.get(
  "/:id/variant/:learningType",
  requireAuth,
  handleGetLessonVariantByLearningType
);

router.post(
  "/",
  requireAuth,
  requireRole(["PROFESSOR"]),
  uploadPdf.single("file"),
  handleCreateLesson
);

router.post(
  "/:id/generate-variants",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleGenerateLessonVariants
);

router.get("/:id", handleGetLessonById);

router.put(
  "/:id",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleUpdateLesson
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleDeleteLesson
);

export default router;