/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payments/xendit/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createInvoice, CartItem, Customer } from "@/lib/payments/xendit";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";       // gunakan Node runtime (Buffer, dll)
export const dynamic = "force-dynamic"; // jangan di-cache

export async function POST(req: NextRequest) {
  try {
    const { items, customer } = (await req.json()) as {
      items: CartItem[];
      customer?: Customer;
    };

    // Validasi input
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items required" }, { status: 400 });
    }

    // (opsional) sanitasi qty minimal 1
    const safeItems = items.map((it) => ({
      ...it,
      qty: typeof it.qty === "number" && it.qty > 0 ? it.qty : 1,
    }));

    // Buat invoice di Xendit
    const invoice = await createInvoice(safeItems, customer);

    // Upsert transaksi PENDING agar langsung tampil di Admin
    // (kalau gagal, log saja; status final tetap akan dikirim via webhook)
    try {
      await supabaseAdmin.from("transactions").upsert(
        {
          id: invoice.id, // invoice_id Xendit sebagai PK
          external_id: invoice.external_id,
          amount: Number(invoice.amount ?? 0),
          status: "PENDING",
          items: safeItems,
          customer_details: customer ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (dbErr) {
      console.error("[create-invoice] upsert PENDING failed:", dbErr);
      // jangan melempar error; biarkan invoice tetap dikirim ke client
    }

    // Kembalikan URL untuk redirect ke halaman pembayaran Xendit
    return NextResponse.json({
      invoice_url: invoice.invoice_url,
      id: invoice.id,
      external_id: invoice.external_id,
    });
  } catch (e: any) {
    console.error("[create-invoice] error:", e);
    return NextResponse.json(
      { error: e?.message || "Create invoice failed" },
      { status: 500 }
    );
  }
}
