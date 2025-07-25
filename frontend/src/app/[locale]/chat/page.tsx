"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatContainer from '@/components/chat/ChatContainer';

export default function Chat() {
  const searchParams = useSearchParams();
  const [initialSymbol, setInitialSymbol] = useState<string | null>(null);

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    if (symbol) {
      setInitialSymbol(symbol.toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">AI Trading Assistant</h1>
          <p className="text-foreground">Get intelligent insights and analysis through natural language conversations</p>
          {initialSymbol && (
            <div className="mt-2 p-2 bg-accent/10 border border-accent/20 rounded text-accent text-sm">
              Analyzing: <strong>{initialSymbol}</strong>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {/* Current Custom Chat */}
            <div>
              <div className="mb-2 font-semibold text-primary-text">AI Trading Assistant</div>
              <ChatContainer initialSymbol={initialSymbol} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <div className="bg-card-background rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Quick Questions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-component rounded-lg hover:bg-surface transition-colors">
                  <p className="text-sm text-foreground">What stocks should I watch this week?</p>
                </button>
                <button className="w-full text-left p-3 bg-component rounded-lg hover:bg-surface transition-colors">
                  <p className="text-sm text-foreground">Explain the current market trends</p>
                </button>
                <button className="w-full text-left p-3 bg-component rounded-lg hover:bg-surface transition-colors">
                  <p className="text-sm text-foreground">How to analyze a company's fundamentals?</p>
                </button>
                <button className="w-full text-left p-3 bg-component rounded-lg hover:bg-surface transition-colors">
                  <p className="text-sm text-foreground">What are the best dividend stocks?</p>
                </button>
              </div>
            </div>

            {/* Market Insights */}
            <div className="bg-card-background rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Market Insights</h3>
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h4 className="font-medium text-primary-text text-sm mb-1">
                    Tech Sector Rally
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    AI and cloud computing stocks leading gains
                  </p>
                </div>
                <div className="border-b border-border pb-3">
                  <h4 className="font-medium text-primary-text text-sm mb-1">
                    Fed Rate Decision Impact
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Markets pricing in potential rate cuts
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-primary-text text-sm mb-1">
                    Earnings Season Preview
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Key companies reporting this week
                  </p>
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-card-background rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-primary-text mb-4">Recent Chats</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-2 hover:bg-component rounded transition-colors">
                  <p className="text-sm font-medium text-primary-text">Apple Stock Analysis</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </button>
                <button className="w-full text-left p-2 hover:bg-component rounded transition-colors">
                  <p className="text-sm font-medium text-primary-text">Market Trends Discussion</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </button>
                <button className="w-full text-left p-2 hover:bg-component rounded transition-colors">
                  <p className="text-sm font-medium text-primary-text">Portfolio Review</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 