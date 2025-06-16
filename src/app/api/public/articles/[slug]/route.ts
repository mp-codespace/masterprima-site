// src\app\api\public\articles\[slug]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // Await params karena Next.js 15 menjadikan params sebagai Promise
  const { slug } = await context.params;

  // Query ke Supabase untuk artikel dengan slug yang cocok dan published = true
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select(
      'article_id, title, summary, content, slug, thumbnail, publish_date, author_name, tags'
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  // Jika error atau data tidak ditemukan, kembalikan 404
  if (error || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Normalisasi tags: pastikan selalu array string
  const normalizedArticle = {
    ...data,
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === 'string'
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [],
  };

  return NextResponse.json(normalizedArticle, { status: 200 });
}
