import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { supabaseAdmin } from "../../config/supabase";

const router = Router();
const validLearningTypes = ["visual", "auditory", "kinesthetic"];

router.get("/", requireAuth, (_req, res) => {
  res.json({ message: "User routes are protected and working" });
});

router.patch(
  "/learning-type",
  requireAuth,
  requireRole(["STUDENT"]),
  async (req, res) => {
    const user = (req as any).user;
    const learningType =
      typeof req.body.learningType === "string"
        ? req.body.learningType.trim().toLowerCase()
        : "";

    if (!validLearningTypes.includes(learningType)) {
      return res.status(400).json({ message: "Invalid learning type" });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        learning_type: learningType.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: "Failed to update" });

    res.json({ message: "Learning type updated", profile: data });
  }
);

export default router;
