import React from 'react';

interface LinkCardProps {
  title: string;
  url: string;
  subtitle?: string;
  source?: string;
  variant?: 'accent' | 'info' | 'warning' | 'positive' | 'negative';
  children?: React.ReactNode;
}

export function LinkCard({ title, url, subtitle, source, variant = 'accent', children }: LinkCardProps) {
  // TODO: Map variant to Tailwind/card color system as per frontend/docs/COLOR_SYSTEM.md
  return (
    <div className={`rounded-lg shadow-md p-4 mb-2 bg-white border-l-4 border-${variant}`}> {/* Adjust color system as needed */}
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold underline text-primary">
        {title}
      </a>
      {subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
      {source && <div className="text-xs text-gray-500 mt-1">{source}</div>}
      {children}
    </div>
  );
} 