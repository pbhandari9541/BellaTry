import React from 'react';
import { Link } from '@/components/ui/Link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-component py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-text mb-6">
            Welcome to{' '}
            <span className="text-primary">BellaTry</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto">
            Try on makeup virtually, discover new looks, and connect with top MUAs. Your beauty, your way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/en/watchlist" variant="button" className="px-6 py-3 text-base rounded-md font-medium text-center">Start Your Watchlist</Link>
            <Link href="/en/chat" variant="button" className="px-6 py-3 text-base rounded-md font-medium text-center border">Chat with AI</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-text mb-12">
            Powerful Features for Smart Trading
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Watchlist Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Smart Watchlist
              </h3>
              <p className="text-foreground">
                Create and manage your personalized stock watchlist with real-time updates and custom ordering.
              </p>
            </div>

            {/* AI Chat Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-positive/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-positive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-foreground">
                Get intelligent insights and analysis through natural language conversations with our AI assistant.
              </p>
            </div>

            {/* News Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Market News
              </h3>
              <p className="text-foreground">
                Stay updated with the latest market news, trends, and analysis from trusted sources.
              </p>
            </div>

            {/* Dashboard Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-foreground">
                Comprehensive dashboard with charts, metrics, and performance analytics for your portfolio.
              </p>
            </div>

            {/* Real-time Data Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-negative/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-negative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Real-time Data
              </h3>
              <p className="text-foreground">
                Access real-time stock prices, market data, and financial information from reliable sources.
              </p>
            </div>

            {/* Security Feature */}
            <div className="bg-component p-6 rounded-lg">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-text mb-2">
                Secure & Private
              </h3>
              <p className="text-foreground">
                Your data is protected with enterprise-grade security and privacy controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-xl text-primary-foreground mb-8">
            Join thousands of traders who are already using TradeAdvisor to make better investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/en/watchlist" variant="button" className="px-6 py-3 text-base rounded-md font-medium text-center border">Get Started Free</Link>
            <Link href="/en/chat" variant="button" className="px-6 py-3 text-base rounded-md font-medium text-center border border-white text-white">Try AI Chat</Link>
          </div>
        </div>
      </section>
    </div>
  );
} 