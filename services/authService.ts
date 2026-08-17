/**
 * Authentication Service
 * Placeholder service for login, registration, password recovery, and session management.
 */

import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO: Connect to backend POST /auth/login API
  console.log('[authService] login placeholder called with:', credentials.email);
  return {
    user: {
      id: 'demo-user-1',
      name: 'Demo Farmer',
      email: credentials.email,
      role: 'farmer',
    },
    token: 'placeholder-jwt-token-xyz',
  };
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  // TODO: Connect to backend POST /auth/register API
  console.log('[authService] register placeholder called with:', credentials.email);
  return {
    user: {
      id: 'demo-user-new',
      name: credentials.name,
      email: credentials.email,
      role: 'farmer',
    },
    token: 'placeholder-jwt-token-xyz',
  };
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  // TODO: Connect to backend POST /auth/forgot-password API
  console.log('[authService] forgotPassword placeholder called for:', email);
  return {
    success: true,
    message: 'If that email is registered, a password reset link has been sent.',
  };
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: Connect to backend GET /auth/me API
  return null;
}

export async function logout(): Promise<void> {
  // TODO: Connect to backend POST /auth/logout API & clear stored token
  console.log('[authService] logout placeholder called');
}
