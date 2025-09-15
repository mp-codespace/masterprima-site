// src/app/auth-mp-secure-2024/dashboard/users/add-google-user/page.tsx
'use client'

import { useState } from 'react';
import { UserPlus, Mail, Shield, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddGoogleUserPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !username.trim()) {
      setError('Email and username are required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth-mp-secure-2024/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          is_admin: isAdmin,
          auth_provider: 'google', // This tells the API it's a Google OAuth user
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add Google user');
      }

      setSuccess(`Google OAuth user "${username}" added successfully! They can now log in with their Google account.`);
      setEmail('');
      setUsername('');
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/auth-mp-secure-2024/dashboard/users"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Google OAuth User</h1>
          <p className="text-gray-600">
            Add a user who will authenticate using Google OAuth. No password required.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg flex items-center gap-3 mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Google Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="user@gmail.com"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              This must be the exact email address they use to sign in with Google
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              placeholder="Enter a unique username"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              id="is_admin"
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="is_admin" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4 text-blue-600" />
              Grant admin privileges
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How Google OAuth works:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• User clicks Continue with Google on the login page</li>
              <li>• They authenticate with Google using their email</li>
              <li>• System checks if their email exists in the admin table</li>
              <li>• If found, they get access to the dashboard</li>
              <li>• No password required - Google handles authentication</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/auth-mp-secure-2024/dashboard/users"
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Add Google User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}