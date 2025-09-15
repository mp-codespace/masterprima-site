/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/upload-testimonial-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifySessionPayload } from '@/lib/auth/utils';

export const runtime = 'nodejs';        // pastikan bisa akses service key & file
export const dynamic = 'force-dynamic';  // jangan di-cache

const BUCKET = 'testimonial-images';

/** Type guard supaya aman saat verifySessionPayload bisa return "" */
function isAdminPayload(v: unknown): v is { is_admin?: boolean } {
  return !!v && typeof v === 'object' && 'is_admin' in (v as any);
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/** POST /api/auth-mp-secure-2024/upload-testimonial-image
 *  Body: multipart/form-data { file }
 *  Return: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-session')?.value ?? '';
    const payload = token ? verifySessionPayload(token) : null;

    if (!isAdminPayload(payload) || !payload.is_admin) {
      return unauthorized();
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }
    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const originalName = (file as File).name || 'upload.jpg';
    const ext = (originalName.split('.').pop() || 'jpg').toLowerCase();
    const path = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabaseAdmin
      .storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 });
    }

    return NextResponse.json({ url: data.publicUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
}

/** DELETE /api/auth-mp-secure-2024/upload-testimonial-image?path=<publicUrlOrRelativePath>
 *  Return: { ok: true }
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('admin-session')?.value ?? '';
    const payload = token ? verifySessionPayload(token) : null;

    if (!isAdminPayload(payload) || !payload.is_admin) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('path') || '';
    if (!raw) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    // Terima full public URL atau relative path
    const decoded = decodeURIComponent(raw);
    let relPath = decoded;

    // Jika full public URL, ekstrak bagian setelah /testimonial-images/
    const marker = `/${BUCKET}/`;
    if (decoded.startsWith('http')) {
      const idx = decoded.indexOf(marker);
      if (idx >= 0) relPath = decoded.slice(idx + marker.length);
    }

    if (!relPath || relPath.endsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([relPath]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
