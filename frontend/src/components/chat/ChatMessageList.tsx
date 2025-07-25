import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Table, { TableColumn } from "@/components/ui/Table";
import Card, { CardVariant } from "@/components/ui/Card";
import ChartWrapper from "@/components/ui/ChartWrapper";
import { LinkCard } from "@/components/ui/LinkCard";

// Unified message type for hybrid rendering
export type ChatMessage =
  | { role: "user"; content: string }
  | { role: "ai"; type: "markdown"; content: string; isStreaming?: boolean; timestamp?: number }
  | { role: "ai"; type: "table"; columns: TableColumn[]; data: any[]; isStreaming?: boolean; timestamp?: number }
  | { role: "ai"; type: "card"; title: string; content: string; variant?: CardVariant; url?: string; isStreaming?: boolean; timestamp?: number }
  | { role: "ai"; type: "chart"; title: string; content: any; chartType?: "line" | "bar" | "candlestick"; isStreaming?: boolean; timestamp?: number };

interface ChatMessageListProps {
  messages: ChatMessage[];
}

// Streaming text component with typing effect
const StreamingText: React.FC<{ content: string; isStreaming?: boolean }> = ({ content, isStreaming }) => {
  // Simple streaming text component that directly renders the content
  return (
    <div className="prose prose-invert text-sm max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 px-3 py-2 bg-gray-700 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-3 py-2">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-primary">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-primary">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-primary">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-primary">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary ml-1 typing-cursor animate-pulse">|</span>
      )}
    </div>
  );
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  console.log("Rendering messages:", messages); // TEMP DEBUG
  
  return (
    <div className="flex flex-col gap-6" role="log" aria-live="polite" aria-relevant="additions" tabIndex={0}>
      {messages.map((msg, idx) => {
        console.log("Rendering message in map:", msg); // DEBUG
        return (
          <div
            key={`${idx}-${msg.role}-${'type' in msg ? msg.type : 'text'}-${'isStreaming' in msg && msg.isStreaming ? 'streaming' : 'complete'}-${'timestamp' in msg ? msg.timestamp : 'no-timestamp'}-${'content' in msg ? msg.content.length : 'no-content'}`}
            className={`flex message-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm hover-lift ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card-background text-foreground border border-border"
              }`}
            >
              {/* Hybrid rendering logic */}
              {msg.role === "ai" && "type" in msg ? (
                msg.type === "markdown" ? (
                  <div className="prose prose-invert text-sm max-w-none">
                    {msg.isStreaming ? (
                      <StreamingText content={msg.content} isStreaming={true} />
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse border border-gray-600">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-gray-600 px-3 py-2 bg-gray-700 text-left">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-gray-600 px-3 py-2">
                              {children}
                            </td>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4 text-primary">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-semibold mb-3 text-primary">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-medium mb-2 text-primary">{children}</h3>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-primary">{children}</strong>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ) : msg.type === "table" ? (
                  <Table columns={msg.columns} data={msg.data} />
                ) : msg.type === "card" && "url" in msg && msg.url ? (
                  <LinkCard 
                    title={msg.title} 
                    url={msg.url} 
                    source={msg.content} 
                    variant={
                      msg.variant === 'default' || !msg.variant ? 'accent' : msg.variant
                    } 
                  />
                ) : msg.type === "card" ? (
                  <Card title={msg.title} variant={msg.variant || "default"}>{msg.content}</Card>
                ) : msg.type === "chart" ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">{msg.title}</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <ChartWrapper 
                        title={msg.title} 
                        data={msg.content} 
                        type={msg.chartType || "line"} 
                      />
                    </div>
                    {/* Add technical indicators summary if available */}
                    {msg.content?.technical_indicators && (
                      <div className="text-sm text-gray-300">
                        <h4 className="font-medium mb-2">Technical Indicators:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {msg.content.technical_indicators.rsi && (
                            <div>RSI: {msg.content.technical_indicators.rsi[msg.content.technical_indicators.rsi.length - 1]?.toFixed(1) || 'N/A'}</div>
                          )}
                          {msg.content.technical_indicators.sma_20 && (
                            <div>SMA 20: ${msg.content.technical_indicators.sma_20[msg.content.technical_indicators.sma_20.length - 1]?.toFixed(2) || 'N/A'}</div>
                          )}
                          {msg.content.technical_indicators.sma_50 && (
                            <div>SMA 50: ${msg.content.technical_indicators.sma_50[msg.content.technical_indicators.sma_50.length - 1]?.toFixed(2) || 'N/A'}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              ) : (
                // User message or fallback
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessageList; 