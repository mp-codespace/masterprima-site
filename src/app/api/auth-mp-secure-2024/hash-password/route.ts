// File path: src\app\api\auth-mp-secure-2024\hash-password\route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema
const hashSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  rounds: z.number().min(10).max(15).optional().default(12)
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = hashSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message || 'Invalid input data';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { password, rounds } = validationResult.data;

    // Generate bcrypt hash
    const hash = await bcrypt.hash(password, rounds);

    // Return the hash
    return NextResponse.json(
      {
        password: password,
        hash: hash,
        rounds: rounds,
        message: 'Hash generated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Hash generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      usage: 'POST with JSON body: {"password": "your_password", "rounds": 12}'
    },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}