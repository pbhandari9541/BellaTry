import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LogoutButton from './LogoutButton';
import { AuthContext } from '../../context/AuthContext';
import type { User } from '@supabase/supabase-js';

/**
 * Tests for LogoutButton component.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 */
describe('LogoutButton', () => {
  const mockSignOut = jest.fn();

  const renderWithProvider = (loading = false) => {
    render(
      <AuthContext.Provider value={{
        user: { id: '1', email: 'test@example.com' } as User,
        session: null,
        accessToken: null,
        loading,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: mockSignOut,
        signInWithGoogle: jest.fn(),
      }}>
        <LogoutButton />
      </AuthContext.Provider>
    );
  };

  it('renders logout button', () => {
    renderWithProvider();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls signOut on click', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    renderWithProvider(true);
    const button = screen.getByText(/signing out/i).closest('button');
    expect(button).toBeDisabled();
  });
}); 