// File path: src/app/auth-mp-secure-2024/login/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Mail, Loader2, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

// --- UI Components ---
const CompanyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#F97316" />
    <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Client-only render (avoids hydration mismatch)
  useEffect(() => {
    setIsClient(true);
    // The middleware now handles redirecting already-logged-in users.
    setIsCheckingAuth(false);
  }, []);

  // Show success message if redirected from registration or logout
  useEffect(() => {
    if (!isClient) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
      setSuccessMessage('Registration successful! Please log in with your Google account.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('logout') === 'success') {
      setSuccessMessage('You have been successfully logged out.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isClient]);

  // Server authorization function
  const authorizeWithServer = useCallback(async (email: string, access_token?: string | null) => {
    try {
      const res = await fetch('/api/auth-mp-secure-2024/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          googleSession: { access_token: access_token ?? 'present' },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error || 'Access denied. Your account is not authorized for this portal.';
        setError(msg);
        await supabase.auth.signOut();
        return false;
      }

      return true;
    } catch (e) {
      console.error('Server authorization error:', e);
      setError('Authorization check failed. Please try again.');
      await supabase.auth.signOut();
      return false;
    }
  }, []);

  // Listen for auth state changes for Google Login
  useEffect(() => {
    if (!isClient) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        setIsLoading(true);
        const ok = await authorizeWithServer(session.user.email, session.access_token);
        if (ok) {
          router.push('/auth-mp-secure-2024/dashboard');
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setError('');
        setSuccessMessage('');
      }
    });

    return () => subscription.unsubscribe();
  }, [isClient, router, authorizeWithServer]);

  const handleGoogleLogin = async () => {
    if (!isClient) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-mp-secure-2024/login`,
          queryParams: { 
            access_type: 'offline', 
            prompt: 'consent' 
          },
        },
      });
      
      if (error) {
        console.error('Google auth error:', error);
        setError('Failed to initiate Google sign-in. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    router.push('/auth-mp-secure-2024/login/email');
  };

  // Show loading state while checking authentication
  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary-orange" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-plus-jakarta p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CompanyLogo />
          </div>
          <h1 className="text-3xl font-bold text-neutral-charcoal font-urbanist">Admin Portal</h1>
          <p className="text-neutral-dark-gray mt-2">MasterPrima Secure Access</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Access Denied</div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Success</div>
                  <div className="text-sm mt-1">{successMessage}</div>
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-300 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-400 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleLogo />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Email Login Button */}
            <div>
              <button
                onClick={handleEmailLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5" />
                <span>Sign in with Email/Username</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Authorized Access Only
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Access is restricted to authorized MasterPrima team members only. You can sign in with
                      Google or your registered email/username.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Help */}
            {error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Make sure your Google account is authorized by an administrator</p>
                  <p>• For email/username login, use your registered credentials</p>
                  <p>• Contact your system administrator if you continue having issues</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MasterPrima. All rights reserved.
        </p>
      </div>
    </main>
  );
}
