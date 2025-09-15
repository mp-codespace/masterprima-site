// src/app/api/auth-mp-secure-2024/test-cookies/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;
  
  return NextResponse.json({
    hasSessionCookie: !!sessionToken,
    sessionValue: sessionToken ? 'exists' : 'missing',
    cookieDetails: sessionToken ? {
      length: sessionToken.length,
      preview: sessionToken.substring(0, 20) + '...'
    } : null,
    allCookies: Object.fromEntries(
      Array.from(request.cookies.getAll(), cookie => [cookie.name, 'exists'])
    ),
    timestamp: new Date().toISOString()
  });
}