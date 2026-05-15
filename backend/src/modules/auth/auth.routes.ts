import { Router } from "express";
import { supabase, supabaseAdmin } from "../../config/supabase";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Auth routes are working" });
});

router.post("/register", async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({
      message: "email, password, fullName and role are required",
    });
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
      error: authError?.message,
    });
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return res.status(400).json({
      message: "Profile creation failed",
      error: profileError.message,
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      message: "Login failed",
      error: error.message,
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
      error: error.message,
    });
  }

  res.json({
    user,
    profile,
  });
});

router.get("/test-supabase", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      message: "Supabase connection failed",
      error: error.message,
    });
  }

  res.json({
    message: "Supabase connection works",
    data,
  });
});

router.get("/test-tables", async (_req, res) => {
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
    const { data, error } = await supabaseAdmin.from(table).select("*").limit(1);

    results[table] = error
      ? { ok: false, error: error.message }
      : { ok: true, data };
  }

  res.json(results);
});

export default router;