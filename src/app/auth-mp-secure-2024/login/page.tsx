// File path: src\app\auth-mp-secure-2024\login\page.tsx
'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff, AlertTriangle, LogIn } from 'lucide-react';

// A simple SVG logo component for branding
const CompanyLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#F97316"/>
      <path d="M15 28V15.5C15 13.567 16.567 12 18.5 12H21.5C23.433 12 25 13.567 25 15.5V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 28H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    fetch('/api/auth-mp-secure-2024/me', {
      credentials: 'include', // Penting agar cookie ikut dikirim
    }).then(res => {
      if (res.ok) {
        router.push('/auth-mp-secure-2024/dashboard');
      }
    });
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth-mp-secure-2024/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Penting agar cookie dari API tersimpan
      });
      const data = await response.json();
      if (response.ok) {
        router.push('/auth-mp-secure-2024/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 font-plus-jakarta p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <CompanyLogo />
            <h1 className="text-3xl font-bold text-neutral-charcoal font-urbanist mt-6">Admin Portal</h1>
            <p className="text-neutral-dark-gray mt-2">MasterPrima Secure Access</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-transparent transition-all"
                            placeholder="Enter your username"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>
            
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 bg-gray-100 border-2 border-transparent rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/50 focus:border-transparent transition-all"
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-orange"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5"/>
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MasterPrima. All rights reserved.
        </p>
      </div>
    </main>
  );
}
