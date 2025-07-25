import { ApiClient } from '../core/apiClient';
import { API_ENDPOINTS } from '../core/endpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;
const api = new ApiClient(BASE_URL);

export interface AnalyzeRequest {
  tickers: string[];
  query: string;
  user_id?: string;
}

export interface AnalyzeResponse {
  results: Record<string, {
    matches: any[];
    rag_answer: string;
    context: string;
  }>;
  status: string;
  message?: string;
}

export interface StreamRequest {
  tickers: string[];
  query: string;
  style?: "markdown" | "bullets" | "json";
}

// If useProxy is true, POST to /api/proxy-ai-analyze (for authenticated users)
// Otherwise, use the public endpoint with the public API key
export async function analyzeStocks(request: AnalyzeRequest, useProxy = false, accessToken?: string | null): Promise<AnalyzeResponse> {
  if (useProxy) {
    // Use Next.js API route for authenticated users
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Add Authorization header if accessToken is provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch('/api/proxy-ai-analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Proxy error');
    }
    return res.json();
  } else {
    // Use public endpoint with public API key
    return api.post<AnalyzeResponse>(API_ENDPOINTS.AI_ANALYZE, request, {
      headers: {
        'X-API-KEY': PUBLIC_API_KEY || '',
      },
    });
  }
}

/**
 * Open an SSE stream to the backend /api/ai/stream endpoint.
 *
 * @param req       StreamRequest payload (will be JSON-encoded).
 * @param onEvent   Callback for SSE events. Receives `{ event: string; data: string }`.
 * @param useProxy  If true, route through the Next.js proxy (authenticated users).
 * @param accessToken Optional JWT for Authorization header when `useProxy` is true.
 * @returns a cancel function that aborts the underlying fetch/stream.
 */
export function streamStocks(
  req: StreamRequest,
  onEvent: (evt: { event: string; data: string }) => void,
  useProxy = false,
  accessToken?: string | null,
): () => void {
  const controller = new AbortController();

  const url = useProxy ? "/api/proxy-ai-stream" : "/api/ai/stream";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!useProxy) {
    headers["X-API-KEY"] = PUBLIC_API_KEY || "";
  } else if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Browser fetch with streaming body (ReadableStream of Uint8Array)
  fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok || !res.body) {
        onEvent({ event: "error", data: `HTTP ${res.status}` });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const read = (): void => {
        reader.read().then(({ value, done }) => {
          if (done) {
            onEvent({ event: "end", data: "" });
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // Normalise CRLF → LF so delimiter detection works regardless of backend
          buffer = buffer.replace(/\r\n/g, "\n");

          let idx;
          // Process complete SSE payloads separated by double LF
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 2);
            if (!raw) continue;

            let event = "message";
            let dataLines: string[] = [];
            raw.split("\n").forEach((line) => {
              if (line.startsWith("event:")) {
                event = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                // Remove ALL leading "data:" prefixes (handles double-wrapping)
                let clean = line;
                while (clean.startsWith("data:")) {
                  clean = clean.slice(5).trim();
                }
                if (clean) dataLines.push(clean);
              }
            });
            const data = dataLines.join("\n");
            onEvent({ event, data });
          }

          read();
        }).catch((err) => {
          onEvent({ event: "error", data: err.message || "stream read error" });
        });
      };

      read();
    })
    .catch((err) => {
      onEvent({ event: "error", data: err.message || "stream connection error" });
    });

  // Return cancel / abort function
  return () => controller.abort();
} 