import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

let service: SupabaseClient | null = null;

/** Service-role client — server only. Bypasses RLS; used by the indexer and API routes. */
export function serviceClient(): SupabaseClient {
  if (!service) {
    const env = serverEnv();
    service = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return service;
}
