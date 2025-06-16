/* eslint-disable @typescript-eslint/no-explicit-any */
// src\app\api\public\articles\[slug]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Helper universal context
async function getCtx(context: any) {
  if (typeof context?.then === "function") return await context;
  return context;
}

export async function GET(request: NextRequest, context: any) {
  const ctx = await getCtx(context);
  const slug = ctx.params.slug;

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
