export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
