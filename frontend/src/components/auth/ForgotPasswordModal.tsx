import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/Button';

interface ForgotPasswordModalProps {
  onClose: () => void;
  locale?: string; // Optional, in case you want to support locales
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, locale }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    // Build the redirectTo URL for the reset-password page
    let redirectTo = `${window.location.origin}/reset-password`;
    if (locale) {
      redirectTo = `${window.location.origin}/${locale}/reset-password`;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-80 z-50">
      <div className="bg-card-background rounded-lg shadow p-6 w-full max-w-sm relative border border-border">
        <Button
          className="absolute top-2 right-2 text-muted-foreground hover:text-primary"
          onClick={onClose}
          type="button"
          variant="link"
        >
          &times;
        </Button>
        <h2 className="text-lg font-semibold mb-4 text-center text-primary-text">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email" className="block mb-2 font-medium text-primary-text">Email</label>
          <input
            id="reset-email"
            type="email"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 bg-background text-foreground placeholder:text-muted-foreground"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div className="mb-2 text-destructive text-sm">{error}</div>}
          {success && <div className="mb-2 text-success text-sm">If an account exists for this email, a reset link has been sent.</div>}
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 