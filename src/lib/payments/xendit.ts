/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/payments/xendit.ts

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!XENDIT_SECRET_KEY) {
  throw new Error("XENDIT_SECRET_KEY is required");
}

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty?: number;
};

export type Customer = {
  email?: string;
  given_names?: string;
  mobile_number?: string;
};

export type CreateInvoiceResponse = {
  id: string;
  external_id: string;
  amount: number;
  status: "PENDING" | "PAID" | "SETTLED" | "EXPIRED" | "FAILED";
  invoice_url: string;
  [k: string]: any;
};

export function sumAmount(items: CartItem[]) {
  return items.reduce((s, it) => s + it.price * (it.qty ?? 1), 0);
}

// Random string aman di client/edge/node (pakai WebCrypto jika ada, fallback ke Math.random)
function randomString(len = 8) {
  const g = globalThis as any;
  if (g.crypto?.getRandomValues) {
    const bytes = new Uint8Array(len);
    g.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2, 2 + len);
}

export async function createInvoice(
  items: CartItem[],
  customer?: Customer
): Promise<CreateInvoiceResponse> {
  const amount = sumAmount(items);
  const external_id = `INV-${Date.now()}-${randomString(8)}`;

  const body = {
    external_id,
    amount,
    currency: "IDR",
    description: items.map((i) => `${i.name} x${i.qty ?? 1}`).join(", "),
    customer: customer ?? undefined,
    // penting: metadata agar terikut ke webhook
    metadata: { items, customer },
    // Opsi A: tetap /checkout/success
    success_redirect_url: `${SITE_URL}/checkout/success?eid=${external_id}`,
    failure_redirect_url: `${SITE_URL}/checkout/failed?eid=${external_id}`,
  };

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${XENDIT_SECRET_KEY}:`).toString("base64"),
      "Idempotency-Key": external_id, // cegah double invoice
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Xendit error: ${res.status} ${errTxt}`);
  }

  return (await res.json()) as CreateInvoiceResponse;
}
