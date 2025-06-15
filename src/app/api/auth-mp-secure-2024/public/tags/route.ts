// src\app\api\auth-mp-secure-2024\public\tags\route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Get all articles' tags
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    // Collect and flatten all tags (both array and string separated by comma)
    const tagSet = new Set<string>();
    (data ?? []).forEach((row: { tags?: string | string[] | null }) => {
      if (!row.tags) return;
      if (Array.isArray(row.tags)) {
        row.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) tagSet.add(tag.trim());
        });
      } else if (typeof row.tags === 'string') {
        row.tags.split(',').forEach(tag => {
          if (tag.trim()) tagSet.add(tag.trim());
        });
      }
    });

    return NextResponse.json(Array.from(tagSet).sort());
  } catch (error) {
    console.error('Tags API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
