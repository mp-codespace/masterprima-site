// File path: src/lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js';

// This file is for SERVER-SIDE use only.
// It uses server-only environment variables.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

// Create and export the server-side Supabase admin client.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
