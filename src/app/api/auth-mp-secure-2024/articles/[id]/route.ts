/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

async function getCtx(context: any) {
  if (typeof context?.then === "function") {
    return await context;
  }
  return context;
}

export async function GET(request: NextRequest, context: any) {
  const ctx = await getCtx(context);
  const id = ctx.params.id;

  const sessionToken = request.cookies.get('admin-session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentAdmin = verifySessionPayload(sessionToken);
  if (!currentAdmin?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('article_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, context: any) {
  const ctx = await getCtx(context);
  const id = ctx.params.id;

  const sessionToken = request.cookies.get('admin-session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentAdmin = verifySessionPayload(sessionToken);
  if (!currentAdmin?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, summary, thumbnail, is_published, publish_date, slug, tags } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content cannot be empty' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({
      title,
      content,
      summary,
      thumbnail,
      is_published,
      publish_date: publish_date || null,
      slug,
      tags: tags || null,
      updated_at: new Date().toISOString(),
    })
    .eq('article_id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Failed to update. An article with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: any) {
  const ctx = await getCtx(context);
  const id = ctx.params.id;

  const sessionToken = request.cookies.get('admin-session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentAdmin = verifySessionPayload(sessionToken);
  if (!currentAdmin?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('article_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Article deleted successfully' });
}
