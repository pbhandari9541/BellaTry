// Common API response and error types

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  [key: string]: unknown;
} 