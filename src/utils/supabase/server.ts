// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Guard required env vars early with readable errors.
 */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `[supabase] Missing required env var: ${name}. ` +
        `Set it in your .env(.local) or hosting environment.`
    );
  }
  return v;
}

/**
 * Create a Supabase client bound to the current request's cookies.
 * Next.js 15: cookies() is async, so this function is async too.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        // Safe in RSC and Server Actions
        return cookieStore.get(name)?.value ?? null;
      },
      async set(name: string, value: string, options: CookieOptions) {
        // This can throw during the RSC render phase; ignore there.
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          /* no-op in RSC */
        }
      },
      async remove(name: string, options: CookieOptions) {
        // Supabase uses "set empty" semantics for delete
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          /* no-op in RSC */
        }
      },
    },
  });
}

/**
 * Optional alias so callers can import with a more explicit name:
 *   import { createServerSupabaseClient } from "@/utils/supabase/server";
 */
export const createServerSupabaseClient = createClient;
