/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  return 'unknown';
}

// Safe activity logging that won't break logout
async function safeLogActivity(data: {
  admin_id: string | null;
  action_type: string;
  table_name?: string;
  record_id?: string | null;
  changes?: any;
  ip_address?: string;
}) {
  try {
    await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: data.admin_id,
      action_type: data.action_type,
      table_name: data.table_name || 'admin',
      record_id: data.record_id || null,
      changes: data.changes || {},
      ip_address: data.ip_address || 'unknown',
    });
  } catch (error) {
    console.warn('Failed to log logout activity (non-critical):', error);
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  let userId: string | null = null;
  let username: string | null = null;
  let authMethod: string = 'unknown';

  try {
    console.log('🔄 Processing logout request...');
    
    const sessionToken = request.cookies.get('admin-session')?.value;
    
    // Try to get user info for logging before clearing session
    if (sessionToken) {
      try {
        const user = verifySessionPayload(sessionToken);
        if (user) {
          userId = user.id;
          username = user.username;
          authMethod = 'jwt';
          console.log(`📝 JWT session found for user: ${username}`);
        }
      } catch (error) {
        console.warn('Could not verify JWT session during logout:', error);
      }
    }

    // For Google OAuth users, we might not have JWT session but still want to log the logout
    if (!userId) {
      authMethod = 'google_oauth';
      console.log('🔗 Processing Google OAuth logout (no JWT session)');
    }

    // Log the logout activity (safe operation - won't break logout if it fails)
    await safeLogActivity({
      admin_id: userId,
      action_type: userId ? 'LOGOUT' : 'LOGOUT_ATTEMPT',
      record_id: userId,
      changes: {
        action: userId ? 'user_logout' : 'anonymous_logout_attempt',
        username: username,
        auth_method: authMethod,
        timestamp: new Date().toISOString(),
        ip_address: clientIP,
      },
      ip_address: clientIP,
    });
    
    if (userId) {
      console.log(`✅ Logout activity logged for user: ${username}`);
    } else {
      console.log('ℹ️ Anonymous logout attempt logged');
    }

    // Create response that clears any session cookies
    const response = NextResponse.json(
      { 
        message: 'Logout successful',
        authMethod: authMethod,
        cleared: sessionToken ? 'jwt_session_found' : 'no_jwt_session'
      },
      { status: 200 }
    );

    // Clear the admin-session cookie comprehensively
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    // Set cookie to expire immediately
    response.cookies.set('admin-session', '', {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    // Also try the delete method
    response.cookies.delete('admin-session');

    // Clear any other potential auth cookies
    response.cookies.set('supabase-auth-token', '', {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    // Additional headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log('✅ Logout response prepared with comprehensive cookie clearing');
    return response;

  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even if there's an error, still try to clear the cookie
    const response = NextResponse.json(
      { 
        message: 'Logout completed with errors',
        error: 'Partial logout - some cleanup may have failed',
        authMethod: authMethod
      },
      { status: 200 } // Still return 200 to not break client-side logout
    );

    // Force clear the cookie even on error
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });

    response.cookies.delete('admin-session');

    return response;
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
}