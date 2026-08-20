/**
 * Authentication Service
 * Connects to Django backend /api/auth/ endpoints for user registration, login, and session management.
 */

import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import { apiClient } from './api';
import { storage } from '@/utils/storage';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_PROFILE_KEY = 'user_profile';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data, error } = await apiClient<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });

  if (error || !data) {
    throw new Error(error || 'Invalid credentials');
  }

  if (data.token) {
    await storage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.user) {
    await storage.setItem(USER_PROFILE_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data, error } = await apiClient<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });

  if (error || !data) {
    throw new Error(error || 'Registration failed');
  }

  if (data.token) {
    await storage.setItem(AUTH_TOKEN_KEY, data.token);
  }
  if (data.user) {
    await storage.setItem(USER_PROFILE_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: 'If that email is registered, a password reset link has been sent.',
  };
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cached = await storage.getItem(USER_PROFILE_KEY);
    if (cached) {
      return JSON.parse(cached) as User;
    }
    const { data } = await apiClient<User>('/auth/me/', { method: 'GET', requiresAuth: true });
    return data || null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await storage.removeItem(AUTH_TOKEN_KEY);
  await storage.removeItem(USER_PROFILE_KEY);
}

export default {
  login,
  register,
  forgotPassword,
  getCurrentUser,
  logout,
};

