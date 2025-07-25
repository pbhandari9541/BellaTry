import React from 'react';

interface Suggestion {
  id: string;
  text: string;
  icon?: string;
}

interface ChatSuggestionsProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
  visible?: boolean;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ 
  suggestions, 
  onSuggestionClick, 
  visible = true 
}) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 suggestion-fade-in">
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.id}
          onClick={() => onSuggestionClick(suggestion)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-component hover:bg-surface border border-border rounded-lg btn-transition hover-lift text-foreground"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {suggestion.icon && <span>{suggestion.icon}</span>}
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};

// Helper function to generate context-aware suggestions
export const generateSuggestions = (
  lastMessage: string, 
  tickers: string[], 
  messageHistory: any[]
): Suggestion[] => {
  const suggestions: Suggestion[] = [];
  
  // Analyze the last message to determine context
  const lowerMessage = lastMessage.toLowerCase();
  
  if (lowerMessage.includes('analyze') || lowerMessage.includes('tell me about')) {
    // If user asked for analysis, suggest follow-up questions
    suggestions.push(
      { id: 'news', text: 'Show me the latest news', icon: '📰' },
      { id: 'sentiment', text: 'What\'s the market sentiment?', icon: '📊' },
      { id: 'technical', text: 'Show technical analysis', icon: '📈' },
      { id: 'compare', text: 'Compare with competitors', icon: '⚖️' }
    );
  } else if (lowerMessage.includes('news')) {
    // If user asked about news, suggest related topics
    suggestions.push(
      { id: 'earnings', text: 'Show earnings reports', icon: '💰' },
      { id: 'sec', text: 'Show SEC filings', icon: '📋' },
      { id: 'reddit', text: 'Show Reddit sentiment', icon: '💬' }
    );
  } else if (lowerMessage.includes('sentiment') || lowerMessage.includes('mood')) {
    // If user asked about sentiment, suggest other analysis types
    suggestions.push(
      { id: 'technical', text: 'Show technical indicators', icon: '📈' },
      { id: 'fundamentals', text: 'Show fundamental metrics', icon: '📊' },
      { id: 'risk', text: 'Assess investment risk', icon: '⚠️' }
    );
  } else if (lowerMessage.includes('technical') || lowerMessage.includes('chart')) {
    // If user asked about technical analysis, suggest other views
    suggestions.push(
      { id: 'fundamentals', text: 'Show fundamental analysis', icon: '📊' },
      { id: 'news', text: 'Show recent news impact', icon: '📰' },
      { id: 'forecast', text: 'Show price forecasts', icon: '🔮' }
    );
  } else {
    // Default suggestions based on current tickers
    if (tickers.length > 0) {
      suggestions.push(
        { id: 'analyze', text: `Analyze ${tickers[0]}`, icon: '🔍' },
        { id: 'news', text: `Latest news for ${tickers[0]}`, icon: '📰' },
        { id: 'compare', text: 'Compare multiple stocks', icon: '⚖️' },
        { id: 'portfolio', text: 'Portfolio analysis', icon: '💼' }
      );
    }
  }
  
  return suggestions.slice(0, 4); // Limit to 4 suggestions
};

export default ChatSuggestions; 