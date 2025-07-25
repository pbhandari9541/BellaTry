import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

/**
 * GoogleAuthButton component for Google OAuth sign in/up.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 * See also frontend/README.md for usage.
 */
const GoogleAuthButton: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      fullWidth
      isLoading={loading}
      aria-label="Sign in with Google"
      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_40)">
          <path d="M47.5 24.5C47.5 22.8 47.3 21.2 47 19.7H24V28.3H37.2C36.7 31.1 34.9 33.4 32.3 34.9V40.1H40C44.1 36.3 47.5 30.9 47.5 24.5Z" fill="#4285F4"/>
          <path d="M24 48C30.5 48 35.9 45.9 40 40.1L32.3 34.9C30.3 36.2 27.7 37 24 37C18.7 37 14.1 33.4 12.5 28.7H4.5V34C8.6 41.1 15.7 48 24 48Z" fill="#34A853"/>
          <path d="M12.5 28.7C12.1 27.4 12 26.1 12 24.7C12 23.3 12.1 22 12.5 20.7V15.4H4.5C2.6 18.7 1.5 22.2 1.5 24.7C1.5 27.2 2.6 30.7 4.5 34L12.5 28.7Z" fill="#FBBC05"/>
          <path d="M24 12.3C27.1 12.3 29.7 13.4 31.6 15.2L39.1 8.1C35.9 5.1 30.5 1.5 24 1.5C15.7 1.5 8.6 8.4 4.5 15.4L12.5 20.7C14.1 16 18.7 12.3 24 12.3Z" fill="#EA4335"/>
        </g>
        <defs>
          <clipPath id="clip0_17_40">
            <rect width="48" height="48" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </Button>
  );
};

export default GoogleAuthButton; 