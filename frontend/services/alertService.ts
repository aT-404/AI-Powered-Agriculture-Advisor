/**
 * Price Alert Service
 * Connects to Django backend /api/alerts/ endpoints for managing and evaluating farmer price alerts.
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { PriceAlert, CreatePriceAlertInput } from '@/types/alert';

export async function fetchAlerts(
  userIdentifier: string = 'default_farmer'
): Promise<{ data: PriceAlert[] | null; error: string | null }> {
  const endpoint = `${API_ENDPOINTS.ALERTS.LIST_CREATE}?user_identifier=${encodeURIComponent(userIdentifier)}`;
  return apiClient<PriceAlert[]>(endpoint, {
    method: 'GET',
    requiresAuth: false,
  });
}

export async function createPriceAlert(
  input: CreatePriceAlertInput
): Promise<{ data: PriceAlert | null; error: string | null }> {
  return apiClient<PriceAlert>(API_ENDPOINTS.ALERTS.LIST_CREATE, {
    method: 'POST',
    requiresAuth: false,
    body: JSON.stringify({
      user_identifier: input.user_identifier || 'default_farmer',
      commodity: input.commodity,
      state: input.state || '',
      district: input.district || '',
      market: input.market,
      target_price: input.target_price,
      condition: input.condition || 'GTE',
      is_active: input.is_active !== undefined ? input.is_active : true,
    }),
  });
}

export async function deletePriceAlert(
  id: number
): Promise<{ data: any | null; error: string | null }> {
  return apiClient(API_ENDPOINTS.ALERTS.DETAIL(id), {
    method: 'DELETE',
    requiresAuth: false,
  });
}

export async function togglePriceAlert(
  id: number
): Promise<{ data: PriceAlert | null; error: string | null }> {
  return apiClient<PriceAlert>(API_ENDPOINTS.ALERTS.TOGGLE(id), {
    method: 'POST',
    requiresAuth: false,
  });
}

export async function checkPriceAlerts(): Promise<{
  data: { evaluated_count: number; results: any[] } | null;
  error: string | null;
}> {
  return apiClient(API_ENDPOINTS.ALERTS.CHECK, {
    method: 'POST',
    requiresAuth: false,
  });
}

export default {
  fetchAlerts,
  createPriceAlert,
  deletePriceAlert,
  togglePriceAlert,
  checkPriceAlerts,
};
