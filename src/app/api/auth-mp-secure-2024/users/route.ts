/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  verifySessionPayload,
  hashPassword,
  validateUsername,
  validatePassword,
} from '@/lib/auth/utils';

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  return 'unknown';
}

// GET: Fetch all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 },
      );
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    // Fetch all admin users (excluding sensitive data)
    const { data: users, error } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, is_admin, auth_provider, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new admin user (Enhanced to handle Google users)
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 },
      );
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    const {
      username,
      email,
      password,
      is_admin,
      auth_provider = 'email',
    } = await request.json();

    // Validation
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 },
      );
    }

    // For email auth, password is required and validated
    if (auth_provider === 'email') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required for email authentication' },
          { status: 400 },
        );
      }
      if (!validatePassword(password)) {
        return NextResponse.json(
          {
            error:
              'Invalid password. Must be at least 8 characters long and contain at least one letter and one number.',
          },
          { status: 400 },
        );
      }
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        {
          error:
            'Invalid username. Must be 3-20 characters and contain only letters, numbers, and underscores.',
        },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseAdmin
      .from('admin')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseAdmin
      .from('admin')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Hash password only for email auth
    const hashedPassword = auth_provider === 'email' ? hashPassword(password) : null;

    // Create new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('admin')
      .insert({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        is_admin: !!is_admin,
        auth_provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, username, email, is_admin, auth_provider, created_at')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      if ((insertError as any).code === '23505') {
        return NextResponse.json(
          { error: 'User with this username or email already exists' },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Log the activity
    const clientIP = getClientIP(request);
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: currentAdmin.id,
      action_type: 'CREATE_ADMIN',
      table_name: 'admin',
      record_id: newUser.id,
      changes: {
        username: newUser.username,
        email: newUser.email,
        is_admin: newUser.is_admin,
        auth_provider: newUser.auth_provider,
        created_by: currentAdmin.username,
      },
      ip_address: clientIP,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `${
          auth_provider === 'google' ? 'Google OAuth' : 'Email'
        } admin user created successfully`,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          is_admin: newUser.is_admin,
          auth_provider: newUser.auth_provider,
          created_at: newUser.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove admin user (final, de-duplicated)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 },
      );
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === currentAdmin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 },
      );
    }

    // Get user info before deletion for logging
    const { data: userToDelete, error: fetchError } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, is_admin')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user to delete:', fetchError);
      return NextResponse.json(
        { error: 'User not found or database error' },
        { status: 404 },
      );
    }
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if we're trying to delete the last admin
    const { data: allAdmins, error: countError } = await supabaseAdmin
      .from('admin')
      .select('id, is_admin')
      .eq('is_admin', true);

    if (countError) {
      console.error('Error counting admins:', countError);
      return NextResponse.json(
        { error: 'Failed to verify admin count' },
        { status: 500 },
      );
    }

    // Prevent deletion of the last admin
    if (allAdmins && allAdmins.length <= 1 && userToDelete.is_admin) {
      return NextResponse.json(
        {
          error:
            'Cannot delete the last admin user. At least one admin must remain in the system.',
        },
        { status: 400 },
      );
    }

    // Optional: delete related activity logs (or keep them for audit)
    try {
      await supabaseAdmin.from('admin_activity_log').delete().eq('admin_id', userId);
    } catch (logDeleteError) {
      console.warn(
        'Failed to delete activity logs (continuing with user deletion):',
        logDeleteError,
      );
    }

    // Delete the user
    const { error: deleteError } = await supabaseAdmin
      .from('admin')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete user: ${deleteError.message}` },
        { status: 500 },
      );
    }

    // Log the activity
    const clientIP = getClientIP(request);
    try {
      await supabaseAdmin.from('admin_activity_log').insert({
        admin_id: currentAdmin.id,
        action_type: 'DELETE_ADMIN',
        table_name: 'admin',
        record_id: userId,
        changes: {
          deleted_username: userToDelete.username,
          deleted_email: userToDelete.email,
          deleted_by: currentAdmin.username,
          reason: 'Admin user deletion via dashboard',
        },
        ip_address: clientIP,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.warn('Failed to log deletion activity:', logError);
      // Do not fail the response if logging fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
        deletedUser: {
          id: userToDelete.id,
          username: userToDelete.username,
          email: userToDelete.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('DELETE users error:', error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 },
    );
  }
}