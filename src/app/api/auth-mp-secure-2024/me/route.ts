// File path: src/app/api/auth-mp-secure-2024/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionPayload } from '@/lib/auth/utils';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
   
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      );
    }

    const payload = verifySessionPayload(sessionToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    const { data: user, error: dbError } = await supabaseAdmin
      .from('admin')
      .select('id, username, is_admin, created_at, updated_at')
      .eq('id', payload.id)
      .single();

    if (dbError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });

  } catch (error) {
    console.error('Me route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
