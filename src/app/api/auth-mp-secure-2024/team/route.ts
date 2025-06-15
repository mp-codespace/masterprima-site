// File path: src/app/api/auth-mp-secure-2024/team/route.ts

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

    // 2. Fetch team members from the database
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('member_id, name, role, image_url')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members from the database.');
    }
    
    // 3. The data is already in a good format, so we can return it directly.
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'An internal server error occurred' }, { status: 500 });
  }
}
