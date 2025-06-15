// src/app/api/auth-mp-secure-2024/pricing/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = params;
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = params;

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
