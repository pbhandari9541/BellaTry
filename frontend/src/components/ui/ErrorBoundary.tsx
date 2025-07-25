"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(_error: unknown, _errorInfo: unknown) {
    // Log error to monitoring service if needed
    // console.error(_error, _errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-destructive text-destructive-foreground p-6 rounded-lg my-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
          <p className="mb-2">An unexpected error occurred. Please try again or contact support.</p>
          <pre className="text-xs text-muted-foreground overflow-x-auto">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 