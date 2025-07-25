"use client";

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../ui/ErrorBoundary';
import LoadingSpinner from '../ui/LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
  locale: string;
}

const Layout: React.FC<LayoutProps> = ({ children, locale }) => {
  // Placeholder for global loading state (can be connected to context or props in the future)
  const isLoading = false;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header locale={locale} />
      {/* Main Content with global error and loading boundaries */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <ErrorBoundary>
          {isLoading ? <LoadingSpinner /> : children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 