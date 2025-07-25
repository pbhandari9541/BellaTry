import React from 'react';
import { render, screen } from '@testing-library/react';
import { useUser } from '../useUser';

function TestComponent() {
  const { user, isLoading, error } = useUser();
  return (
    <div>
      <div>isLoading: {isLoading ? 'true' : 'false'}</div>
      <div>user: {user ? user.email : 'none'}</div>
      <div>error: {error || 'none'}</div>
    </div>
  );
}

describe('useUser', () => {
  it('should initialize with loading state', () => {
    render(<TestComponent />);
    expect(screen.getByText(/isLoading: true/)).toBeInTheDocument();
  });

  // Add more tests for fetch, error, and update logic as needed
}); 