// src\app\auth-mp-secure-2024\dashboard\users\new\page.tsx

'use client'

import { useState } from 'react';
import { UserPlus, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth-mp-secure-2024/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Admin user created successfully!');
        setUsername('');
        setPassword('');
        // Optional: redirect after a delay
        setTimeout(() => {
        }, 2000);
      } else {
        setError(data.error || 'Failed to create user.');
      }
    } catch (submitError) {
      console.error('Creation error:', submitError);
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12 lg:py-16 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mt-4 sm:mt-8 lg:mt-12">
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 transition-shadow hover:shadow-2xl">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-charcoal leading-tight">
                Create New Admin User
              </h1>
              <p className="text-sm sm:text-base text-neutral-dark-gray mt-1 sm:mt-2">
                Fill out the form to add a new administrator.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-600 text-sm sm:text-base">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-neutral-charcoal text-sm sm:text-base font-medium">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-neutral-charcoal placeholder-neutral-400 focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-colors text-sm sm:text-base"
                  placeholder="e.g., admin-masterprima"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-neutral-charcoal text-sm sm:text-base font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-neutral-charcoal placeholder-neutral-400 focus:outline-none focus:border-primary-orange focus:ring-1 focus:ring-primary-orange transition-colors text-sm sm:text-base"
                  placeholder="Enter a strong password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full bg-primary-orange hover:bg-primary-orange/90 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Admin User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}