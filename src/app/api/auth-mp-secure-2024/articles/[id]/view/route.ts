// src/app/api/auth-mp-secure-2024/articles/[id]/view/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  // Get the current number of views
  const { data, error: fetchError } = await supabaseAdmin
    .from('articles')
    .select('views')
    .eq('article_id', id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const newViews = (typeof data.views === 'number' ? data.views : 0) + 1;

  const { error: updateError } = await supabaseAdmin
    .from('articles')
    .update({ views: newViews })
    .eq('article_id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 });
  }

  return NextResponse.json({ success: true, views: newViews });
}
