import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { CreatePriceAlertRequest, PriceAlert } from '../types/alert';

export const alertService = {
  getAlerts: async (userIdentifier?: string): Promise<PriceAlert[]> => {
    const response = await apiClient.get<PriceAlert[]>(
      API_ENDPOINTS.ALERTS.LIST_CREATE,
      {
        params: userIdentifier ? { user_identifier: userIdentifier } : undefined,
      }
    );
    return response.data;
  },

  createAlert: async (payload: CreatePriceAlertRequest): Promise<PriceAlert> => {
    const response = await apiClient.post<PriceAlert>(
      API_ENDPOINTS.ALERTS.LIST_CREATE,
      payload
    );
    return response.data;
  },

  toggleAlert: async (id: number | string): Promise<PriceAlert> => {
    const response = await apiClient.post<PriceAlert>(
      API_ENDPOINTS.ALERTS.TOGGLE(id)
    );
    return response.data;
  },

  deleteAlert: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ALERTS.DETAIL(id));
  },

  checkAllAlerts: async (): Promise<{ evaluated_count: number; results: any[] }> => {
    const response = await apiClient.post<{ evaluated_count: number; results: any[] }>(
      API_ENDPOINTS.ALERTS.CHECK_ALL
    );
    return response.data;
  },
};
