import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import {
  getStudentStats,
  getStudentSubjectProgress,
} from "./dashboard.service";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json({
    message: "Dashboard routes are working",
  });
});

router.get(
  "/my-progress",
  requireAuth,
  requireRole(["STUDENT"]),
  async (req, res) => {
    const user = (req as any).user;
    const { data, error } = await getStudentSubjectProgress(user.id);

    if (error || !data) {
      return res.status(500).json({ message: "Failed to fetch progress" });
    }

    res.json(data);
  }
);

router.get(
  "/my-stats",
  requireAuth,
  requireRole(["STUDENT"]),
  async (req, res) => {
    const user = (req as any).user;
    const { data, error } = await getStudentStats(user.id);

    if (error || !data) {
      return res.status(500).json({ message: "Failed to fetch stats" });
    }

    res.json(data);
  }
);

export default router;
