// src/app/api/auth-mp-secure-2024/articles/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// --- GET a single article by ID ---
export async function GET(
  request: NextRequest,
  // Corrected the signature to avoid destructuring where hidden characters might exist.
  context: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = context.params; // Extracted id from context

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('article_id', id)
      .single();

    if (error) {
      console.error('Fetch single article error:', error);
      // Provide a more specific error for the client
      if (error.code === 'PGRST116') { // PostgREST code for "No rows found"
        return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      }
      throw new Error('Failed to fetch the article.');
    }

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- PUT Method: To update an article ---
export async function PUT(
  request: NextRequest,
  // Corrected the signature to avoid destructuring.
  context: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = context.params;
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
        updated_at: new Date().toISOString()
      })
      .eq('article_id', id)
      .select()
      .single();

    if (error) {
      console.error("Update Error:", error);
      if (error.code === '23505') { // Postgres unique violation
        throw new Error('Failed to update. An article with this slug already exists.');
      }
      throw new Error('Failed to update the article.');
    }

    return NextResponse.json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- DELETE an article by ID ---
export async function DELETE(
  request: NextRequest,
  // Corrected the signature to avoid destructuring.
  context: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = context.params;
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('article_id', id);

    if (error) {
      console.error("Delete Error:", error);
      throw new Error('Failed to delete the article.');
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
