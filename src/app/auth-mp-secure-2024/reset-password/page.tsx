// src/app/auth-mp-secure-2024/reset-password/page.tsx
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/auth/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

// (optional) avoid caching while you’re testing this flow
export const dynamic = "force-dynamic";

// Re-usable Logo Component for branding consistency
const CompanyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#F97316" />
    <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default async function ResetPassword({
  // Next.js 15: searchParams is a Promise in Server Components
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ✅ Await once, then use locals only
  const sp = await searchParams;

  const msgRaw = sp?.message;
  const message = Array.isArray(msgRaw) ? msgRaw[0] : msgRaw ?? "";

  // Supabase may send either `?code=...` OR `?token_hash=...&type=recovery`
  const code = Array.isArray(sp?.code) ? sp?.code[0] : sp?.code;
  const token_hash = Array.isArray(sp?.token_hash) ? sp?.token_hash[0] : sp?.token_hash;
  const type = (Array.isArray(sp?.type) ? sp?.type[0] : sp?.type) as
    | "magiclink" | "recovery" | "invite" | "email_change" | undefined;

  // All Supabase/Auth + DB work happens in the server action
  const resetPassword = async (formData: FormData) => {
    "use server";

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    // Basic validations
    if (!password || !confirmPassword) {
      redirect("/auth-mp-secure-2024/reset-password?message=Password is required.");
    }
    if (password !== confirmPassword) {
      redirect("/auth-mp-secure-2024/reset-password?message=Passwords do not match");
    }
    if (password.length < 8) {
      redirect("/auth-mp-secure-2024/reset-password?message=Password must be at least 8 characters.");
    }

    // ✅ createClient is async on Next 15; ALWAYS await it
    const supabase = await createClient();

    // Establish a short session from the email link (so we can read the email)
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        redirect("/auth-mp-secure-2024/reset-password?message=Unable to reset password. The link may have expired.");
      }
    } else if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (error) {
        redirect("/auth-mp-secure-2024/reset-password?message=Unable to verify reset link. The link may have expired.");
      }
    }

    // Read the email associated with the link
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user?.email) {
      redirect("/auth-mp-secure-2024/reset-password?message=Reset link is invalid or expired.");
    }
    const email = userData.user.email.toLowerCase();

    // Hash the password and update YOUR admin table (source of truth)
    const hashed = await hashPassword(password);
    const { error: updErr, data: updRow } = await supabaseAdmin
      .from("admin")
      .update({ password: hashed, auth_provider: "email", updated_at: new Date().toISOString() })
      .ilike("email", email)
      .select("id")
      .maybeSingle();

    if (updErr) {
      console.error("Admin password update failed:", updErr);
      redirect("/auth-mp-secure-2024/reset-password?message=Unable to reset password. Please try again.");
    }
    if (!updRow) {
      // Email not in admin table → not allowed for this portal
      redirect("/auth-mp-secure-2024/reset-password?message=This email is not allowed to access the admin portal.");
    }

    // Optional: end the short Supabase session created by the callback
    try { await supabase.auth.signOut(); } catch {}

    redirect("/auth-mp-secure-2024/login/email?message=Your password has been reset successfully. Please sign in.");
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-plus-jakarta p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CompanyLogo />
          </div>
          <h1 className="text-3xl font-bold text-neutral-charcoal font-urbanist">Set New Password</h1>
          <p className="text-neutral-dark-gray mt-2">Create a new, secure password for your account.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <form
            className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground"
            action={resetPassword}
            noValidate
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-orange/20">
              Reset Password
            </button>

            {message && (
              <p className="mt-4 p-4 bg-red-100 text-red-800 text-center text-sm rounded-lg">
                {message}
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/auth-mp-secure-2024/login"
              className="inline-flex items-center justify-center gap-2 text-gray-600 hover:text-primary-orange font-medium transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
