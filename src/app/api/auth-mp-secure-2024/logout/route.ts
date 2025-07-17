// File path: src/app/auth-mp-secure-2024/logout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { verifySessionPayload } from '@/lib/auth/utils'

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value
    
    if (sessionToken) {
      const user = verifySessionPayload(sessionToken)
      
      if (user) {
        // Get client IP address
        const clientIP = getClientIP(request);
        
        // Log admin activity
        await supabaseAdmin.from('admin_activity_log').insert({
          admin_id: user.id,
          action_type: 'LOGOUT',
          ip_address: clientIP
        })
      }
    }
    
    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )
    
    // Clear session cookie
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
