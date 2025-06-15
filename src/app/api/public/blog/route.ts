// src\app\api\public\blog\route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('article_id, title, summary, slug, thumbnail, publish_date, author_name, tags')
    .eq('is_published', true)
    .order('publish_date', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normalize tags
  const withTags = (data ?? []).map(article => ({
    ...article,
    tags: Array.isArray(article.tags)
      ? article.tags
      : typeof article.tags === 'string'
        ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
  }));

  return NextResponse.json(withTags, { status: 200 });
}
