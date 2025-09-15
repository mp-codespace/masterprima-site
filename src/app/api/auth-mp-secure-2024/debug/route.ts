// src\app\api\auth-mp-secure-2024\debug\route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin-session')?.value;
  
  return NextResponse.json({
    hasSessionCookie: !!sessionToken,
    sessionValue: sessionToken ? 'exists' : 'missing',
    allCookies: Object.fromEntries(
      Array.from(request.cookies.getAll(), cookie => [cookie.name, 'exists'])
    )
  });
}