import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Watchlist from '../Watchlist';

const mockRemoveSymbol = jest.fn();
const mockReorderWatchlist = jest.fn();

jest.mock('../../../hooks/useWatchlist', () => ({
  useWatchlist: () => ({
    data: [
      { id: '1', symbol: 'AAPL', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: '2', symbol: 'GOOG', created_at: '2023-01-02T00:00:00Z', updated_at: '2023-01-02T00:00:00Z' },
    ],
    isLoading: false,
    error: null,
    addSymbol: jest.fn(),
    removeSymbol: mockRemoveSymbol,
    reorderWatchlist: mockReorderWatchlist,
  }),
}));

describe('Watchlist', () => {
  beforeEach(() => {
    mockRemoveSymbol.mockClear();
    mockReorderWatchlist.mockClear();
  });

  it('renders remove buttons and calls removeSymbol on click', () => {
    render(<Watchlist />);
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveSymbol).toHaveBeenCalledWith('AAPL');
  });

  it('calls reorderWatchlist with new order when up/down is clicked', () => {
    render(<Watchlist />);
    const upButtons = screen.getAllByRole('button', { name: /move .* up/i });
    const downButtons = screen.getAllByRole('button', { name: /move .* down/i });
    // Move GOOG up (should swap with AAPL)
    fireEvent.click(upButtons[1]);
    expect(mockReorderWatchlist).toHaveBeenCalledWith(['GOOG', 'AAPL']);
    // Move AAPL down (should swap with GOOG)
    fireEvent.click(downButtons[0]);
    expect(mockReorderWatchlist).toHaveBeenCalledWith(['GOOG', 'AAPL']);
  });
}); 