import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

import {
  handleGetMySubjects,
  handleEnrollSubject,
  handleRemoveSubject,
} from "./userSubject.controller";

const router = Router();

router.get(
  "/my-subjects",
  requireAuth,
  requireRole(["STUDENT"]),
  handleGetMySubjects
);

router.post(
  "/:subjectId/enroll",
  requireAuth,
  requireRole(["STUDENT"]),
  handleEnrollSubject
);

router.delete(
  "/:subjectId",
  requireAuth,
  requireRole(["STUDENT"]),
  handleRemoveSubject
);

export default router;