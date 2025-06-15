// src/app/api/public/pricing/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('pricing_plans')
    .select('*, category_id')
    .eq('is_active', true)
    .order('price', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}
