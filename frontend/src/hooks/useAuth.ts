import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth is a custom hook to access authentication state and actions.
 * See planning in PLANNING.md (Phase 5, Iteration 1).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 