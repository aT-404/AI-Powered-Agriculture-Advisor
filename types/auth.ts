/**
 * Authentication and User Types
 * Note: Update these interfaces after the backend auth API contract is finalized.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'farmer' | 'agronomist' | 'admin';
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
    region?: string;
  };
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  region?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number;
}
