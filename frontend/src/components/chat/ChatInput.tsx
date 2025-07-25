import React from "react";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  onStop, 
  loading, 
  disabled 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to send (without shift)
    if (e.key === 'Enter' && !e.shiftKey && !loading && !disabled) {
      e.preventDefault();
      onSend();
    }
    // Ctrl/Cmd + Enter to send (with shift for new line)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading && !disabled) {
      e.preventDefault();
      onSend();
    }
    // Escape to stop (if loading)
    if (e.key === 'Escape' && loading && onStop) {
      e.preventDefault();
      onStop();
    }
  };

  const handleButtonClick = () => {
    if (loading && onStop) {
      onStop();
    } else if (!loading && !disabled) {
      onSend();
    }
  };

  return (
    <div className="flex items-end bg-component rounded-lg shadow px-3 py-2 w-full gap-2" role="form" aria-label="Chat input form">
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Ask anything about stocks, market analysis, or investment insights..."
        aria-label="Type your message"
        disabled={loading || disabled}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none min-h-[40px] max-h-[120px] text-base"
        autoComplete="off"
        rows={1}
        style={{
          minHeight: '40px',
          maxHeight: '120px',
          overflowY: 'auto'
        }}
      />
      <Button
        type="button"
        variant={loading ? "destructive" : "primary"}
        onClick={handleButtonClick}
        disabled={!loading && (!value.trim() || disabled)}
        size="sm"
        className="rounded-lg w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 transition-all duration-200"
        aria-label={loading ? "Stop generation" : "Send message"}
        tabIndex={0}
      >
        {loading ? (
          <Square className="w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};

export default ChatInput; 