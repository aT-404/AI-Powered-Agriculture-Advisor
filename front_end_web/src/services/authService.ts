import api from './api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ProfileUpdateRequest,
  ChangePasswordRequest,
} from '../types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login/', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/api/auth/register/', data);
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post('/api/auth/logout/', { refresh: refreshToken });
    } catch (e) {
      console.warn('Backend logout response error:', e);
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/api/auth/profile/');
    return response.data;
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    const response = await api.patch<User>('/api/auth/profile/', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/api/auth/change-password/', data);
    return response.data;
  },
};

export default authService;
