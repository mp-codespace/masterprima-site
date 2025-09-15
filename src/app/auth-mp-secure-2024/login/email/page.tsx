"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  LogIn,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const CompanyLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="20" cy="20" r="20" fill="#F97316" />
    <path
      d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 28H28"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function EmailLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginField, setLoginField] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) setSuccess(message);
  }, [searchParams]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return; // guard double submit

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth-mp-secure-2024/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginField,
          password,
        }),
        credentials: "include",
      });

      const result = (await response.json()) as { error?: string };

      if (response.ok) {
        router.push("/auth-mp-secure-2024/dashboard");
      } else {
        setError(result?.error || "Login failed. Please try again.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-plus-jakarta p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CompanyLogo />
          </div>
          <h1 className="text-3xl font-bold text-neutral-charcoal font-urbanist">
            Email Sign In
          </h1>
          <p className="text-neutral-dark-gray mt-2">
            MasterPrima Admin Portal
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3 mb-6">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="loginField"
                className="text-sm font-medium text-gray-700"
              >
                Email Address or Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="loginField"
                  type="text"
                  value={loginField}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLoginField(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-transparent transition-all"
                  placeholder="Enter your email or username"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Link
                  href="/auth-mp-secure-2024/forgot-password"
                  className="text-sm font-medium text-primary-orange hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  className="w-full pl-12 pr-12 py-3 bg-gray-100 border-2 border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-orange transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary-orange hover:bg-primary-orange/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-neutral-600 disabled:cursor-not-allowed shadow-lg shadow-primary-orange/20 hover:shadow-primary-orange/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link
                href="/auth-mp-secure-2024/login"
                className="inline-flex items-center justify-center gap-2 text-gray-600 hover:text-primary-orange font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to main login</span>
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MasterPrima. All rights reserved.
        </p>
      </div>
    </main>
  );
}

