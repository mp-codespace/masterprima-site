// src/app/api/auth-mp-secure-2024/test-email/route.ts
// Optional: Test endpoint to verify email configuration

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionPayload } from '@/lib/auth/utils';
import { testEmailConnection, sendPasswordResetEmail } from '@/lib/email/service';

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin-session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentAdmin = verifySessionPayload(sessionToken);
    if (!currentAdmin || !currentAdmin.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, email } = await request.json();

    if (action === 'test-connection') {
      const isConnected = await testEmailConnection();
      return NextResponse.json({
        success: isConnected,
        message: isConnected 
          ? 'Email configuration is working correctly' 
          : 'Email configuration test failed'
      });
    }

    if (action === 'send-test' && email) {
      await sendPasswordResetEmail({
        to: email,
        username: 'Test User',
        resetUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth-mp-secure-2024/reset-password?token=test-token-123`
      });

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}