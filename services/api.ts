/**
 * Central API Client Helper
 * Note: Add authentication headers, token refresh interceptors, and error handlers here once backend is connected.
 */

import { API_BASE_URL } from '@/constants/api';
import { storage } from '@/utils/storage';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await storage.getItem('auth_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // TODO: Connect real backend fetch request
    console.log(`[API Request Placeholder] ${options.method || 'GET'} -> ${url}`);

    // Return empty placeholder response for skeleton
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Network request failed' };
  }
}

export default apiClient;
