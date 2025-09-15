// src/app/auth-mp-secure-2024/forgot-password/page.tsx

import Link from "next/link";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const CompanyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#F97316" />
    <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function ForgotPassword({
  // Next 15: searchParams is a Promise
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const message = Array.isArray(sp?.message) ? sp!.message[0] : sp?.message ?? "";

  // Create server client (awaits cookies() internally)
  const supabase = await createServerSupabaseClient();

  // Optional: keep signed-in users out of this page
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) redirect("/auth-mp-secure-2024/dashboard");

  // Server Action to send the reset email
  const requestReset = async (formData: FormData) => {
    "use server";

    const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!email) {
      redirect("/auth-mp-secure-2024/forgot-password?message=Please enter your email.");
    }

    // Recreate client inside the action
    const s = await createServerSupabaseClient();

    // Include `next` so callback redirects to the reset page after exchanging the token
    const next = "/auth-mp-secure-2024/reset-password";
    const { error } = await s.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    });

    // Enumeration-safe: always redirect with a generic message
    if (error) {
      console.error("Password Reset Error:", error.message);
    }

    redirect(
      "/auth-mp-secure-2024/forgot-password?message=Password reset link has been sent to your email address if it exists in our system."
    );
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-plus-jakarta p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CompanyLogo />
          </div>
          <h1 className="text-3xl font-bold text-neutral-charcoal font-urbanist">Reset Password</h1>
          <p className="text-neutral-dark-gray mt-2">Enter your email to receive a reset link.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground" action={requestReset} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange/50"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary-orange/20">
              Send Reset Link
            </button>

            {message && (
              <p className="mt-4 p-4 bg-green-100 text-green-800 text-center text-sm rounded-lg">
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
