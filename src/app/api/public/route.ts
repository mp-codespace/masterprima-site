// src\app\api\public\route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
