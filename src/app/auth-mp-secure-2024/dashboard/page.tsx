/* eslint-disable @typescript-eslint/no-explicit-any */
// File path: src/app/auth-mp-secure-2024/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LogOut, User, Shield, Clock, Activity, Loader2, AlertCircle, FileText, DollarSign, Settings } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  username: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
  authProvider: 'email' | 'google'
}

interface ActivityLog {
  id: string
  action_type: string
  created_at: string
  changes?: any
  ip_address?: string
  details?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [authMethod, setAuthMethod] = useState<'jwt' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Safe activity loading using the API endpoint
  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/auth-mp-secure-2024/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const activities = await response.json();
        setRecentActivity(Array.isArray(activities) ? activities.slice(0, 10) : []);
      } else {
        console.warn('Failed to load recent activity (non-critical)');
        setRecentActivity([]);
      }
    } catch (err) {
      console.warn('Failed to load activity (non-critical):', err);
      setRecentActivity([]);
    }
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // Prevent auth check if a logout is already in progress
      if (isSigningOut) return;

      setIsLoading(true)
      setError(null)
      
      try {
        // ---------- 1) Try JWT authentication first (email/password) ----------
        const meRes = await fetch('/api/auth-mp-secure-2024/me', {
          credentials: 'include',
        })

        if (meRes.ok) {
          const { user: u } = await meRes.json()
          setAuthMethod('jwt')
          setUser({
            id: u.id,
            email: u.email || '',
            username: u.username,
            isAdmin: u.isAdmin,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            authProvider: u.authProvider || 'email',
          })
          await loadRecentActivity()
          return
        }

        // ---------- 2) Fallback to Supabase OAuth (Google) ----------
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Supabase session error:', sessionError)
          throw new Error('Failed to get session')
        }

        if (session?.user) {
          setAuthMethod('google')
          setSupabaseUser(session.user)

          // Normalize email for lookup
          const userEmail = (session.user.email || '').toLowerCase()
          if (!userEmail) {
            throw new Error('No email found in Google account')
          }

          const { data: adminUser, error: adminError } = await supabase
            .from('admin')
            .select('id, email, username, is_admin, created_at, updated_at, auth_provider')
            .eq('email', userEmail)
            .maybeSingle()

          if (adminError) {
            console.error('Admin user lookup error:', adminError)
            throw new Error('Failed to verify admin access')
          }

          if (!adminUser) {
            throw new Error('Your Google account is not authorized for admin access')
          }

          setUser({
            id: adminUser.id,
            email: adminUser.email || userEmail,
            username: adminUser.username,
            isAdmin: adminUser.is_admin,
            createdAt: adminUser.created_at,
            updatedAt: adminUser.updated_at,
            authProvider: adminUser.auth_provider || 'google',
          })
          await loadRecentActivity()
          return
        }

        // Neither JWT nor Supabase session found
        throw new Error('No valid authentication found')

      } catch (error) {
        console.error('Authentication error:', error)
        setError((error as Error).message)
        // Redirect to login after a brief delay to show the error
        setTimeout(() => {
          router.push('/auth-mp-secure-2024/login')
        }, 2000)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadData()

    // Subscribe to Supabase auth changes ONLY if using Google OAuth
    let subscription: any
    if (authMethod === 'google') {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth-mp-secure-2024/login')
        }
      })
      subscription = sub
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router, authMethod, isSigningOut])

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    console.log('🔄 Starting logout process...');
    console.log('Auth method:', authMethod);

    try {
      // Step 1: If using Google OAuth, sign out from Supabase first
      if (authMethod === 'google') {
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
      setUser(null);
      setSupabaseUser(null);
      setAuthMethod(null);
      setRecentActivity([]);

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
      console.error('❌ Error during sign out:', error);
      
      // Force clear local state even on error
      setUser(null);
      setSupabaseUser(null);
      setAuthMethod(null);
      setRecentActivity([]);
      
      // Force redirect even on error
      window.location.href = '/auth-mp-secure-2024/login';
    } finally {
      // We don't set isSigningOut back to false because the component will be unmounted.
      console.log('🏁 Logout process completed');
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'LOGIN_SUCCESS':
      case 'GOOGLE_AUTH_SUCCESS':
        return '🟢'
      case 'LOGIN_FAILED':
      case 'GOOGLE_AUTH_FAILED':
        return '🔴'
      case 'LOGOUT':
        return '🟡'
      case 'CREATE_ADMIN':
        return '👤'
      case 'DELETE_ADMIN':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getActivityLabel = (actionType: string) => {
    switch (actionType) {
      case 'LOGIN_SUCCESS':
        return 'Successful Login'
      case 'GOOGLE_AUTH_SUCCESS':
        return 'Google Login Success'
      case 'LOGIN_FAILED':
        return 'Failed Login'
      case 'GOOGLE_AUTH_FAILED':
        return 'Google Login Failed'
      case 'LOGOUT':
        return 'Logout'
      case 'CREATE_ADMIN':
        return 'Created Admin'
      case 'DELETE_ADMIN':
        return 'Deleted Admin'
      default:
        return actionType.replace(/_/g, ' ')
    }
  }

  const getAvatarUrl = () => {
    if (supabaseUser?.user_metadata?.avatar_url) {
      return supabaseUser.user_metadata.avatar_url
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=f97316&color=fff`
  }

  const getDisplayName = () => {
    if (supabaseUser?.user_metadata?.full_name) {
      return supabaseUser.user_metadata.full_name
    }
    return user?.username || 'User'
  }

  // Quick action items
  const quickActions = [
    {
      title: 'Manage Users',
      icon: User,
      href: '/auth-mp-secure-2024/dashboard/users',
      description: 'Add, edit, or remove admin users',
      color: 'blue'
    },
    {
      title: 'Manage Articles',
      icon: FileText,
      href: '/auth-mp-secure-2024/dashboard/articles',
      description: 'Create and edit blog articles',
      color: 'green'
    },
    {
      title: 'Manage Pricing',
      icon: DollarSign,
      href: '/auth-mp-secure-2024/dashboard/pricing',
      description: 'Configure pricing plans',
      color: 'purple'
    },
    {
      title: 'Site Settings',
      icon: Settings,
      href: '/auth-mp-secure-2024/dashboard/about',
      description: 'Configure site information',
      color: 'orange'
    }
  ];

  const getActionColorClasses = (color: string) => {
    const colors = {
      blue: 'hover:border-blue-500 hover:bg-blue-50 group-hover:text-blue-600',
      green: 'hover:border-green-500 hover:bg-green-50 group-hover:text-green-600',
      purple: 'hover:border-purple-500 hover:bg-purple-50 group-hover:text-purple-600',
      orange: 'hover:border-orange-500 hover:bg-orange-50 group-hover:text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'text-gray-400 group-hover:text-blue-500',
      green: 'text-gray-400 group-hover:text-green-500',
      purple: 'text-gray-400 group-hover:text-purple-500',
      orange: 'text-gray-400 group-hover:text-orange-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // No user data (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">MasterPrima Admin</h1>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getAvatarUrl()} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-gray-200" 
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {user.authProvider === 'google' ? (
                      <>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </>
                    ) : (
                      <>📧 Email</>
                    )}
                  </div>
                </div>
                {user.isAdmin && (
                  <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin sm:mr-2" />
                    <span className="hidden sm:inline">Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getDisplayName()}!
          </h2>
          <p className="text-gray-600">Access your MasterPrima admin dashboard</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          
          {/* User Profile Card */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getAvatarUrl()} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-4 border-gray-100" 
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{getDisplayName()}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isAdmin 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isAdmin ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </>
                    ) : (
                      'User'
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Auth Method</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    {user.authProvider === 'google' ? (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google OAuth
                      </>
                    ) : (
                      <>📧 Email/Username</>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Member since</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Last updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
              </div>

              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 text-lg pt-0.5">
                          {getActivityIcon(activity.action_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {getActivityLabel(activity.action_type)}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(activity.created_at)}
                            </div>
                          </div>
                          {activity.details && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activity.details}</p>
                          )}
                          {activity.ip_address && (
                            <p className="text-xs text-gray-500 mt-1">IP: {activity.ip_address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {user.isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.href}
                    onClick={() => router.push(action.href)}
                    className={`p-6 border border-gray-200 rounded-lg transition-all duration-200 text-left group ${getActionColorClasses(action.color)}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className={`w-6 h-6 transition-colors ${getIconColorClasses(action.color)}`} />
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-current transition-colors">
                        {action.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-current transition-colors">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-green-700 font-semibold text-lg">Online</div>
              <div className="text-sm text-green-600">System Status</div>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {authMethod === 'google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ) : (
                  <Shield className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="text-blue-700 font-semibold text-lg">
                {authMethod === 'google' ? 'Google OAuth' : 'JWT'}
              </div>
              <div className="text-sm text-blue-600">Auth Method</div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-purple-700 font-semibold text-lg">Admin</div>
              <div className="text-sm text-purple-600">Access Level</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}