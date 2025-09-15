/* eslint-disable @typescript-eslint/no-unused-vars */
// File path: src\app\api\auth-mp-secure-2024\manage-users\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Add a user to the admin table (authorize them)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, isAdmin = false } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and username are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin')
      .select('id, email, username')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.error('Database error during user check:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in the admin table' },
        { status: 409 }
      );
    }

    // Add user to admin table
    const { data: newUser, error: insertError } = await supabase
      .from('admin')
      .insert({
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        is_admin: isAdmin,
        password: null, // No password needed for OAuth users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, username, is_admin, created_at')
      .single();

    if (insertError) {
      console.error('Error adding user to admin table:', insertError);
      return NextResponse.json(
        { error: 'Failed to add user to admin table' },
        { status: 500 }
      );
    }

    // Log the action
    try {
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: newUser.id,
          action_type: 'user_added',
          table_name: 'admin',
          record_id: newUser.id,
          changes: JSON.stringify({
            action: 'user_authorized',
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            is_admin: isAdmin,
            timestamp: new Date().toISOString()
          }),
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log user addition:', logError);
    }

    return NextResponse.json(
      {
        message: 'User successfully added to admin portal',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          isAdmin: newUser.is_admin,
          createdAt: newUser.created_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in user management:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all authorized users
export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from('admin')
      .select('id, email, username, is_admin, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove user from admin table (revoke access)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find and delete user
    const { data: deletedUser, error: deleteError } = await supabase
      .from('admin')
      .delete()
      .eq('email', email.toLowerCase())
      .select('id, email, username')
      .single();

    if (deleteError || !deletedUser) {
      return NextResponse.json(
        { error: 'User not found or failed to delete' },
        { status: 404 }
      );
    }

    // Log the action
    try {
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: null,
          action_type: 'user_removed',
          table_name: 'admin',
          record_id: deletedUser.id,
          changes: JSON.stringify({
            action: 'user_access_revoked',
            email: deletedUser.email,
            username: deletedUser.username,
            timestamp: new Date().toISOString()
          }),
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log user removal:', logError);
    }

    return NextResponse.json(
      {
        message: 'User access revoked successfully',
        user: {
          id: deletedUser.id,
          email: deletedUser.email,
          username: deletedUser.username
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}