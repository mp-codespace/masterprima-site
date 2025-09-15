/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/auth/client-utils.ts
import { supabase } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  authProvider: 'email' | 'google';
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// Enhanced logout function that works for both auth methods
export async function performLogout(): Promise<void> {
  console.log('🔄 Starting enhanced logout process...');
  
  try {
    // Step 1: Call logout API to clear JWT session
    console.log('📡 Clearing JWT session...');
    try {
      const logoutResponse = await fetch('/api/auth-mp-secure-2024/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (logoutResponse.ok) {
        console.log('✅ JWT session cleared successfully');
      } else {
        console.warn('⚠️ JWT logout failed but continuing...');
      }
    } catch (logoutError) {
      console.warn('⚠️ JWT logout error but continuing:', logoutError);
    }

    // Step 2: Clear Supabase session (for Google OAuth users)
    console.log('🔗 Clearing Supabase session...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('⚠️ Supabase signout failed:', error);
      } else {
        console.log('✅ Supabase session cleared successfully');
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase signout error:', supabaseError);
    }

    // Step 3: Clear all cookies manually (additional cleanup)
    console.log('🧹 Clearing browser cookies...');
    try {
      // Clear all cookies for this domain
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ Browser cookies cleared');
    } catch (cookieError) {
      console.warn('⚠️ Cookie clearing error:', cookieError);
    }

    // Step 4: Clear localStorage/sessionStorage if any auth data is stored there
    console.log('💾 Clearing browser storage...');
    try {
      localStorage.removeItem('admin-session');
      localStorage.removeItem('sb-jevhoegsqtyczsjacnaf-auth-token'); // Supabase token
      sessionStorage.clear();
      console.log('✅ Browser storage cleared');
    } catch (storageError) {
      console.warn('⚠️ Storage clearing error:', storageError);
    }

    console.log('✅ Enhanced logout completed successfully');
  } catch (error) {
    console.error('❌ Error during enhanced logout:', error);
    // Even if there are errors, we'll still redirect
  }
}

// Check current authentication state
export async function checkAuthState(): Promise<AuthState> {
  try {
    // First try JWT authentication
    const jwtResponse = await fetch('/api/auth-mp-secure-2024/me', {
      credentials: 'include',
    });

    if (jwtResponse.ok) {
      const { user } = await jwtResponse.json();
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          authProvider: 'email',
        },
        isLoading: false,
        error: null,
      };
    }

    // Fallback to Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Supabase session error: ${error.message}`);
    }

    if (session?.user?.email) {
      // Verify admin access
      const userEmail = session.user.email.toLowerCase();
      const { data: adminUser, error: adminError } = await supabase
        .from('admin')
        .select('id, username, email, is_admin')
        .eq('email', userEmail)
        .maybeSingle();

      if (adminError || !adminUser) {
        throw new Error('Your Google account is not authorized for admin access');
      }

      return {
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          isAdmin: adminUser.is_admin,
          authProvider: 'google',
        },
        isLoading: false,
        error: null,
      };
    }

    // No authentication found
    return {
      user: null,
      isLoading: false,
      error: null,
    };

  } catch (error) {
    return {
      user: null,
      isLoading: false,
      error: (error as Error).message,
    };
  }
}

// Handle Google OAuth login
export async function handleGoogleLogin(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 Initiating Google OAuth login...');
    
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
      console.error('❌ Google OAuth error:', error);
      return {
        success: false,
        error: 'Failed to initiate Google sign-in. Please try again.',
      };
    }

    console.log('✅ Google OAuth initiated successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Google login error:', error);
    return {
      success: false,
      error: 'A network error occurred. Please try again.',
    };
  }
}

// Utility function to redirect to login with logout success message
export function redirectToLogin(withLogoutMessage = false): void {
  const url = new URL('/auth-mp-secure-2024/login', window.location.origin);
  if (withLogoutMessage) {
    url.searchParams.set('logout', 'success');
  }
  window.location.href = url.toString();
}

// Utility function to redirect to dashboard
export function redirectToDashboard(): void {
  window.location.href = '/auth-mp-secure-2024/dashboard';
}

// Enhanced error handler for auth-related errors
export function handleAuthError(error: any): string {
  console.error('Auth error:', error);
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Handle specific error types
    if (error.message.includes('not authorized')) {
      return 'Your account is not authorized for admin access. Please contact an administrator.';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('session') || error.message.includes('token')) {
      return 'Your session has expired. Please log in again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}