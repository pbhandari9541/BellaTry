import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GoogleAuthButton from './GoogleAuthButton';
import { AuthContext } from '../../context/AuthContext';

/**
 * Tests for GoogleAuthButton component.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 */
describe('GoogleAuthButton', () => {
  const mockSignInWithGoogle = jest.fn();

  const renderWithProvider = (loading = false) => {
    render(
      <AuthContext.Provider value={{
        user: null,
        session: null,
        accessToken: null,
        loading,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: mockSignInWithGoogle,
      }}>
        <GoogleAuthButton />
      </AuthContext.Provider>
    );
  };

  it('renders Google sign in button', () => {
    renderWithProvider();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('calls signInWithGoogle on click', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    renderWithProvider(true);
    const button = screen.getByText(/signing in/i).closest('button');
    expect(button).toBeDisabled();
  });
}); 