// src\app\api\public\site-settings\route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
const SETTINGS_ID = 'main';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}
