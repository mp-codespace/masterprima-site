// File: src/lib/supabase/client.ts

// NOTE: Use this ONLY in Client Components / the browser.
// For server/RSC or route handlers, use a separate server client via @supabase/ssr.
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from public environment variables.');
}

/**
 * Single shared browser client.
 * createBrowserClient handles session persistence & token refresh for you,
 * so you no longer need the manual auth/storage options.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
