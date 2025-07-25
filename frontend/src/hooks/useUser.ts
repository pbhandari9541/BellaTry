import { useEffect, useState } from 'react';
import { fetchCurrentUser, updateUserProfile, User } from '../api/services/user';

/**
 * useUser hook
 * Fetches the current user and provides update functionality.
 * Handles loading and error states. Ready for future use in components.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentUser();
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser(data: Partial<User>) {
    setError(null);
    try {
      const updated = await updateUserProfile(data);
      setUser(updated);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
  }

  return { user, isLoading, error, updateUser };
} 