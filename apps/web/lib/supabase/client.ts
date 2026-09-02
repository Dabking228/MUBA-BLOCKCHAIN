import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

let browser: SupabaseClient | null = null;

/** Anon client — safe for client components and read-only server reads. */
export function browserClient(): SupabaseClient {
  if (!browser) {
    browser = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return browser;
}
