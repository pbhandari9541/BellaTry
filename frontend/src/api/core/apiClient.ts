function joinUrl(base: string, path: string): string {
  if (base.endsWith('/')) base = base.slice(0, -1);
  if (!path.startsWith('/')) path = '/' + path;
  return base + path;
}

export class ApiClient {
  private baseUrl: string;
  private getAccessToken?: () => string | null;

  constructor(baseUrl: string, getAccessToken?: () => string | null) {
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
  }

  private withAuthHeaders(options?: RequestInit): RequestInit {
    const token = this.getAccessToken ? this.getAccessToken() : null;
    let headers: Record<string, string> = {};
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        headers = { ...options.headers } as Record<string, string>;
      }
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // Debug logs only in development, never log tokens in production
    if (process.env.NODE_ENV === 'development') {
      console.log('[ApiClient] Request headers:', { ...headers, Authorization: token ? '***' : undefined });
    }
    return {
      ...options,
      headers,
    };
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.safeFetch<T>(joinUrl(this.baseUrl, path), {
      ...this.withAuthHeaders(options),
      method: 'GET',
    });
  }

  async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.withAuthHeaders(options).headers || {}),
    };
    return this.safeFetch<T>(joinUrl(this.baseUrl, path), {
      ...this.withAuthHeaders({ ...options, headers }),
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.withAuthHeaders(options).headers || {}),
    };
    return this.safeFetch<T>(joinUrl(this.baseUrl, path), {
      ...this.withAuthHeaders({ ...options, headers }),
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.safeFetch<T>(joinUrl(this.baseUrl, path), {
      ...this.withAuthHeaders(options),
      method: 'DELETE',
    });
  }

  private async safeFetch<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        let errorMsg = `API error: ${res.status}`;
        const errorBody = await res.text();
        // if (process.env.NODE_ENV === 'development') {
        //   console.error('[ApiClient] Raw error body:', errorBody);
        // }
        try {
          const parsed = JSON.parse(errorBody);
          errorMsg = parsed.message || parsed.detail || errorMsg;
        } catch {/* no-op: failed to parse error message */}
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (err: any) {
      throw new Error('Network error: ' + (err?.message || err));
    }
  }
}

export function getApiClient(getAccessToken: () => string | null, baseUrl: string = process.env.NEXT_PUBLIC_API_URL || ''): ApiClient {
  // Always return a new instance to ensure fresh token getter
  return new ApiClient(baseUrl, getAccessToken);
} 