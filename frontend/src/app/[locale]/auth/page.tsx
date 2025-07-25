"use client";

import React, { useState, useEffect } from 'react';
import LoginForm from '../../../components/auth/LoginForm';
import SignupForm from '../../../components/auth/SignupForm';
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';
import { AuthProvider, useAuthContext } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Authentication page for user login and signup.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 * See also frontend/README.md for usage.
 */
const AuthPageContent: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard'); // Redirect to dashboard or main app page
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded shadow-md">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-primary mb-2">BellaTry</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Virtual Makeup Try-On & MUA Dashboard</p>
        </div>
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 font-semibold rounded-l ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-r ${mode === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        {mode === 'login' ? <LoginForm /> : <SignupForm />}
        <div className="my-4 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
        </div>
        <GoogleAuthButton />
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => (
  <AuthProvider>
    <AuthPageContent />
  </AuthProvider>
);

export default AuthPage; 