// src/app/api/auth-mp-secure-2024/articles/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// Helper to get id param from the URL
function getIdFromRequest(request: NextRequest): string | undefined {
  // Example: /api/auth-mp-secure-2024/articles/123
  const segments = request.nextUrl.pathname.split('/');
  return segments[segments.length - 1];
}

// --- GET a single article by ID ---
export async function GET(request: NextRequest) {
  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return new Response('Unauthorized', { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return new Response('Forbidden', { status: 403 });

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('article_id', id)
      .single();

    if (error) {
      console.error('Fetch single article error:', error);
      throw new Error('Article not found or failed to fetch.');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// --- PUT Method: To update an article ---
export async function PUT(request: NextRequest) {
  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return new Response('Unauthorized', { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return new Response('Forbidden', { status: 403 });

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
      console.error('Update Error:', error);
      // Optionally handle Postgres unique constraint
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
        throw new Error('Failed to update. An article with this slug already exists.');
      }
      throw new Error('Failed to update the article.');
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// --- DELETE an article by ID ---
export async function DELETE(request: NextRequest) {
  const id = getIdFromRequest(request);
  if (!id) {
    return NextResponse.json({ error: 'Missing article ID' }, { status: 400 });
  }

  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return new Response('Unauthorized', { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return new Response('Forbidden', { status: 403 });

    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('article_id', id);

    if (error) {
      console.error('Delete Error:', error);
      throw new Error('Failed to delete the article.');
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
