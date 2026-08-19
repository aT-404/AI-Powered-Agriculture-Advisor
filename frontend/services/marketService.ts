/**
 * Market Intelligence Service
 * Connects to Django backend /api/market/ endpoints (Agmarknet Mandi Prices & Trends).
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import {
  MarketFilterHierarchy,
  MarketPricesResponse,
  MarketTrendData,
  MarketQueryParams,
} from '@/types/market';

export async function fetchMarketFilters(): Promise<{
  data: MarketFilterHierarchy | null;
  error: string | null;
}> {
  return apiClient<MarketFilterHierarchy>(API_ENDPOINTS.MARKET.FILTERS, {
    method: 'GET',
    requiresAuth: false,
  });
}

export async function fetchMarketPrices(
  params: MarketQueryParams = {}
): Promise<{
  data: MarketPricesResponse | null;
  error: string | null;
}> {
  const query = new URLSearchParams();
  if (params.commodity) query.append('commodity', params.commodity);
  if (params.state) query.append('state', params.state);
  if (params.district) query.append('district', params.district);
  if (params.market) query.append('market', params.market);

  const queryString = query.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.MARKET.PRICES}?${queryString}`
    : API_ENDPOINTS.MARKET.PRICES;

  return apiClient<MarketPricesResponse>(endpoint, {
    method: 'GET',
    requiresAuth: false,
  });
}

export async function fetchPriceTrends(
  params: MarketQueryParams = {}
): Promise<{
  data: MarketTrendData | null;
  error: string | null;
}> {
  const query = new URLSearchParams();
  if (params.commodity) query.append('commodity', params.commodity);
  if (params.state) query.append('state', params.state);
  if (params.district) query.append('district', params.district);
  if (params.market) query.append('market', params.market);
  if (params.days) query.append('days', params.days.toString());

  const queryString = query.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.MARKET.TRENDS}?${queryString}`
    : API_ENDPOINTS.MARKET.TRENDS;

  return apiClient<MarketTrendData>(endpoint, {
    method: 'GET',
    requiresAuth: false,
  });
}

export default {
  fetchMarketFilters,
  fetchMarketPrices,
  fetchPriceTrends,
};
