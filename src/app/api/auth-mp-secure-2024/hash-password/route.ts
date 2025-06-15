import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/utils';

/**
 * A temporary utility endpoint to securely hash a password.
 * Use this to generate a hashed password for your admin user,
 * then manually update it in your Supabase database.
 * * To use: Send a POST request to this endpoint with a JSON body
 * like { "password": "your_new_password" }.
 * * !!IMPORTANT!!: For security, you should remove this API route 
 * file after you have finished using it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required and must be a string' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    return NextResponse.json(
      {
        originalPassword: password,
        hashedPassword: hashedPassword,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password hashing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
