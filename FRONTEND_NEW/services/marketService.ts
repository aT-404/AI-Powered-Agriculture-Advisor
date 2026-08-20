import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import {
  MarketFilterHierarchy,
  MarketPricesResponse,
  MarketTrendResponse,
} from '../types/market';

export const marketService = {
  getFilters: async (): Promise<MarketFilterHierarchy> => {
    const response = await apiClient.get<MarketFilterHierarchy>(
      API_ENDPOINTS.MARKET.FILTERS
    );
    return response.data;
  },

  getPrices: async (params?: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
  }): Promise<MarketPricesResponse> => {
    const response = await apiClient.get<MarketPricesResponse>(
      API_ENDPOINTS.MARKET.PRICES,
      { params }
    );
    return response.data;
  },

  getTrends: async (params?: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    days?: number;
  }): Promise<MarketTrendResponse> => {
    const response = await apiClient.get<MarketTrendResponse>(
      API_ENDPOINTS.MARKET.TRENDS,
      { params }
    );
    return response.data;
  },
};
