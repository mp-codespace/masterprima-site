/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payments/xendit/get-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeStatus(s: string) {
  const x = (s || "").toUpperCase();
  if (x === "SETTLED" || x === "PAID") return "PAID";
  if (x === "EXPIRED") return "EXPIRED";
  if (x === "FAILED") return "FAILED";
  return "PENDING";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const externalId = url.searchParams.get("external_id");

  if (!id && !externalId) {
    return NextResponse.json(
      { error: "Provide either id or external_id" },
      { status: 400 }
    );
  }

  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "XENDIT_SECRET_KEY is not set" },
      { status: 500 }
    );
  }

  try {
    // Bangun endpoint menurut parameter
    const endpoint = id
      ? `https://api.xendit.co/v2/invoices/${encodeURIComponent(id)}`
      : `https://api.xendit.co/v2/invoices?external_id=${encodeURIComponent(
          externalId as string
        )}`;

    const res = await fetch(endpoint, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${key}:`).toString("base64"),
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json(
        { error: `Xendit ${res.status}: ${t}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const invoice = id ? data : (Array.isArray(data) ? data[0] : null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const normalized_status = normalizeStatus(invoice.status);
    const is_paid = normalized_status === "PAID";

    return NextResponse.json({ ...invoice, normalized_status, is_paid });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
