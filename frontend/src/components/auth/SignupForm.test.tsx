import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SignupForm from './SignupForm';
import { AuthContext } from '../../context/AuthContext';

/**
 * Tests for SignupForm component.
 * Linked to planning in PLANNING.md (Phase 5, Iteration 1).
 */
describe('SignupForm', () => {
  const mockSignUp = jest.fn();

  const renderWithProvider = (loading = false, error: string | null = null) => {
    render(
      <AuthContext.Provider value={{
        user: null,
        session: null,
        accessToken: null,
        loading,
        error,
        signIn: jest.fn(),
        signUp: mockSignUp,
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      }}>
        <SignupForm />
      </AuthContext.Provider>
    );
  };

  it('renders email and password fields', () => {
    renderWithProvider();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    renderWithProvider(true);
    const button = screen.getByRole('button', { name: /signing up/i });
    expect(button).toBeDisabled();
  });

  it('enables submit button when fields are filled and not loading', () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    const button = screen.getByRole('button', { name: /sign up/i });
    expect(button).not.toBeDisabled();
  });

  it('calls signUp with email and password', async () => {
    renderWithProvider();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    });
    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows loading state', () => {
    renderWithProvider(true);
    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();
  });

  it('shows error from context', () => {
    renderWithProvider(false, 'Email already exists');
    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });
}); 