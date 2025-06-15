// src/app/api/public/articles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest, 
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }
  return NextResponse.json(data, { status: 200 });
}
