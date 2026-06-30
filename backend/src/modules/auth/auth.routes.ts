import { Router } from "express";
import type { Request } from "express";
import {
  createSupabaseAuthClient,
  supabaseAdmin,
} from "../../config/supabase";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { rateLimit } from "../../middleware/security.middleware";
import { env } from "../../config/env";
import {
  cleanString,
  getPasswordPolicyMessage,
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

router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

function getBearerAccessToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return "";
  return authHeader.split(" ")[1] || "";
}

function getUserDisplayName(user: any) {
  const metadata = user?.user_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    [metadata.given_name, metadata.family_name].filter(Boolean).join(" ");

  return cleanString(name || user?.email?.split("@")[0] || "Uporabnik", 100);
}

async function ensureProfile(args: {
  user: any;
  role?: string;
  fullName?: string;
}) {
  const { user } = args;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return { profile, error: null };

  const role = cleanString(args.role, 20).toUpperCase();
  if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    return { profile: null, error: new Error("Role is required for new OAuth users") };
  }

  const fullName = cleanString(args.fullName, 100) || getUserDisplayName(user);
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      role,
    })
    .select()
    .single();

  return { profile: data, error };
}

function getOAuthProviderErrorMessage(value: string) {
  const message = value.toLowerCase();

  if (
    message.includes("unsupported provider") ||
    (message.includes("provider") && message.includes("not enabled"))
  ) {
    return "Google provider is not enabled in Supabase. Enable it under Authentication > Providers > Google.";
  }

  return "";
}

async function validateOAuthUrl(url: string) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status < 400) return { ok: true, message: "" };

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const rawMessage =
      typeof body === "string"
        ? body
        : [body?.msg, body?.message, body?.error_description, body?.error]
            .filter(Boolean)
            .join(" ");
    const providerMessage = getOAuthProviderErrorMessage(rawMessage);

    return {
      ok: false,
      message: providerMessage || "Google login is not configured correctly.",
    };
  } catch {
    return { ok: true, message: "" };
  }
}

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
      message: getPasswordPolicyMessage(),
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
      user_metadata: {
        full_name: fullName,
      },
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

  const authClient = createSupabaseAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
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

router.get("/google/url", authRateLimit, async (req, res) => {
  const role = cleanString(req.query.role, 20).toUpperCase();

  if (role && !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const callbackUrl = new URL("/auth/callback", env.frontendOrigin);
  if (role) callbackUrl.searchParams.set("role", role);

  const authClient = createSupabaseAuthClient();
  const { data, error } = await authClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    const providerMessage = getOAuthProviderErrorMessage(error.message);

    return res.status(providerMessage ? 400 : 500).json({
      message: providerMessage || "Failed to create Google login URL",
    });
  }

  if (!data.url) {
    return res.status(500).json({ message: "Failed to create Google login URL" });
  }

  const providerCheck = await validateOAuthUrl(data.url);
  if (!providerCheck.ok) {
    return res.status(400).json({ message: providerCheck.message });
  }

  res.json({ url: data.url });
});

router.post("/oauth/complete", authRateLimit, async (req, res) => {
  const accessToken = getBearerAccessToken(req);

  if (!accessToken) {
    return res.status(401).json({ message: "Missing OAuth access token" });
  }

  const authClient = createSupabaseAuthClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ message: "Invalid OAuth session" });
  }

  const { profile, error: profileError } = await ensureProfile({
    user,
    role: req.body.role,
    fullName: req.body.fullName,
  });

  if (profileError || !profile) {
    return res.status(400).json({
      message: profileError?.message || "Failed to create profile",
    });
  }

  res.json({
    message: "OAuth login successful",
    user,
    profile,
    session: {
      access_token: accessToken,
    },
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
