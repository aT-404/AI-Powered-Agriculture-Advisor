import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest, ProfileUpdateRequest } from '../types/auth';
import authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const cachedUser = localStorage.getItem('user_info');

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem('user_info');
        }
      }

      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('user_info', JSON.stringify(profile));
        } catch (error) {
          console.warn('Failed to verify stored authentication token:', error);
          // Token interceptor handles redirection if refresh also fails
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const res = await authService.login(credentials);
    localStorage.setItem('access_token', res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user_info', JSON.stringify(res.user));
    setUser(res.user);

    // Fetch complete user profile in background to get phone/location if available
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      localStorage.setItem('user_info', JSON.stringify(profile));
    } catch {
      // keep basic info
    }
  };

  const register = async (data: RegisterRequest) => {
    const res = await authService.register(data);
    localStorage.setItem('access_token', res.access);
    localStorage.setItem('refresh_token', res.refresh);
    localStorage.setItem('user_info', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      await authService.logout(refresh);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
  };

  const updateProfile = async (data: ProfileUpdateRequest) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    localStorage.setItem('user_info', JSON.stringify(updated));
    return updated;
  };

  const refreshProfile = async () => {
    const profile = await authService.getProfile();
    setUser(profile);
    localStorage.setItem('user_info', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
