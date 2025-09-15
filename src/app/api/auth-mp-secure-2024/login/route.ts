/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword, createSessionPayload } from "@/lib/auth/utils";

// ------------ rate limit -------------
const rlStore = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, max = 10, win = 15 * 60 * 1000) {
  const now = Date.now();
  const cur = rlStore.get(ip);
  if (!cur || now > cur.reset) {
    rlStore.set(ip, { count: 1, reset: now + win });
    return { ok: true, rem: max - 1 };
  }
  if (cur.count >= max) return { ok: false, rem: 0 };
  cur.count++;
  return { ok: true, rem: max - cur.count };
}
const getIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";

// ------------ validation -------------
const schema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

const json = (b: unknown, s = 200, h?: Record<string, string>) => {
  const res = NextResponse.json(b, { status: s, headers: h });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
};

// ------------ activity log (safe) -------------
async function logActivity(data: any) {
  try {
    await supabaseAdmin.from("admin_activity_log").insert({
      admin_id: data.admin_id ?? null,
      action_type: data.action_type,
      table_name: data.table_name ?? "admin",
      record_id: data.record_id ?? null,
      changes: data.changes ?? {},
      ip_address: data.ip_address ?? "unknown",
    });
  } catch (e) {
    console.warn("logActivity (non-critical):", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const rl = rateLimit(ip);
    if (!rl.ok) return json({ error: "Too many login attempts." }, 429, { "Retry-After": "900" });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
    }
    const identifier = parsed.data.username.trim().toLowerCase();
    const password = parsed.data.password;

    // Find admin by email or username
    const base = supabaseAdmin
      .from("admin")
      .select("id, username, email, password, is_admin, created_at, updated_at")
      .limit(1);

    const { data, error } = identifier.includes("@")
      ? await base.ilike("email", identifier)
      : await base.ilike("username", identifier);

    const admin = data?.[0];
    if (error || !admin || !admin.password) {
      await logActivity({
        admin_id: null,
        action_type: "LOGIN_FAILED",
        changes: { reason: "user_not_found", identifier, ts: new Date().toISOString() },
        ip_address: ip,
      });
      return json({ error: "Invalid username/email or password." }, 401, {
        "X-RateLimit-Remaining": String(rl.rem),
      });
    }

    if (!admin.is_admin) {
      return json({ error: "Access denied." }, 403, { "X-RateLimit-Remaining": String(rl.rem) });
    }

    const ok = verifyPassword(password, admin.password); // bcrypt compare
    if (!ok) {
      await logActivity({
        admin_id: admin.id,
        action_type: "LOGIN_FAILED",
        record_id: admin.id,
        changes: { reason: "invalid_password", identifier, ts: new Date().toISOString() },
        ip_address: ip,
      });
      return json({ error: "Invalid username/email or password." }, 401, {
        "X-RateLimit-Remaining": String(rl.rem),
      });
    }

    // Issue your own cookie (no Supabase session needed)
    const token = createSessionPayload({
      id: admin.id,
      username: admin.username,
      email: admin.email ?? undefined,
      is_admin: admin.is_admin,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
    });

    const res = json(
      { message: "Login successful", user: { id: admin.id, username: admin.username, email: admin.email, isAdmin: admin.is_admin } },
      200,
      { "X-RateLimit-Remaining": String(rl.rem) }
    );
    res.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    await logActivity({
      admin_id: admin.id,
      action_type: "LOGIN_SUCCESS",
      record_id: admin.id,
      changes: { identifier, ts: new Date().toISOString() },
      ip_address: ip,
    });

    return res;
  } catch (e) {
    console.error("Login error:", e);
    return json({ error: "Internal server error." }, 500);
  }
}

export async function GET() {
  return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
}
