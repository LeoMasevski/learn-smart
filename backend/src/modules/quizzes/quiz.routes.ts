import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "Quiz routes are working",
  });
});

export default router;