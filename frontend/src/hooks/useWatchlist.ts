import { useEffect, useState } from 'react';
import { WatchlistItem, createWatchlistApi } from '../api/services/watchlist';
import { useAuth } from './useAuth';

interface UseWatchlistResult {
  data: WatchlistItem[] | null;
  isLoading: boolean;
  error: string | null;
  addSymbol: (symbol: string) => Promise<void>;
  removeSymbol: (symbol: string) => Promise<void>;
  reorderWatchlist: (newOrder: string[]) => Promise<void>;
}

export function useWatchlist(): UseWatchlistResult {
  const { accessToken } = useAuth();
  const api = createWatchlistApi(accessToken);
  const [data, setData] = useState<WatchlistItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function fetchWatchlist() {
    setIsLoading(true);
    setError(null);
    try {
      const items = await api.fetchWatchlist();
      setData(items);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function addSymbol(symbol: string) {
    setError(null);
    // Optimistic update
    const optimisticItem: WatchlistItem = {
      id: `optimistic-${symbol}-${Date.now()}`,
      symbol,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setData(prev => prev ? [optimisticItem, ...prev] : [optimisticItem]);
    try {
      await api.addToWatchlist(symbol);
      // No refetch here for smoother UX
    } catch (err: any) {
      // Rollback optimistic update
      setData(prev => prev?.filter(item => !item.id.startsWith('optimistic-')) || null);
      if (err.message && err.message.includes('already in watchlist')) {
        // Do not set global error, just rethrow for toast
        throw err;
      } else {
        setError(err.message || 'Unknown error');
      }
    }
  }

  async function removeSymbol(symbol: string) {
    setError(null);
    // Optimistic update: remove the item locally
    const prevData = data;
    setData(prev => prev ? prev.filter(item => item.symbol !== symbol) : prev);
    try {
      await api.removeFromWatchlist(symbol);
      // No refetch here for smoother UX
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      // Rollback optimistic update
      setData(prevData);
    }
  }

  async function reorderWatchlist(newOrder: string[]) {
    setError(null);
    const prevData = data;
    // Optimistic update: reorder locally
    if (data) {
      const newData = newOrder.map(symbol => data.find(item => item.symbol === symbol)!).filter(Boolean);
      setData(newData);
    }
    try {
      await api.reorderWatchlist(newOrder);
      // No refetch here for smoother UX
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      // Rollback optimistic update
      setData(prevData);
    }
  }

  return { data, isLoading, error, addSymbol, removeSymbol, reorderWatchlist };
} 