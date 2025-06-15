// src/app/api/public/blog/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('article_id, title, summary, content, slug, thumbnail, publish_date, author_name, tags')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const withTags = {
    ...data,
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === 'string'
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
  };

  return NextResponse.json(withTags, { status: 200 });
}
