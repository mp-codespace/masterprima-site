// src/app/api/public/articles/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Handler untuk GET article by slug
export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  // Ambil slug dari context, pastikan ada!
  const slug = context?.params?.slug;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug param' }, { status: 400 });
  }

  // Query robust, toleran error (tidak error kalau tidak ketemu)
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    // Jika error dari supabase, return 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // Tidak ketemu, return 404
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Sukses
  return NextResponse.json(data, { status: 200 });
}
