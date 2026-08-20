import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { Crop } from '../types/crop';

export const cropService = {
  getCrops: async (search?: string): Promise<Crop[]> => {
    const response = await apiClient.get<Crop[]>(API_ENDPOINTS.CROPS.LIST, {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  getCropDetails: async (id: number | string): Promise<Crop> => {
    const response = await apiClient.get<Crop>(API_ENDPOINTS.CROPS.DETAIL(id));
    return response.data;
  },
};
