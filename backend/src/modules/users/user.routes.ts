import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json({
    message: "User routes are protected and working",
  });
});

export default router;