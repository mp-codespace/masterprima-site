/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/pricing/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// Helper: universal context handler
async function getCtx(context: any) {
  if (typeof context?.then === "function") {
    return await context;
  }
  return context;
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const ctx = await getCtx(context);
    const id = ctx.params.id;

    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('plan_id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const ctx = await getCtx(context);
    const id = ctx.params.id;

    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error } = await supabaseAdmin
      .from('pricing_plans')
      .delete()
      .eq('plan_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
