import { getApiClient } from '../core/apiClient';
import { API_ENDPOINTS } from '../core/endpoints';
import type { ApiResponse } from '../core/types';

export interface WatchlistItem {
  id: string;
  symbol: string;
  created_at: string;
  updated_at: string;
  // Add more fields as needed
}

export function createWatchlistApi(accessToken: string | null) {
  const api = getApiClient(() => accessToken);

  return {
    async fetchWatchlist(): Promise<WatchlistItem[]> {
      const res = await api.get<ApiResponse<WatchlistItem[]>>(API_ENDPOINTS.WATCHLIST);
      return res.data;
    },
    async addToWatchlist(symbol: string): Promise<WatchlistItem> {
      const res = await api.post<ApiResponse<WatchlistItem>>(API_ENDPOINTS.WATCHLIST, { symbol });
      return res.data;
    },
    async removeFromWatchlist(symbol: string): Promise<void> {
      await api.delete(API_ENDPOINTS.WATCHLIST, {
        body: JSON.stringify({ symbol }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    async reorderWatchlist(newOrder: string[]): Promise<void> {
      await api.put(API_ENDPOINTS.WATCHLIST + 'reorder', { symbols: newOrder });
    },
  };
} 