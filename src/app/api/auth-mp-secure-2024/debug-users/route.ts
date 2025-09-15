// src/app/api/auth-mp-secure-2024/debug-users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
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

    // Get all admin users with detailed info
    const { data: users, error: usersError } = await supabaseAdmin
      .from('admin')
      .select('*')
      .order('created_at', { ascending: false });

    // Get foreign key constraints
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .rpc('exec_sql', {
        query: `
          SELECT 
              tc.table_name, 
              kcu.column_name, 
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name 
          FROM information_schema.table_constraints AS tc 
              JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND (tc.table_name='admin' OR ccu.table_name='admin')
        `
      });

    // Count activity logs per user
    const { data: activityCounts, error: activityError } = await supabaseAdmin
      .from('admin_activity_log')
      .select('admin_id')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        const counts: Record<string, number> = {};
        data?.forEach(log => {
          if (log.admin_id) {
            counts[log.admin_id] = (counts[log.admin_id] || 0) + 1;
          }
        });
        return { data: counts, error: null };
      });

    return NextResponse.json({
      debug_info: {
        current_admin: currentAdmin,
        total_users: users?.length || 0,
        admin_count: users?.filter(u => u.is_admin).length || 0,
        constraints_checked: !constraintsError,
        activity_logs_checked: !activityError,
      },
      users: users || [],
      constraints: constraints || [],
      activity_log_counts: activityCounts || {},
      errors: {
        users_error: usersError?.message,
        constraints_error: constraintsError?.message,
        activity_error: activityError?.message,
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, userId } = await request.json();

    if (action === 'test_delete') {
      // Test what would happen if we delete this user
      const { data: userToDelete, error: fetchError } = await supabaseAdmin
        .from('admin')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError || !userToDelete) {
        return NextResponse.json({ 
          can_delete: false, 
          reason: 'User not found',
          error: fetchError?.message 
        });
      }

      // Check if it's the last admin (fix is here: no countError)
      const { data: allAdmins } = await supabaseAdmin
        .from('admin')
        .select('id, is_admin')
        .eq('is_admin', true);

      const isLastAdmin = allAdmins && allAdmins.length <= 1 && userToDelete.is_admin;
      const isSelf = userId === currentAdmin.id;

      // Count related activity logs
      const { count: activityLogCount } = await supabaseAdmin
        .from('admin_activity_log')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', userId);

      return NextResponse.json({
        can_delete: !isLastAdmin && !isSelf,
        user_info: userToDelete,
        checks: {
          is_last_admin: isLastAdmin,
          is_self_deletion: isSelf,
          activity_log_count: activityLogCount || 0,
        },
        reasons: [
          ...(isLastAdmin ? ['Cannot delete the last admin user'] : []),
          ...(isSelf ? ['Cannot delete your own account'] : []),
        ]
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug POST failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
