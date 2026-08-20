import api from './api';
import { Crop } from '../types/crop';

export const cropService = {
  /**
   * Get all crops or filter by search term.
   * GET /api/crops/?search=...
   */
  async getCrops(search?: string): Promise<Crop[]> {
    const response = await api.get<Crop[]>('/api/crops/', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  /**
   * Get a single crop by primary key ID.
   * GET /api/crops/<id>/
   */
  async getCropById(id: number | string): Promise<Crop> {
    const response = await api.get<Crop>(`/api/crops/${id}/`);
    return response.data;
  },
};

export default cropService;
