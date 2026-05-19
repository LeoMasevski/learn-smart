import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { supabaseAdmin } from "../../config/supabase";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json({ message: "User routes are protected and working" });
});

router.patch("/learning-type", requireAuth, requireRole(["STUDENT"]), async (req, res) => {
  const user = (req as any).user;
  const { learningType } = req.body;

  const validTypes = ["visual", "auditory", "kinesthetic"];
  if (!validTypes.includes(learningType)) {
    return res.status(400).json({ message: "Invalid learning type" });
  }

  // Pretvori v velike črke za Supabase enum
  const learningTypeUpper = learningType.toUpperCase();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ learning_type: learningTypeUpper, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Failed to update", error: error.message });

  res.json({ message: "Learning type updated", profile: data });
});

export default router;