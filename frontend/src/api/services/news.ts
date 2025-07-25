import { ApiClient } from '../core/apiClient';
import { API_ENDPOINTS } from '../core/endpoints';
import type { ApiResponse } from '../core/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = new ApiClient(BASE_URL);

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  // Add more fields as needed
}

export async function fetchNews(): Promise<NewsArticle[]> {
  const res = await api.get<ApiResponse<NewsArticle[]>>(API_ENDPOINTS.NEWS || '/news');
  return res.data;
} 