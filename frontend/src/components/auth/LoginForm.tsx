import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ForgotPasswordModal from './ForgotPasswordModal';
import { toast } from '@/hooks/use-toast';
import { Button } from '../ui/Button';
import GoogleAuthButton from './GoogleAuthButton';

/**
 * LoginForm component for user email/password login.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 * See also frontend/README.md for usage.
 */
const LoginForm: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Email and password are required.');
      toast({
        title: 'Missing Fields',
        description: 'Email and password are required.',
        variant: 'destructive',
      });
      return;
    }
    await signIn(email, password);
    if (error) {
      toast({
        title: 'Login Failed',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have logged in successfully.',
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-4 bg-card-background rounded-lg shadow border border-border">
        <h2 className="text-xl font-semibold mb-4 text-center text-primary-text">Sign In</h2>
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
            autoComplete="current-password"
            required
          />
        </div>
        {/* Forgot Password Link */}
        <div className="mb-4 text-right">
          <Button
            type="button"
            variant="link"
            className="text-primary hover:text-primary-hover text-sm"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </Button>
        </div>
        {(formError || error) && (
          <div className="mb-2 text-destructive text-sm">{formError || error}</div>
        )}
        <Button
          data-testid="login-submit"
          type="submit"
          fullWidth
          isLoading={loading}
          disabled={loading || !email || !password}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="my-4 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
      </div>
      <GoogleAuthButton />
      {/* Render modal OUTSIDE the form */}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </>
  );
};

export default LoginForm; 