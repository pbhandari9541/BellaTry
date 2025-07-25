"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../ui/Input";

interface Props {
  tickers: string[];
  onChange: (t: string[]) => void;
  max?: number;
}

// Simple chip-based multi-ticker selector. Users type a ticker and press Enter (, or space).
const TickerSelector: React.FC<Props> = ({ tickers, onChange, max = 5 }) => {
  const [draft, setDraft] = useState("");

  const addTicker = (raw: string) => {
    const t = raw.trim().toUpperCase();
    if (!t) return;
    if (tickers.includes(t)) return;
    if (tickers.length >= max) return;
    onChange([...tickers, t]);
    setDraft("");
  };

  const removeTicker = (t: string) => {
    // Prevent removing the last ticker
    if (tickers.length <= 1) {
      return;
    }
    onChange(tickers.filter((tk) => tk !== t));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1" htmlFor="ticker-input">Tickers</label>
      <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Selected tickers">
        {tickers.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
            role="listitem"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTicker(t)}
              className="hover:text-destructive"
              aria-label={`Remove ${t}`}
              tabIndex={0}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tickers.length === 0 && (
          <span className="text-sm text-muted-foreground italic">
            No tickers selected
          </span>
        )}
      </div>
      {tickers.length < max && (
        <Input
          id="ticker-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add ticker e.g. MSFT"
          aria-label="Add ticker"
          onKeyDown={(e) => {
            if (["Enter", ",", " "].includes(e.key)) {
              e.preventDefault();
              addTicker(draft);
            }
          }}
          className="w-40"
        />
      )}
    </div>
  );
};

export default TickerSelector; 