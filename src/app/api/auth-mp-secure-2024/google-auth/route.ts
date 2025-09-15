/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/google-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSessionPayload } from '@/lib/auth/utils';

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

// Safe activity logging
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
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to log activity (non-critical):', error);
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    console.log('🔄 Processing Google Auth request...');
    
    const { email, googleSession } = await request.json();

    if (!email || !googleSession) {
      console.error('❌ Missing email or Google session data');
      return NextResponse.json({ error: 'Email and Google session are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 Processing auth for email: ${normalizedEmail}`);

    // Check if user exists in admin table and is authorized
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin')
      .select('id, username, email, is_admin, auth_provider, created_at, updated_at')
      .eq('email', normalizedEmail)
      .single();

    if (adminError || !adminUser) {
      console.error(`❌ Admin user not found for email: ${normalizedEmail}`, adminError);
      
      // Log failed authentication attempt
      await safeLogActivity({
        admin_id: null,
        action_type: 'GOOGLE_AUTH_FAILED',
        changes: {
          action: 'unauthorized_google_login_attempt',
          email: normalizedEmail,
          reason: 'user_not_in_admin_table',
          timestamp: new Date().toISOString(),
        },
        ip_address: clientIP,
      });

      return NextResponse.json({ 
        error: 'Access denied. Your Google account is not authorized for this portal. Please contact an administrator to be added to the system.' 
      }, { status: 403 });
    }

    console.log(`✅ Admin user found: ${adminUser.username} (${adminUser.email})`);

    // Update user's auth_provider to 'google' if it's not already set
    if (adminUser.auth_provider !== 'google') {
      console.log('🔄 Updating auth provider to Google...');
      try {
        await supabaseAdmin
          .from('admin')
          .update({ 
            auth_provider: 'google',
            updated_at: new Date().toISOString() 
          })
          .eq('id', adminUser.id);
        console.log('✅ Auth provider updated');
      } catch (updateError) {
        console.warn('⚠️ Failed to update auth provider (non-critical):', updateError);
      }
    }

    // Create session payload
    const sessionPayload = createSessionPayload({
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      is_admin: adminUser.is_admin,
      created_at: adminUser.created_at,
      updated_at: adminUser.updated_at,
    });

    console.log(`🎟️ Session payload created for user: ${adminUser.username}`);

    // Log successful Google authentication
    await safeLogActivity({
      admin_id: adminUser.id,
      action_type: 'GOOGLE_AUTH_SUCCESS',
      record_id: adminUser.id,
      changes: {
        action: 'successful_google_login',
        email: normalizedEmail,
        username: adminUser.username,
        timestamp: new Date().toISOString(),
      },
      ip_address: clientIP,
    });

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        isAdmin: adminUser.is_admin,
        authProvider: 'google',
      },
    }, { status: 200 });

    // Set secure HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    };

    response.cookies.set('admin-session', sessionPayload, cookieOptions);

    console.log(`✅ Google authentication successful for: ${adminUser.username}`);
    return response;

  } catch (error) {
    console.error('❌ Google auth API error:', error);
    
    // Log the error for debugging but don't expose internal details
    await safeLogActivity({
      admin_id: null,
      action_type: 'GOOGLE_AUTH_ERROR',
      changes: {
        action: 'google_auth_api_error',
        error_message: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      ip_address: getClientIP(request),
    });

    return NextResponse.json({ 
      error: 'Internal server error during authentication. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'POST' } });
}