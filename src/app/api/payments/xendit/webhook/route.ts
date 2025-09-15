/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payments/xendit/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type XenditInvoicePayload = {
  id: string;
  external_id?: string;
  status?: string;
  amount?: number;
  paid_amount?: number;
  paid_at?: string;
  created?: string;
  updated?: string;
  customer?: any;
  customer_details?: any;
  metadata?: { items?: any; customer?: any } | null;
  [k: string]: any;
};

function normalizeStatus(s?: string) {
  const x = (s || "").toUpperCase();
  if (x === "PAID" || x === "SETTLED") return "PAID";
  if (x === "EXPIRED") return "EXPIRED";
  if (x === "FAILED") return "FAILED";
  return "PENDING";
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token") || "";
  if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
    return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
  }

  const payload = (await req.json()) as XenditInvoicePayload;
  console.log("[xendit-webhook] incoming:", payload.id, payload.status);

  const normalizedStatus = normalizeStatus(payload.status);
  const items = payload.metadata?.items ?? (payload as any).items ?? [];
  const customer =
    payload.customer ?? payload.customer_details ?? payload.metadata?.customer ?? null;

  const record = {
    id: String(payload.id),
    external_id: String(payload.external_id || payload.id || ""),
    amount: Number(payload.amount ?? payload.paid_amount ?? 0),
    status: normalizedStatus as "PENDING" | "PAID" | "FAILED" | "EXPIRED",
    items,
    customer_details: customer,
    created_at: payload.created
      ? new Date(payload.created).toISOString()
      : new Date().toISOString(),
    updated_at: payload.updated
      ? new Date(payload.updated).toISOString()
      : new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("transactions").upsert(record, { onConflict: "id" });

  if (error) {
    console.error("[xendit-webhook] supabase upsert error:", error);
    return NextResponse.json(
      { ok: false, saved: false, reason: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, saved: true });
}
