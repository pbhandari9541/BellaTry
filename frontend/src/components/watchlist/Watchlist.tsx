"use client";
import React, { useState } from 'react';
import ErrorBoundary from '../ui/ErrorBoundary';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useToast } from "../../hooks/use-toast";

interface WatchlistProps {
  onAnalyzeSymbol?: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ onAnalyzeSymbol }) => {
  const { data, isLoading, error, addSymbol, removeSymbol, reorderWatchlist } = useWatchlist();
  const [symbol, setSymbol] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    try {
      await addSymbol(symbol.trim());
    } catch (err: any) {
      if (err.message && err.message.includes('already in watchlist')) {
        toast({
          title: 'Symbol already exists',
          description: 'This symbol is already in your watchlist.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error adding symbol',
          description: err.message || 'Unknown error',
          variant: 'destructive',
        });
      }
    }
    setSymbol('');
  };

  const handleAnalyze = (symbol: string) => {
    if (onAnalyzeSymbol) {
      onAnalyzeSymbol(symbol);
    } else {
      // Fallback: navigate to chat with symbol
      window.location.href = `/chat?symbol=${symbol}`;
    }
  };

  // Show toast for general errors (e.g., fetch errors)
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading watchlist',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={`Error loading watchlist: ${error}`} />;
  }

  return (
    <ErrorBoundary>
      <section className="bg-card-background rounded-lg shadow p-6 my-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Watchlist</h2>
        <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="border border-input rounded px-3 py-2 flex-1"
            placeholder="Add symbol (e.g. AAPL)"
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded disabled:opacity-50"
            disabled={!symbol.trim()}
          >
            Add
          </button>
        </form>
        {data && data.length > 0 ? (
          <ul className="divide-y divide-border">
            {data.map((item, idx) => (
              <li key={item.id} className="py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold">{item.symbol}</span>
                  <span className="text-muted-foreground text-xs">Added: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Analyze Button */}
                  <button
                    className="text-xs px-3 py-1 rounded bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                    onClick={() => handleAnalyze(item.symbol)}
                    disabled={isLoading}
                    aria-label={`Analyze ${item.symbol}`}
                  >
                    Analyze
                  </button>
                  
                  {/* Reorder Buttons */}
                  <button
                    className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-50"
                    onClick={async () => {
                      if (!data) return;
                      const newOrder = [...data];
                      if (idx > 0) {
                        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                        try {
                          await reorderWatchlist(newOrder.map(i => i.symbol));
                        } catch (err: any) {
                          toast({
                            title: 'Error reordering watchlist',
                            description: err.message || 'Unknown error',
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    disabled={isLoading || idx === 0}
                    aria-label={`Move ${item.symbol} up`}
                  >
                    ↑
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border border-border bg-background hover:bg-muted disabled:opacity-50"
                    onClick={async () => {
                      if (!data) return;
                      const newOrder = [...data];
                      if (idx < data.length - 1) {
                        [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
                        try {
                          await reorderWatchlist(newOrder.map(i => i.symbol));
                        } catch (err: any) {
                          toast({
                            title: 'Error reordering watchlist',
                            description: err.message || 'Unknown error',
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    disabled={isLoading || idx === data.length - 1}
                    aria-label={`Move ${item.symbol} down`}
                  >
                    ↓
                  </button>
                  
                  {/* Remove Button */}
                  <button
                    className="text-destructive hover:underline text-xs px-2 py-1 rounded disabled:opacity-50"
                    onClick={async () => {
                      try {
                        await removeSymbol(item.symbol);
                      } catch (err: any) {
                        toast({
                          title: 'Error removing symbol',
                          description: err.message || 'Unknown error',
                          variant: 'destructive',
                        });
                      }
                    }}
                    disabled={isLoading}
                    aria-label={`Remove ${item.symbol}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground">No items yet. Add your first stock!</div>
        )}
      </section>
    </ErrorBoundary>
  );
};

export default Watchlist; 