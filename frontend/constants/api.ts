/**
 * API Endpoints & Configuration
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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
    PREDICT: '/predict/crop/',
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
  // Weather Service (Open-Meteo via Django backend)
  WEATHER: {
    GET: '/weather/',
    CURRENT: '/weather/',
    FORECAST: '/weather/',
  },
  // Market Intelligence (Agmarknet Mandi Prices & Trends)
  MARKET: {
    FILTERS: '/market/filters/',
    PRICES: '/market/prices/',
    TRENDS: '/market/trends/',
  },
  // Price Alert System
  ALERTS: {
    LIST_CREATE: '/alerts/',
    DETAIL: (id: number | string) => `/alerts/${id}/`,
    TOGGLE: (id: number | string) => `/alerts/${id}/toggle/`,
    CHECK: '/alerts/check/',
  },
  // User Profile & Settings
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  },
};

export default API_ENDPOINTS;
