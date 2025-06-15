// src/app/api/auth-mp-secure-2024/articles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

// Helper to generate a URL-friendly slug from a title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};


// --- GET Method: To fetch all articles ---
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Fetch the new fields as well
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('article_id, title, updated_at, is_published, publish_date, author_name')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      throw new Error('Failed to fetch articles from the database.');
    }

    // Format for the frontend list view
    const formattedArticles = data.map(article => ({
      id: article.article_id,
      title: article.title,
      updatedAt: article.updated_at,
      publishDate: article.publish_date, // Send publish date to frontend
      status: article.is_published ? 'Published' : 'Draft',
      authorName: article.author_name || 'N/A', // Use the pre-saved author_name
    }));

    return NextResponse.json(formattedArticles, { status: 200 });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


// --- POST Method: To create a new article ---
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { title, content, summary, thumbnail, is_published, publish_date, slug, tags } = body;


    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate a slug if one isn't provided, otherwise use the provided one
    const finalSlug = slug || generateSlug(title);

    const { data, error } = await supabaseAdmin
        .from('articles')
        .insert({
            title,
            content, // Content is now the JSON string from BlockNote
            summary,
            thumbnail,
            is_published,
            publish_date: publish_date || null, // Handle empty date
            slug: finalSlug,
            tags: tags || null, // Handle empty tags
            author_id: currentAdmin.id,
            author_name: currentAdmin.username // Save author's name directly
        })
        .select()
        .single();
    
    if (error) {
        console.error('Error creating article:', error);
        // Provide a more specific error if it's a unique constraint violation (like a duplicate slug)
        if (error.code === '23505') {
            throw new Error('Failed to save. An article with this slug already exists.');
        }
        throw new Error('Failed to save the new article.');
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
