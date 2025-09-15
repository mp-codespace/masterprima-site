// src/app/auth/callback/route.ts
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Supabase may send any of these depending on the flow
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type"); // "recovery" | "magiclink" | "invite" | "email_change" | ...
  const providedNext = url.searchParams.get("next");
  const oauthErr = url.searchParams.get("error");
  const oauthErrDesc = url.searchParams.get("error_description");

  // Default landing if `next` is not provided
  const defaultNext =
    type === "recovery"
      ? "/auth-mp-secure-2024/reset-password"
      : "/auth-mp-secure-2024/dashboard";

  // Sanitize `next` to same-origin path only
  const nextParam = providedNext || defaultNext;
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/auth-mp-secure-2024/dashboard";

  // If the provider returned an error, surface a generic message and bail
  if (oauthErr) {
    return noCache(
      NextResponse.redirect(
        new URL(
          `${next}?message=${encodeURIComponent(
            oauthErrDesc || "Authentication was cancelled or failed."
          )}`,
          url.origin
        ),
        { status: 303 }
      )
    );
  }

  try {
    const supabase = await createServerSupabaseClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return noCache(
          NextResponse.redirect(
            new URL(`${next}?message=Sign-in failed. Please try again.`, url.origin),
            { status: 303 }
          )
        );
      }
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "recovery" | "magiclink" | "invite" | "email_change",
      });
      if (error) {
        return noCache(
          NextResponse.redirect(
            new URL(`${next}?message=Verification failed. Please try again.`, url.origin),
            { status: 303 }
          )
        );
      }
    } else {
      // No token provided; just continue to a safe landing
      return noCache(
        NextResponse.redirect(new URL(defaultNext, url.origin), { status: 303 })
      );
    }
  } catch (e) {
    console.error("Auth callback error:", e);
    return noCache(
      NextResponse.redirect(
        new URL(`${defaultNext}?message=Authentication error. Please try again.`, url.origin),
        { status: 303 }
      )
    );
  }

  return noCache(NextResponse.redirect(new URL(next, url.origin), { status: 303 }));
}

function noCache(resp: NextResponse) {
  resp.headers.set("Cache-Control", "no-store, max-age=0");
  resp.headers.set("X-Robots-Tag", "noindex, nofollow");
  return resp;
}
