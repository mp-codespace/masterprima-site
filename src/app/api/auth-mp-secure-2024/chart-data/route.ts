// File path: src/app/api/auth-mp-secure-2024/chart-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the request
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch article status counts in parallel
    const [
      { count: publishedCount, error: publishedError },
      { count: draftCount, error: draftError }
    ] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', false)
    ]);

    if (publishedError || draftError) {
      console.error('Chart data fetching error:', { publishedError, draftError });
      throw new Error('Failed to fetch chart data.');
    }

    // 3. Format data for the chart component
    const chartData = [
        { name: 'Published', value: publishedCount ?? 0, fill: '#22c55e' }, // green-500
        { name: 'Drafts', value: draftCount ?? 0, fill: '#3b82f6' }, // blue-500
    ];

    return NextResponse.json(chartData, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'An internal server error occurred' }, { status: 500 });
  }
}
