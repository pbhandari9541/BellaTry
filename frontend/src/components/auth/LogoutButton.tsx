import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

/**
 * LogoutButton component for user sign out.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 * See also frontend/README.md for usage.
 */
const LogoutButton: React.FC = () => {
  const { signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Button
      type="button"
      onClick={handleLogout}
      isLoading={loading}
      fullWidth
      aria-label="Sign out"
      className="bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
};

export default LogoutButton; 