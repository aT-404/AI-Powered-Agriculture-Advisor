/**
 * Central API Client Helper
 * Note: Add authentication headers, token refresh interceptors, and error handlers here once backend is connected.
 */

import { API_BASE_URL } from '@/constants/api';
import { storage } from '@/utils/storage';

export function getBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('Configuration Error: API Base URL is not defined.');
  }
  // Strip '/api' suffix if it exists, since callers append their own '/api/...'
  if (API_BASE_URL.endsWith('/api')) {
    return API_BASE_URL.slice(0, -4);
  }
  return API_BASE_URL.replace(/\/$/, '');
}

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
    
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        const errorMessage = typeof errorData === 'object' && errorData !== null
          ? (errorData.error || errorData.detail || JSON.stringify(errorData))
          : `Request failed with status ${response.status}`;
        return { data: null, error: errorMessage };
      } else {
        const text = await response.text();
        console.error(`[API Error] Non-JSON response for ${url}:`, text.substring(0, 200));
        return { data: null, error: `Service unavailable or invalid response (HTTP ${response.status})` };
      }
    }

    if (!isJson) {
      return { data: null, error: 'Expected JSON response but received something else.' };
    }

    const responseData = await response.json();
    return { data: responseData as T, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Network request failed' };
  }
}

export default apiClient;
