// File path: src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

// This file is for CLIENT-SIDE use.
// It only uses environment variables prefixed with NEXT_PUBLIC_.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing from public environment variables.');
}

// Create and export the client-side Supabase client.
// This is safe to use in browser components.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
