export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
    REFRESH_TOKEN: '/api/auth/token/refresh/',
  },
  // Prediction Orchestrator
  PREDICTIONS: {
    LIST_CREATE: '/api/predictions/',
    DETAIL_DELETE: (id: number | string) => `/api/predictions/${id}/`,
  },
  // Dedicated ML Models
  ML: {
    CROP_RECOMMENDATION: '/api/predict/crop/',
    YIELD_PREDICTION: '/api/predict/crop-yield/',
  },
  // Weather
  WEATHER: '/api/weather/',
  // Market Intelligence
  MARKET: {
    FILTERS: '/api/market/filters/',
    PRICES: '/api/market/prices/',
    TRENDS: '/api/market/trends/',
  },
  // Price Alerts
  ALERTS: {
    LIST_CREATE: '/api/alerts/',
    DETAIL: (id: number | string) => `/api/alerts/${id}/`,
    TOGGLE: (id: number | string) => `/api/alerts/${id}/toggle/`,
    CHECK_ALL: '/api/alerts/check/',
  },
  // Crop Library
  CROPS: {
    LIST: '/api/crops/',
    DETAIL: (id: number | string) => `/api/crops/${id}/`,
  },
  // Health
  HEALTH: '/api/health/',
};
