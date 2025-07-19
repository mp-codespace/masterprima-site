/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/public/pricing/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Helper to get slug from the URL
function getSlug(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  // Adjust the split index if the route is nested deeper
  const parts = pathname.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2]; // fallback for trailing slash
}

export async function GET(request: NextRequest) {
  try {
    const slug = getSlug(request);

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const { data: plan, error } = await supabaseAdmin
      .from('pricing_plans')
      .select('*')
      .eq('plan_id', slug)
      .eq('is_active', true)
      .single();

    if (error || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const features = plan.features as Record<string, any> || {};
    const response = {
      plan_id: plan.plan_id,
      name: plan.name,
      price: plan.price,
      original_price: features.original_price || plan.price,
      features: features.list || [],
      icon: features.icon || 'package',
      popular: features.popular || false,
      category: features.category || 'Premium',
      category_key: features.category_key || 'premium',
      description: plan.description || `Paket ${plan.name} dengan fasilitas lengkap dan berkualitas tinggi untuk mencapai target Anda.`,
      duration: features.duration || '4 Bulan',
      sessions: features.sessions || '30 Pertemuan',
      maxStudents: features.max_students || 'Kelas Kecil',
      badge: features.popular ? 'POPULER' : 'PREMIUM',
      badgeColor: features.popular ? 'bg-red-600' : 'bg-primary-orange',
      isPopular: features.popular || false,
      billing_period: plan.billing_period || 'monthly',
      created_at: plan.created_at,
      updated_at: plan.updated_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const slug = getSlug(request);

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const body = await request.json();
    const { data: updatedPlan, error } = await supabaseAdmin
      .from('pricing_plans')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        billing_period: body.billing_period,
        features: body.features,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('plan_id', slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
