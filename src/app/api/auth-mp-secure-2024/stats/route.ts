/* eslint-disable @typescript-eslint/no-explicit-any */
// File path: src/app/api/auth-mp-secure-2024/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // Verify the current user is an authenticated admin
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    try {
      const { data, error } = await supabaseAdmin
        .from('admin_activity_log')
        .select('log_id, action_type, ip_address, created_at, admin_id, changes')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Activity fetching error:', error);
        // Return empty array instead of error to prevent dashboard breaking
        return NextResponse.json([], { status: 200 });
      }

      const activity = data || [];

      // Simple formatting without complex admin username lookups
      const formattedActivity = activity.map(log => {
        const details = getActivityDescription(log.action_type, log.changes);
        
        return {
          id: log.log_id,
          action_type: log.action_type,
          details: details,
          created_at: log.created_at,
          ip_address: log.ip_address,
        };
      });

      return NextResponse.json(formattedActivity, { status: 200 });

    } catch (dbError) {
      console.error('Database error fetching activity:', dbError);
      // Return empty array instead of failing completely
      return NextResponse.json([], { status: 200 });
    }

  } catch (error) {
    console.error('Stats route error:', error);
    // Return empty array instead of failing completely
    return NextResponse.json([], { status: 200 });
  }
}

// Helper function to generate activity descriptions
function getActivityDescription(actionType: string, changes: any): string {
  try {
    const parsedChanges = typeof changes === 'string' ? JSON.parse(changes) : changes;
    
    switch (actionType) {
      case 'LOGIN_SUCCESS':
        return `Successful login${parsedChanges?.login_method ? ` via ${parsedChanges.login_method}` : ''}`;
      
      case 'LOGIN_FAILED':
        return `Failed login attempt${parsedChanges?.reason ? ` (${parsedChanges.reason})` : ''}`;
      
      case 'LOGOUT':
        return 'User logged out';
      
      case 'CREATE_ADMIN':
        return `Created new admin user${parsedChanges?.username ? `: ${parsedChanges.username}` : ''}`;
      
      case 'DELETE_ADMIN':
        return `Deleted admin user${parsedChanges?.deleted_username ? `: ${parsedChanges.deleted_username}` : ''}`;
      
      case 'GOOGLE_AUTH_SUCCESS':
        return 'Successful Google authentication';
      
      case 'GOOGLE_AUTH_FAILED':
        return 'Failed Google authentication attempt';
      
      default:
        return `${actionType.replace(/_/g, ' ').toLowerCase()}`;
    }
  } catch {
    // If changes parsing fails, just return the action type
    return actionType.replace(/_/g, ' ').toLowerCase();
  }
}