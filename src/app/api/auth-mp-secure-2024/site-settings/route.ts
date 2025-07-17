// src\app\api\auth-mp-secure-2024\site-settings\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

const SETTINGS_ID = 'main';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const currentAdmin = verifySessionPayload(sessionToken);
  if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function PUT(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;
  if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const currentAdmin = verifySessionPayload(sessionToken);
  if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();

  // basic validation (extend as needed)
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('site_settings')
    .update({ ...body })
    .eq('id', SETTINGS_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 200 });
}
