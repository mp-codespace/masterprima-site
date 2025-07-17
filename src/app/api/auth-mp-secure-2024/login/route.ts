// File path: src/app/api/auth-mp-secure-2024/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyPassword, createSessionPayload } from "@/lib/auth/utils";

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // === DEBUG LOG: Input
    console.log("\n[LOGIN DEBUG] =========");
    console.log("Username:", username);
    console.log("Password (plain):", password);

    if (!username || !password) {
      console.log("Missing username or password");
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("admin")
      .select("*")
      .eq("username", username)
      .single();

    // === DEBUG LOG: Supabase Query
    console.log("Supabase user:", user);
    console.log("Supabase error:", error);

    if (error || !user) {
      console.log("User not found or query error");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // === DEBUG LOG: Password in DB
    console.log("Password in DB:", user.password);

    const isValidPassword = verifyPassword(password, user.password);

    // === DEBUG LOG: Password Verification
    console.log("verifyPassword result:", isValidPassword);

    if (!isValidPassword) {
      console.log("Password mismatch");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const sessionToken = createSessionPayload({
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    const clientIP = getClientIP(request);

    await supabaseAdmin.from("admin_activity_log").insert({
      admin_id: user.id,
      action_type: "LOGIN",
      ip_address: clientIP,
    });

    // === DEBUG LOG: Session Token Generated
    console.log("Session Token:", sessionToken);
    console.log("[LOGIN SUCCESS] ==============\n");

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          is_admin: user.is_admin,
        },
      },
      { status: 200 }
    );

    response.cookies.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
