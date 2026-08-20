import api from './api';
import {
  PredictionInput,
  PredictionItem,
  PredictionListResponse,
} from '../types/prediction';

export const predictionService = {
  /**
   * Run crop and yield prediction pipeline and save result in Django DB history.
   * POST /api/predictions/
   */
  async createPrediction(input: PredictionInput): Promise<PredictionItem> {
    const response = await api.post<PredictionItem>('/api/predictions/', input);
    return response.data;
  },

  /**
   * Fetch authenticated user's prediction history (paginated or list).
   * GET /api/predictions/?page=...
   */
  async getPredictionHistory(page: number = 1, pageSize: number = 10): Promise<PredictionListResponse | PredictionItem[]> {
    const response = await api.get<PredictionListResponse | PredictionItem[]>('/api/predictions/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  /**
   * Fetch single prediction details by ID.
   * GET /api/predictions/<id>/
   */
  async getPredictionById(id: number | string): Promise<PredictionItem> {
    const response = await api.get<PredictionItem>(`/api/predictions/${id}/`);
    return response.data;
  },

  /**
   * Delete prediction by ID.
   * DELETE /api/predictions/<id>/
   */
  async deletePrediction(id: number | string): Promise<void> {
    await api.delete(`/api/predictions/${id}/`);
  },

  /**
   * Direct ML Crop prediction endpoint (unauthenticated standalone inference)
   * POST /api/predict/crop/
   */
  async predictCropDirect(input: Omit<PredictionInput, 'latitude' | 'longitude'>) {
    const response = await api.post('/api/predict/crop/', input);
    return response.data;
  },

  /**
   * Direct ML Yield prediction endpoint (unauthenticated standalone inference)
   * POST /api/predict/crop-yield/
   */
  async predictYieldDirect(data: {
    Crop: string;
    Crop_Year: number;
    Season: string;
    State: string;
    Area: number;
    Annual_Rainfall: number;
  }) {
    const response = await api.post('/api/predict/crop-yield/', data);
    return response.data;
  },
};

export default predictionService;
