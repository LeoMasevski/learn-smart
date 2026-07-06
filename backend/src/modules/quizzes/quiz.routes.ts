import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { getStudentQuizResults } from "../dashboards/dashboard.service";

const router = Router();

router.get(
  "/my-results",
  requireAuth,
  requireRole(["STUDENT"]),
  async (req, res) => {
    const user = (req as any).user;
    const { data, error } = await getStudentQuizResults(user.id);

    if (error || !data) {
      return res.status(500).json({ message: "Failed to fetch quiz results" });
    }

    res.json(data);
  }
);

router.get("/", requireAuth, (_req, res) => {
  res.json({
    message: "Quiz routes are working",
  });
});

export default router;
