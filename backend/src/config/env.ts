import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "SUPABASE_REST_API_URL",
  "SUPABASE_PUBLISHABLE_API_KEY",
  "SUPABASE_SECRET_API_KEY",
  "GEMINI_API_KEY",
] as const;

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
const nodeEnv = process.env.NODE_ENV || "development";
const defaultCorsOrigins =
  nodeEnv === "production" ? "" : "http://localhost:3000,http://localhost:5173";
const corsAllowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  defaultCorsOrigins
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const defaultFrontendOrigin =
  corsAllowedOrigins.find((origin) => origin.includes("5173")) ||
  corsAllowedOrigins[0] ||
  "http://localhost:5173";

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export const env = {
  nodeEnv,
  port: process.env.PORT || "5000",
  supabaseUrl: process.env.SUPABASE_REST_API_URL!,
  supabaseAnonKey: process.env.SUPABASE_PUBLISHABLE_API_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SECRET_API_KEY!,
  lessonImagesBucket: process.env.SUPABASE_LESSON_IMAGES_BUCKET || "lesson_images",
  geminiApiKey: process.env.GEMINI_API_KEY!,
  corsAllowedOrigins,
  frontendOrigin: process.env.FRONTEND_ORIGIN || defaultFrontendOrigin,
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "1mb",
};
