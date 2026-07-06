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
import { rateLimit } from "../../middleware/security.middleware";

const router = Router();
const aiGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyPrefix: "lesson-ai",
});

router.get(
  "/",
  requireAuth,
  requireRole(["PROFESSOR"]),
  handleGetAllLessons
);

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
  aiGenerationRateLimit,
  uploadPdf.single("file"),
  handleCreateLesson
);

router.post(
  "/:id/generate-variants",
  requireAuth,
  requireRole(["PROFESSOR"]),
  aiGenerationRateLimit,
  handleGenerateLessonVariants
);

router.get(
  "/:id",
  requireAuth,
  handleGetLessonById
);

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
