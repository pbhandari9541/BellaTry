import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '../ui/Button';
import GoogleAuthButton from './GoogleAuthButton';

/**
 * SignupForm component for user registration (email/password).
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 * See also frontend/README.md for usage.
 */
const SignupForm: React.FC = () => {
  const { signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    if (!email || !password) {
      setFormError('Email and password are required.');
      toast({
        title: 'Missing Fields',
        description: 'Email and password are required.',
        variant: 'destructive',
      });
      return;
    }
    await signUp(email, password);
    if (error) {
      toast({
        title: 'Signup Failed',
        description: error,
        variant: 'destructive',
      });
    } else {
      setSuccess(true);
      toast({
        title: 'Check your email',
        description: 'We\'ve sent a confirmation link to your email. Please confirm your account before logging in.',
      });
    }
  };

  const handleGoToLogin = () => {
    // If you have a router, you can use router.push('/login') or similar
    // For now, emit a custom event or call a prop if provided
    window.location.reload(); // fallback: reload to show login modal if needed
  };

  return (
    <>
      {success && !error ? (
        <div className="w-full max-w-sm mx-auto p-4 bg-card-background rounded-lg shadow border border-border flex flex-col items-center">
          <div className="text-success text-lg mb-2">Check your email to confirm your account.</div>
          <div className="text-muted-foreground text-sm mb-4 text-center">
            We've sent a confirmation link to your email. Please confirm your account before logging in.
          </div>
          <Button
            type="button"
            fullWidth
            onClick={handleGoToLogin}
          >
            Back to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-4 bg-card-background rounded-lg shadow border border-border">
          <h2 className="text-xl font-semibold mb-4 text-center text-primary-text">Sign Up</h2>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium text-primary-text">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium text-primary-text">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {(formError || error) && (
            <div className="mb-2 text-destructive text-sm">{formError || error}</div>
          )}
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
      )}
      <div className="my-4 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
      </div>
      <GoogleAuthButton />
    </>
  );
};

export default SignupForm; 