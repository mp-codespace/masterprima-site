// File path: src\app\api\auth-mp-secure-2024\stats\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

type AdminLog = {
    log_id: string;
    action_type: string;
    changes: { username?: string } | null;
    ip_address: string | null;
    created_at: string;
    admin: { username: string } | { username: string }[] | null; 
};

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('admin_activity_log')
      .select('log_id, action_type, changes, ip_address, created_at, admin(username)') 
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Activity fetching error:', error);
      return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
    }
    
    const activity: AdminLog[] = data || [];

    const formattedActivity = activity.map(log => {
        let details = `Action: ${log.action_type}`;
        
        let adminUsername = 'An admin';
        if (log.admin) {
          if (Array.isArray(log.admin) && log.admin.length > 0) {
            adminUsername = log.admin[0].username || adminUsername;
          } else if (!Array.isArray(log.admin)) {
            adminUsername = (log.admin as { username: string }).username || adminUsername;
          }
        }
        
        const changes = log.changes;

        switch(log.action_type) {
            case 'LOGIN':
                details = `${adminUsername} logged in.`;
                break;
            case 'LOGOUT':
                details = `${adminUsername} logged out.`;
                break;
            case 'CREATE_ADMIN':
                details = `${adminUsername} created a new user: "${changes?.username || 'N/A'}".`;
                break;
        }
        return {
            id: log.log_id,
            details: details,
            timestamp: log.created_at,
        };
    });

    return NextResponse.json(formattedActivity, { status: 200 });

  } catch (error) {
    console.error('Activity route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
