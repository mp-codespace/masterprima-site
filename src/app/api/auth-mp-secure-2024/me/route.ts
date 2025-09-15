/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/auth-mp-secure-2024/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionPayload } from "@/lib/auth/utils";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1) Try your custom cookie first
    const sessionToken = request.cookies.get("admin-session")?.value;
    if (sessionToken) {
      const user = safeVerify(sessionToken);
      if (!user) return noCacheJSON({ error: "Invalid session token" }, 401);
      return await loadAdmin(user.id, "id");
    }

    // 2) Fall back to Supabase session (after OAuth/recovery/callback)
    const supabase = await createServerSupabaseClient();
    const { data: userData, error: suErr } = await supabase.auth.getUser();
    if (suErr || !userData?.user) {
      return noCacheJSON({ error: "No valid authentication found" }, 401);
    }

    // Prefer email lookup (or switch to id if you store supabase uid)
    const email = userData.user.email?.trim();
    if (!email) return noCacheJSON({ error: "No email on Supabase user" }, 401);

    return await loadAdmin(email, "email");
  } catch (error) {
    console.error("Session verification error:", error);
    if (error instanceof SyntaxError) {
      return noCacheJSON({ error: "Invalid session format" }, 401);
    }
    return noCacheJSON({ error: "Session verification failed" }, 500);
  }
}

// --- helpers ---

function safeVerify(token: string) {
  try {
    const user = verifySessionPayload(token);
    if (!user || !user.id || !user.username) return null;
    return user;
  } catch {
    return null;
  }
}

async function loadAdmin(value: string, by: "id" | "email") {
  try {
    const builder = supabaseAdmin
      .from("admin")
      .select("id, username, email, is_admin, created_at, updated_at, auth_provider")
      // ilike for case-insensitive email match; eq for id
      [by === "id" ? "eq" : "ilike"](by, by === "id" ? value : value);

    // When using ilike for email, ensure single result
    const { data: currentUser, error } = await builder.single();

    if (error) {
      console.error("Database error in /me route:", error);
      if ((error as any).code === "PGRST116") {
        return noCacheJSON({ error: "User not found" }, 401);
      }
      return noCacheJSON({ error: "Database error" }, 500);
    }

    if (!currentUser) return noCacheJSON({ error: "User not found" }, 401);
    if (!currentUser.is_admin) {
      return noCacheJSON({ error: "Access denied: Admin privileges required" }, 403);
    }

    return noCacheJSON({
      user: {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        isAdmin: currentUser.is_admin,
        authProvider: currentUser.auth_provider || "email",
        createdAt: currentUser.created_at,
        updatedAt: currentUser.updated_at,
      },
    });
  } catch (dbError) {
    console.error("Database connection error in /me route:", dbError);
    return noCacheJSON({ error: "Database connection failed" }, 503);
  }
}

function noCacheJSON(body: unknown, status = 200) {
  const res = NextResponse.json(body, { status });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

// Only allow GET
export async function POST() {
  return noCacheJSON({ error: "Method not allowed" }, 405);
}
export async function PUT() {
  return noCacheJSON({ error: "Method not allowed" }, 405);
}
export async function DELETE() {
  return noCacheJSON({ error: "Method not allowed" }, 405);
}
