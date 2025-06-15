// src/app/api/auth-mp-secure-2024/pricing/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// GET: List all pricing plans (admin only)
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST: Create new plan (admin only)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, description, price, billing_period, features, is_active } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .insert({
        name, description, price, billing_period, features, is_active,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
