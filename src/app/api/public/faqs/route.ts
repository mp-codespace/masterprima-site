// src/app/api/auth-mp-secure-2024/faqs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Ambil semua FAQ
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tambah FAQ baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category } = body;

    // Validasi input
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question dan answer wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert([
        {
          question: question.trim(),
          answer: answer.trim(),
          category: category?.trim() || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update FAQ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, question, answer, category } = body;

    // Validasi input
    if (!id) {
      return NextResponse.json(
        { error: 'ID FAQ wajib diisi' },
        { status: 400 }
      );
    }

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question dan answer wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('faqs')
      .update({
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating FAQ:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'FAQ tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus FAQ
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    // Validasi input
    if (!id) {
      return NextResponse.json(
        { error: 'ID FAQ wajib diisi' },
        { status: 400 }
      );
    }

    // Cek apakah FAQ ada
    const { data: existingFaq, error: checkError } = await supabase
      .from('faqs')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingFaq) {
      return NextResponse.json(
        { error: 'FAQ tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus FAQ
    const { error: deleteError } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting FAQ:', deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'FAQ berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS support
export function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}