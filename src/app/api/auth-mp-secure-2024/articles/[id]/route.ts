import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// --- GET a single article by ID ---
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
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
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- PUT Method: To update an article ---
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
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
        updated_at: new Date().toISOString()
      })
      .eq('article_id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Failed to update. An article with this slug already exists.' }, { status: 400 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// --- DELETE an article by ID ---
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
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
      throw new Error(error.message);
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
