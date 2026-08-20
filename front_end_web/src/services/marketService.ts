import api from './api';
import {
  MarketPrice,
  MarketPriceListResponse,
  MarketFilters,
  MarketTrend,
  PriceAlert,
} from '../types/market';

export const marketService = {
  /**
   * Query mandi market prices with optional parameters.
   * GET /api/market/prices/
   */
  async getMarketPrices(params?: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    crop?: string;
  }): Promise<MarketPriceListResponse | MarketPrice[]> {
    const response = await api.get<MarketPriceListResponse | MarketPrice[]>('/api/market/prices/', {
      params,
    });
    return response.data;
  },

  /**
   * Get filter hierarchy options for dropdowns (states, districts, markets, commodities).
   * GET /api/market/filters/
   */
  async getMarketFilters(): Promise<MarketFilters> {
    const response = await api.get<MarketFilters>('/api/market/filters/');
    return response.data;
  },

  /**
   * Get commodity price trend data over specified number of days.
   * GET /api/market/trends/
   */
  async getMarketTrends(params?: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    days?: number;
  }): Promise<MarketTrend> {
    const response = await api.get<MarketTrend>('/api/market/trends/', {
      params,
    });
    return response.data;
  },

  /**
   * List price alerts for a user.
   * GET /api/alerts/?user_identifier=...
   */
  async getPriceAlerts(userIdentifier?: string): Promise<PriceAlert[]> {
    const response = await api.get<PriceAlert[]>('/api/alerts/', {
      params: userIdentifier ? { user_identifier: userIdentifier } : undefined,
    });
    return response.data;
  },

  /**
   * Create a new price alert.
   * POST /api/alerts/
   */
  async createPriceAlert(data: {
    user_identifier: string;
    commodity: string;
    state?: string;
    district?: string;
    market?: string;
    target_price: number;
    condition: 'ABOVE' | 'BELOW';
    is_active?: boolean;
  }): Promise<PriceAlert & { notification_message?: string }> {
    const response = await api.post<PriceAlert & { notification_message?: string }>('/api/alerts/', data);
    return response.data;
  },

  /**
   * Toggle price alert active state.
   * POST /api/alerts/<id>/toggle/
   */
  async togglePriceAlert(id: number): Promise<PriceAlert> {
    const response = await api.post<PriceAlert>(`/api/alerts/${id}/toggle/`);
    return response.data;
  },

  /**
   * Delete price alert.
   * DELETE /api/alerts/<id>/
   */
  async deletePriceAlert(id: number): Promise<void> {
    await api.delete(`/api/alerts/${id}/`);
  },
};

export default marketService;
