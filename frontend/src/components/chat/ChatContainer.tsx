"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import ChatSuggestions from "./ChatSuggestions";
import ThinkingIndicator from "./ThinkingIndicator";
import { streamStocks, StreamRequest } from "@/api/services/ai";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TickerSelector from "./TickerSelector";
import { ChatMessage } from "./ChatMessageList";
import { generateSuggestions } from "./ChatSuggestions";

interface ChatContainerProps {
  initialSymbol?: string | null;
}

const DEFAULT_TICKERS = ["AAPL"]; // TODO: Make dynamic in future

console.log("ChatContainer mounted"); // DEBUG

const ChatContainer: React.FC<ChatContainerProps> = ({ initialSymbol }) => {
  const { user, accessToken } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoUsed, setDemoUsed] = useState(false);
  const [tickers, setTickers] = useState<string[]>(initialSymbol ? [initialSymbol] : DEFAULT_TICKERS);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);


  const [showSuggestions, setShowSuggestions] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const isLoggedIn = !!user;
  const canSend = isLoggedIn || !demoUsed;

  // Handle initial symbol
  useEffect(() => {
    if (initialSymbol && !tickers.includes(initialSymbol)) {
      setTickers([initialSymbol]);
      // Optionally trigger initial analysis
      if (initialSymbol !== DEFAULT_TICKERS[0]) {
        setTimeout(() => {
          handleQuickQuestion(`Tell me about ${initialSymbol}`);
        }, 500);
      }
    }
  }, [initialSymbol]);

  // Reset chat session when authentication status changes
  useEffect(() => {
    if (!isLoggedIn) {
      // For unauthenticated users, start fresh chat session
      setMessages([]);
      setDemoUsed(false);
      setError(null);
    }
    // For authenticated users, messages persist (no reset needed)
  }, [isLoggedIn]);

  useEffect(() => {
    console.log("Messages state changed:", messages);
  }, [messages]);

  useEffect(() => {
    console.log("Current streaming message changed:", currentStreamingMessage);
  }, [currentStreamingMessage]);

  useEffect(() => {
    console.log("ChatContainer mounted or remounted");
    return () => {
      console.log("ChatContainer unmounted");
    };
  }, []);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const inputElement = document.querySelector('textarea[placeholder*="Ask"]') as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
    // Ctrl/Cmd + L to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      handleNewChat();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleStop = () => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setLoading(false);
    setCurrentStreamingMessage("");
    
    // Add the partial message to the chat
    if (currentStreamingMessage.trim()) {
      setMessages(prev => [
        ...prev,
        { 
          role: "ai", 
          type: "markdown", 
          content: currentStreamingMessage + "\n\n*[Response stopped by user]*",
          isStreaming: false
        }
      ]);
    }
    
    toast({
      title: "Generation stopped",
      description: "AI response has been stopped.",
      variant: "default",
    });
  };

  const handleSend = async () => {
    console.log("handleSend called"); // DEBUG
    if (!input.trim() || loading || !canSend) return;
    
    // Use selected tickers as fallback, but let backend extract intelligently
    const tickersToUse = tickers.length > 0 ? tickers : ["AAPL"]; // Default fallback

    // Add the user message
    setMessages(prev => [
      ...prev,
      { role: "user", content: input },
    ]);
    setLoading(true);
    setInput("");
    setError(null);
    setCurrentStreamingMessage("");
    setShowSuggestions(false);

    const req: StreamRequest = {
      tickers: tickersToUse,
      query: input,
      style: "markdown",
    };
    console.log("Calling streamStocks", req); // DEBUG
    
    try {
      const cancel = streamStocks(
        req,
        ({ event, data }) => {
          // Log every event
          console.log("SSE handler called: event:", event, "data:", data);

          if (event === "end") {
            setLoading(false);
            setShowSuggestions(true);
            
            // Finalize the streaming message by setting isStreaming to false
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              
              if (lastMessage && lastMessage.role === "ai" && lastMessage.type === "markdown" && lastMessage.isStreaming) {
                // Update the last streaming message to finalize it
                return newMessages.map((msg, idx) => 
                  idx === newMessages.length - 1 
                    ? { ...msg, isStreaming: false, timestamp: Date.now() }
                    : msg
                );
              }
              return newMessages;
            });
            
            setCurrentStreamingMessage("");
            return;
          }
          if (!data) {
            console.log("SSE event with empty data, skipping");
            return;
          }
          try {
            const parsed = JSON.parse(data);
            console.log("SSE parsed message:", parsed);
            
            // Handle streaming markdown content
            if (parsed && parsed.role === "ai" && parsed.type === "markdown") {
              console.log("Streaming content received:", parsed.content);
              
              // ChatGPT-style streaming: always update the last message
              setMessages(prev => {
                console.log("Previous messages before update:", prev);
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                
                console.log("Last message:", lastMessage);
                console.log("Is streaming message:", lastMessage && lastMessage.role === "ai" && lastMessage.type === "markdown" && lastMessage.isStreaming);
                
                // Check if we have a streaming message to update
                if (lastMessage && lastMessage.role === "ai" && lastMessage.type === "markdown" && lastMessage.isStreaming) {
                  // Update existing streaming message by appending new content
                  const updatedContent = lastMessage.content + parsed.content;
                  console.log("Updating existing streaming message with content:", updatedContent);
                  
                  // Create a new array with the updated message
                  const updatedMessages = newMessages.map((msg, idx) => 
                    idx === newMessages.length - 1 
                      ? {
                          ...msg,
                          content: updatedContent,
                          isStreaming: true,
                          timestamp: Date.now()
                        } as ChatMessage
                      : msg
                  );
                  
                  console.log("Updated messages array:", updatedMessages);
                  return updatedMessages;
                } else {
                  // Create new streaming message (this should only happen once at the start)
                  console.log("Creating new streaming message with content:", parsed.content);
                  const newMessage: ChatMessage = {
                    role: "ai",
                    type: "markdown",
                    content: parsed.content,
                    isStreaming: true,
                    timestamp: Date.now()
                  };
                  const newMessageArray = [...newMessages, newMessage];
                  console.log("New message array:", newMessageArray);
                  return newMessageArray;
                }
              });
              
              // Also update the current streaming message for finalization
              setCurrentStreamingMessage(prev => prev + parsed.content);
            } else if (parsed && parsed.role === "ai" && parsed.type) {
              // Handle other message types (cards, tables, etc.)
              setMessages(prev => {
                const next = [...prev, parsed];
                console.log("setMessages (AI):", next, "prev:", prev, "parsed:", parsed);
                return next;
              });
            }
          } catch (e) {
            console.log("Failed to parse SSE data as JSON:", data, e);
            // Ignore non-JSON or non-AI messages
          }
        },
        isLoggedIn, // useProxy
        accessToken,
      );

      // Store cancel function
      cancelRef.current = cancel;
    } catch (err) {
      console.error("Error in streamStocks:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setShowSuggestions(false);
    setCurrentStreamingMessage("");
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    toast({
      title: "New Chat Started",
      description: "Started a new conversation.",
      variant: "default",
    });
  };

  // Quick question handlers
  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Auto-send after a brief delay to allow input to update
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: any) => {
    const suggestionText = suggestion.text;
    setInput(suggestionText);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Generate suggestions based on last message
  const getSuggestions = () => {
    if (messages.length === 0) return [];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      return generateSuggestions(lastMessage.content, tickers, messages);
    }
    return [];
  };

  return (
    <div className="bg-card-background rounded-lg border border-border p-6 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">AI Assistant</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isLoggedIn 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {isLoggedIn ? 'Persistent Chat' : 'Demo Mode'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn && messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              New Chat
            </button>
          )}
          <div className="text-xs text-muted-foreground">
            <kbd className="px-1 py-0.5 bg-component rounded text-xs">⌘</kbd> + <kbd className="px-1 py-0.5 bg-component rounded text-xs">Enter</kbd> to send
          </div>
        </div>
      </div>
      
      {/* Ticker selector */}
      <TickerSelector tickers={tickers} onChange={setTickers} />

      <div className="flex-1 overflow-y-auto mb-4">
        <ChatMessageList messages={messages} />
        
        {/* Thinking indicator */}
        <ThinkingIndicator isVisible={loading} />
        
        {/* Suggestions */}
        <ChatSuggestions 
          suggestions={getSuggestions()}
          onSuggestionClick={handleSuggestionClick}
          visible={showSuggestions && !loading}
        />
      </div>
      
      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="mb-4 p-4 bg-component rounded-lg">
          <h4 className="text-sm font-medium text-primary-text mb-3">Quick Questions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button 
              onClick={() => handleQuickQuestion(`Tell me about ${tickers[0]}`)}
              className="text-left p-2 bg-surface hover:bg-surface/80 rounded text-xs text-foreground transition-colors"
            >
              Tell me about {tickers[0]}
            </button>
            <button 
              onClick={() => handleQuickQuestion("What's the market sentiment for tech stocks?")}
              className="text-left p-2 bg-surface hover:bg-surface/80 rounded text-xs text-foreground transition-colors"
            >
              Market sentiment for tech stocks
            </button>
            <button 
              onClick={() => handleQuickQuestion(`Show me the latest news for ${tickers[0]}`)}
              className="text-left p-2 bg-surface hover:bg-surface/80 rounded text-xs text-foreground transition-colors"
            >
              Latest news for {tickers[0]}
            </button>
            <button 
              onClick={() => handleQuickQuestion(`What are the key metrics for ${tickers[0]}?`)}
              className="text-left p-2 bg-surface hover:bg-surface/80 rounded text-xs text-foreground transition-colors"
            >
              Key metrics for {tickers[0]}
            </button>
          </div>
        </div>
      )}
      
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={handleStop}
        loading={loading}
        disabled={!canSend}
      />
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
          {error}
        </div>
      )}
      {!canSend && (
        <div className="mt-4 text-center text-muted-foreground">
          <span>Sign up or log in to continue chatting with the AI assistant.</span>
        </div>
      )}
    </div>
  );
};

export default ChatContainer; 