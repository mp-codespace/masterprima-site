// File path: src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionPayload } from "@/lib/auth/utils";

const AUTH_SECRET_PATH = process.env.AUTH_SECRET_PATH || "auth-mp-secure-2024";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith("/_next/") ||
    (pathname.startsWith("/api/") && !pathname.startsWith(`/api/${AUTH_SECRET_PATH}/`)) ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith(`/${AUTH_SECRET_PATH}/dashboard`)) {
    const sessionToken = request.cookies.get("admin-session")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL(`/${AUTH_SECRET_PATH}/login`, request.url));
    }

    const user = verifySessionPayload(sessionToken);
    if (!user || !user.is_admin) {
      return NextResponse.redirect(new URL(`/${AUTH_SECRET_PATH}/login`, request.url));
    }
  }

  // Redirect root admin path to dashboard
  if (pathname === `/${AUTH_SECRET_PATH}`) {
    return NextResponse.redirect(new URL(`/${AUTH_SECRET_PATH}/dashboard`, request.url));
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src * data: blob:;"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
