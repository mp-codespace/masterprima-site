// src/app/api/public/articles/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  // Add "views" to the select!
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('article_id, title, summary, content, slug, thumbnail, author_name, publish_date, updated_at, tags, views')
    .eq('is_published', true)
    .order('publish_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normalize tags and views
  const withTags = (data ?? []).map(article => ({
    ...article,
    tags: Array.isArray(article.tags)
      ? article.tags
      : typeof article.tags === 'string'
        ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
    views: typeof article.views === 'number' ? article.views : 0,
    summary: article.summary || '',
    title: article.title || '',
    content: article.content || '',
  }));

  return NextResponse.json(withTags, { status: 200 });
}
