import React from 'react';

interface ThinkingIndicatorProps {
  isVisible: boolean;
  message?: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
  isVisible, 
  message = "AI is thinking..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-6 message-fade-in">
      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-card-background text-foreground border border-border shadow-sm">
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full thinking-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full thinking-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full thinking-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Message */}
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator; 