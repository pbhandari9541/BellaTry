import { ApiClient } from '../core/apiClient';
import { API_ENDPOINTS } from '../core/endpoints';
import type { ApiResponse } from '../core/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const api = new ApiClient(BASE_URL);

export interface User {
  id: string;
  email: string;
  name?: string;
  // Add more fields as needed
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await api.get<ApiResponse<User>>(API_ENDPOINTS.USER);
  return res.data;
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  const res = await api.put<ApiResponse<User>>(API_ENDPOINTS.USER, data);
  return res.data;
} 