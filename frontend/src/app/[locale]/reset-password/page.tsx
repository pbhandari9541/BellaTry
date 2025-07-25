"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const ResetPasswordPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Extract tokens from URL (hash fragment or query param)
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access = params.get('access_token') || searchParams.get('access_token');
    const refresh = params.get('refresh_token') || searchParams.get('refresh_token');
    setAccessToken(access);
    setRefreshToken(refresh);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!password || password !== confirm) {
      setError('Passwords do not match.');
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (!accessToken || !refreshToken) {
      setError('Invalid or missing token. Please use the link from your email.');
      toast({
        title: 'Invalid Token',
        description: 'Invalid or missing token. Please use the link from your email.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (sessionError) {
      setError(sessionError.message);
      setLoading(false);
      toast({
        title: 'Session Error',
        description: sessionError.message,
        variant: 'destructive',
      });
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      toast({
        title: 'Reset Failed',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      setSuccess(true);
      toast({
        title: 'Password Reset',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card-background rounded-lg shadow p-6 w-full max-w-sm border border-border">
        <h2 className="text-xl font-semibold mb-4 text-center text-primary-text">Reset Your Password</h2>
        {success ? (
          <div className="text-success text-center mb-4">Your password has been reset. You can now log in with your new password.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password" className="block mb-2 font-medium text-primary-text">New Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground mb-4"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="confirm" className="block mb-2 font-medium text-primary-text">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground mb-4"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
            {error && <div className="mb-2 text-destructive text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 