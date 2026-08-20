import { apiClient, TokenStorage } from './api';
import { API_ENDPOINTS } from '../constants/api';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ProfileUpdateRequest,
  ChangePasswordRequest,
} from '../types/auth';

export const authService = {
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      payload
    );
    if (response.data.access && response.data.refresh) {
      await TokenStorage.setTokens(response.data.access, response.data.refresh);
      await TokenStorage.saveUser(response.data.user);
    }
    return response.data;
  },

  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    if (response.data.access && response.data.refresh) {
      await TokenStorage.setTokens(response.data.access, response.data.refresh);
      await TokenStorage.saveUser(response.data.user);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const refresh = await TokenStorage.getRefreshToken();
      if (refresh) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refresh });
      }
    } catch (e) {
      console.warn('Backend logout call failed or expired:', e);
    } finally {
      await TokenStorage.clearTokens();
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    await TokenStorage.saveUser(response.data);
    return response.data;
  },

  updateProfile: async (payload: ProfileUpdateRequest): Promise<User> => {
    const response = await apiClient.patch<User>(
      API_ENDPOINTS.AUTH.PROFILE,
      payload
    );
    await TokenStorage.saveUser(response.data);
    return response.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload
    );
    return response.data;
  },

  getCachedUser: async (): Promise<User | null> => {
    return await TokenStorage.getUser();
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await TokenStorage.getAccessToken();
    return !!token;
  },
};
