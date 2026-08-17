/**
 * API Endpoints & Configuration
 * Note: Update BASE_URL and endpoints once the backend server is deployed.
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cropwise.ai/v1';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Crop Prediction (ML Backend)
  PREDICTION: {
    PREDICT: '/predict/crop',
    HISTORY: '/predict/history',
    DETAILS: (id: string) => `/predict/history/${id}`,
  },
  // Crop Catalog / Library
  CROPS: {
    LIST: '/crops',
    DETAILS: (id: string) => `/crops/${id}`,
    CATEGORIES: '/crops/categories',
    SEARCH: '/crops/search',
  },
  // Weather Service
  WEATHER: {
    CURRENT: '/weather/current',
    FORECAST: '/weather/forecast',
  },
  // User Profile & Settings
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  },
};

export default API_ENDPOINTS;
