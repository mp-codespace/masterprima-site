// src/app/auth-mp-secure-2024/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Shield,
  DollarSign,
  LogOut,
  Menu,
  ChevronDown,
  Info,
  MessageCircle,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  authProvider: string;
}

const mainNavItems: NavItem[] = [
  { href: '/auth-mp-secure-2024/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/auth-mp-secure-2024/dashboard/articles', label: 'Articles', icon: Newspaper },
  { href: '/auth-mp-secure-2024/dashboard/pricing', label: 'Pricing Plans', icon: DollarSign },
  { href: '/auth-mp-secure-2024/dashboard/transactions', label: 'Transactions', icon: DollarSign },
  { href: '/auth-mp-secure-2024/dashboard/about', label: 'About', icon: Info },
  { href: '/auth-mp-secure-2024/dashboard/testimoni', label: 'Testimoni', icon: MessageCircle },
  { href: '/auth-mp-secure-2024/dashboard/faq', label: 'FAQ', icon: BookOpen }, 
];

const settingsNavItems: NavItem[] = [
  { href: '/auth-mp-secure-2024/dashboard/users', label: 'Users & Roles', icon: Shield },
];

const NavLink = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/auth-mp-secure-2024/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`
        flex items-center text-sm px-3 py-2.5 rounded-md transition-colors duration-200 group
        ${
          isActive
            ? 'bg-secondary-orange-300/20 text-primary-orange font-semibold'
            : 'text-neutral-dark-gray hover:bg-gray-100'
        }
      `}
    >
      <item.icon className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200 ${isActive ? 'text-primary-orange' : 'text-gray-400 group-hover:text-gray-600'}`} />
      <span>{item.label}</span>
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check Supabase session first for Google OAuth users
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!sessionError && session?.user?.email) {
          // This is a Google OAuth user
          const userEmail = session.user.email.toLowerCase();
          
          const { data: adminUser, error: adminError } = await supabase
            .from('admin')
            .select('id, email, username, is_admin, auth_provider')
            .eq('email', userEmail)
            .maybeSingle();

          if (!adminError && adminUser) {
            setUserData({
              id: adminUser.id,
              username: adminUser.username,
              email: adminUser.email,
              isAdmin: adminUser.is_admin,
              authProvider: 'google'
            });
            setIsLoading(false);
            return;
          }
        }

        // Fallback to JWT authentication (email/username login)
        const jwtResponse = await fetch('/api/auth-mp-secure-2024/me', {
          credentials: 'include',
        });

        if (jwtResponse.ok) {
          const { user } = await jwtResponse.json();
          setUserData({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            authProvider: 'email'
          });
          setIsLoading(false);
          return;
        }

        // No valid authentication found
        console.log('No valid authentication found');
        router.push('/auth-mp-secure-2024/login');
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth-mp-secure-2024/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Enhanced logout function
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    console.log('🔄 Starting logout process...');
    console.log('Auth provider:', userData?.authProvider);

    try {
      // Step 1: If using Google OAuth, sign out from Supabase first
      if (userData?.authProvider === 'google') {
        console.log('🔗 Signing out from Supabase...');
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.warn('⚠️ Supabase sign out failed:', error);
          } else {
            console.log('✅ Supabase sign out successful');
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase sign out error:', supabaseError);
        }
      }

      // Step 2: Always call the logout API to clear any server-side session and log activity
      console.log('📡 Calling logout API...');
      try {
        const logoutResponse = await fetch('/api/auth-mp-secure-2024/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (logoutResponse.ok) {
          console.log('✅ Logout API call successful');
        } else {
          console.warn('⚠️ Logout API call failed but continuing...');
        }
      } catch (logoutError) {
        console.warn('⚠️ Logout API error but continuing:', logoutError);
      }

      // Step 3: Clear local state
      console.log('🧹 Clearing local state...');
      setUserData(null);
      setIsUserMenuOpen(false);

      // Step 4: Clear all cookies and storage (additional cleanup)
      try {
        // Clear cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Clear localStorage for Supabase auth
        localStorage.removeItem('sb-jevhoegsqtyczsjacnaf-auth-token');
        sessionStorage.clear();
        console.log('✅ Browser storage cleared');
      } catch (storageError) {
        console.warn('⚠️ Storage clearing error:', storageError);
      }

      // Step 5: Redirect to login page
      console.log('🔄 Redirecting to login...');
      router.push('/auth-mp-secure-2024/login?logout=success');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/auth-mp-secure-2024/login?logout=success';
      }, 500);

    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Force logout even if there are errors
      setUserData(null);
      setIsUserMenuOpen(false);
      
      // Force redirect even on error
      window.location.href = '/auth-mp-secure-2024/login';
    } finally {
      setIsLoggingOut(false);
      console.log('🏁 Logout process completed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <Link href="/auth-mp-secure-2024/dashboard" className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#F97316"/>
            <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-xl font-urbanist text-neutral-charcoal">MasterPrima</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1.5">
        {mainNavItems.map((item) => <NavLink key={item.href} item={item} />)}
        <div className="pt-4 mt-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Settings</p>
          {settingsNavItems.map((item) => <NavLink key={item.href} item={item} />)}
        </div>
      </nav>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary-orange" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login redirect if no user data
  if (!userData) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-100 font-plus-jakarta">
      {/* Desktop Sidebar - Fixed Position */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${!mobileMenuOpen && 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <div className={`relative w-64 bg-white h-full shadow-xl transition-transform ease-in-out duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </div>
      </div>
      
      {/* Main Content Area with offset for the desktop sidebar */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 sticky top-0 z-10">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600">
            <Menu className="h-6 w-6"/>
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isLoggingOut}
              >
                <div className="w-9 h-9 rounded-full bg-secondary-orange-300/30 flex items-center justify-center text-primary-orange font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {userData.username}
                </span>
                <div className="flex flex-col items-start text-xs text-gray-500 hidden sm:block">
                  <span className="capitalize">
                    {userData.authProvider === 'google' ? '🔗 Google' : '📧 Email'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isUserMenuOpen && 'rotate-180'}`} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userData.username}</p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      Via {userData.authProvider === 'google' ? 'Google OAuth' : 'Email/Username'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2"/>
                        Logout
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
