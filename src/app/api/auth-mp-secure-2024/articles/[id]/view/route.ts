/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/articles/[id]/view/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Helper untuk universal context (object atau promise)
async function getCtx(context: any) {
  if (typeof context?.then === "function") {
    return await context;
  }
  return context;
}

export async function POST(request: NextRequest, context: any) {
  const ctx = await getCtx(context);
  const id = ctx.params.id;
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
