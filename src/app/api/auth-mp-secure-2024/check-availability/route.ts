// src/app/api/auth-mp-secure-2024/check-availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload, validateUsername, validateEmail } from '@/lib/auth/utils';

// POST: Check if username or email is available
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { type, value } = await request.json();

    if (!type || !value) {
      return NextResponse.json({ error: 'Type and value are required' }, { status: 400 });
    }

    if (type !== 'username' && type !== 'email') {
      return NextResponse.json({ error: 'Type must be either "username" or "email"' }, { status: 400 });
    }

    // Validate format first
    if (type === 'username' && !validateUsername(value)) {
      return NextResponse.json({
        available: false,
        valid: false,
        message: 'Invalid username format'
      });
    }

    if (type === 'email' && !validateEmail(value)) {
      return NextResponse.json({
        available: false,
        valid: false,
        message: 'Invalid email format'
      });
    }

    // Check availability in database
    const column = type === 'username' ? 'username' : 'email';
    const searchValue = type === 'email' ? value.toLowerCase() : value.toLowerCase();

    const { data, error } = await supabaseAdmin
      .from('admin')
      .select('id')
      .eq(column, searchValue)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const isAvailable = !data; // If no data found, it's available
    const message = isAvailable 
      ? `${type.charAt(0).toUpperCase() + type.slice(1)} is available`
      : `${type.charAt(0).toUpperCase() + type.slice(1)} is already taken`;

    return NextResponse.json({
      available: isAvailable,
      valid: true,
      message
    });

  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}