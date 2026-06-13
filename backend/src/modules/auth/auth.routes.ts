import { Router } from "express";
import { supabase, supabaseAdmin } from "../../config/supabase";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { rateLimit } from "../../middleware/security.middleware";
import { env } from "../../config/env";
import {
  cleanString,
  isStrongEnoughPassword,
  isValidEmail,
  normalizeEmail,
} from "../../utils/validation";

const router = Router();
const allowedRoles = ["STUDENT", "PROFESSOR"] as const;
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "auth",
});

router.get("/", (_req, res) => {
  res.json({ message: "Auth routes are working" });
});

router.post("/register", authRateLimit, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const fullName = cleanString(req.body.fullName, 100);
  const role = cleanString(req.body.role, 20).toUpperCase();

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({
      message: "email, password, fullName and role are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (!isStrongEnoughPassword(password)) {
    return res.status(400).json({
      message: "Password must be between 8 and 128 characters",
    });
  }

  if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return res.status(400).json({
      message: "Registration failed",
    });
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    return res.status(400).json({
      message: "Profile creation failed",
    });
  }

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: authData.user.id,
      email: authData.user.email,
      fullName,
      role,
    },
  });
});

router.post("/login", authRateLimit, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }

  if (!isValidEmail(email) || typeof password !== "string") {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  res.json({
    message: "Login successful",
    session: data.session,
    user: data.user,
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  res.json({
    user,
    profile,
  });
});

if (env.nodeEnv !== "production") {
router.get("/test-supabase", requireAuth, requireRole(["PROFESSOR"]), async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, learning_type")
    .limit(1);

  if (error) {
    return res.status(500).json({
      message: "Supabase connection failed",
    });
  }

  res.json({
    message: "Supabase connection works",
    data,
  });
});

router.get("/test-tables", requireAuth, requireRole(["PROFESSOR"]), async (_req, res) => {
  const tables = [
    "profiles",
    "subjects",
    "user_subjects",
    "lessons",
    "lesson_variants",
    "quizzes",
    "quiz_questions",
    "quiz_results",
    "quiz_attempts",
  ];

  const results: Record<string, unknown> = {};

  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select("id").limit(1);

    results[table] = error
      ? { ok: false }
      : { ok: true, data };
  }

  res.json(results);
});
}

export default router;
