/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/public/articles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest, context: any) {
  const slug = context?.params?.slug;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug param' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }
  return NextResponse.json(data, { status: 200 });
}
