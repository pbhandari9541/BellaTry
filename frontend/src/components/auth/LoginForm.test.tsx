// Mock Supabase client to avoid ESM import issues in Jest
jest.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  },
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from './LoginForm';
import { AuthContext } from '../../context/AuthContext';

/**
 * Tests for LoginForm component.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 */
describe('LoginForm', () => {
  const mockSignIn = jest.fn();

  const renderWithProvider = (loading = false, error: string | null = null) => {
    render(
      <AuthContext.Provider value={{
        user: null,
        session: null,
        accessToken: null,
        loading,
        error,
        signIn: mockSignIn,
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      }}>
        <LoginForm />
      </AuthContext.Provider>
    );
  };

  it('renders email and password fields', () => {
    renderWithProvider();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('disables submit button if fields are empty', () => {
    renderWithProvider();
    const button = screen.getByTestId('login-submit');
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(button).not.toBeDisabled();
  });

  it('calls signIn with email and password', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows loading state', () => {
    renderWithProvider(true);
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('shows error from context', () => {
    renderWithProvider(false, 'Invalid credentials');
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
}); 