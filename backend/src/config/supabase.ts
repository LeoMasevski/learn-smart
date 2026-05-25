import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "./env";

const supabaseOptions = {
  realtime: {
    transport: WebSocket as any,
  },
};

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  supabaseOptions
);

export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  supabaseOptions
);