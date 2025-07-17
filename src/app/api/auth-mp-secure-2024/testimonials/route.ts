// src/app/api/auth-mp-secure-2024/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ambil semua testimoni
export async function GET() {
  const { data, error } = await supabase.from('testimonials').select('*').order('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// Tambah testimoni baru
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from('testimonials').insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}

// Update testimoni by id
export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }
  const { id, ...updateFields } = body;
  const { data, error } = await supabase.from('testimonials').update(updateFields).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 200 });
}

// Hapus testimoni by id
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 200 });
}