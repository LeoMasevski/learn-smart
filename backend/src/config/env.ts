import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "5000",
  supabaseUrl: process.env.SUPABASE_REST_API_URL || "",
  supabaseAnonKey: process.env.SUPABASE_PUBLISHABLE_API_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SECRET_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
};