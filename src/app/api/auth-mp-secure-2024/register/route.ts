// File path: src/app/api/auth-mp-secure-2024/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  hashPassword,
  verifySessionPayload,
  validateUsername,
  validatePassword,
} from '@/lib/auth/utils';

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username. Must be 3-20 characters and can only contain letters, numbers, and underscores.' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
       return NextResponse.json(
        { error: 'Invalid password. Must be at least 8 characters long and contain at least one letter and one number.' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from('admin')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 }); // 409 Conflict
    }

    const hashedPassword = hashPassword(password);

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('admin')
      .insert({
        username,
        password: hashedPassword,
        is_admin: true, 
      })
      .select('id, username, created_at')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    const clientIP = getClientIP(request);
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: currentAdmin.id,
      action_type: 'CREATE_ADMIN',
      table_name: 'admin',
      record_id: newUser.id,
      changes: { username: newUser.username },
      ip_address: clientIP
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        created_at: newUser.created_at,
      },
    }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
