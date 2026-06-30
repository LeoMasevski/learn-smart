import { createClient } from "@supabase/supabase-js";
// @ts-ignore
import WebSocket from "ws";
import { env } from "./env";

const supabaseOptions = {
  realtime: {
    transport: WebSocket as any,
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
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

export function createSupabaseAuthClient(accessToken?: string) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...supabaseOptions,
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}
