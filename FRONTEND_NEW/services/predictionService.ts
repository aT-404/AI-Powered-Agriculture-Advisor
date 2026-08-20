import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import {
  CombinedPredictionInput,
  PredictionHistoryItem,
  PaginatedPredictionsResponse,
  StandaloneCropPredictionRequest,
  StandaloneCropPredictionResponse,
  StandaloneYieldPredictionRequest,
  StandaloneYieldPredictionResponse,
} from '../types/prediction';

export const predictionService = {
  // Combined Orchestration Pipeline (Requires Authentication)
  runCombinedPrediction: async (
    payload: CombinedPredictionInput
  ): Promise<PredictionHistoryItem> => {
    const response = await apiClient.post<PredictionHistoryItem>(
      API_ENDPOINTS.PREDICTIONS.LIST_CREATE,
      payload
    );
    return response.data;
  },

  // Get Prediction History (Paginated)
  getPredictionHistory: async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedPredictionsResponse> => {
    const response = await apiClient.get<PaginatedPredictionsResponse>(
      API_ENDPOINTS.PREDICTIONS.LIST_CREATE,
      {
        params: { page, page_size: pageSize },
      }
    );
    return response.data;
  },

  // Get Single Historical Prediction
  getPredictionDetails: async (
    id: number | string
  ): Promise<PredictionHistoryItem> => {
    const response = await apiClient.get<PredictionHistoryItem>(
      API_ENDPOINTS.PREDICTIONS.DETAIL_DELETE(id)
    );
    return response.data;
  },

  // Delete Prediction from History
  deletePrediction: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PREDICTIONS.DETAIL_DELETE(id));
  },

  // Standalone ML Crop Recommendation (7 parameters)
  predictBestCrop: async (
    payload: StandaloneCropPredictionRequest
  ): Promise<StandaloneCropPredictionResponse> => {
    const response = await apiClient.post<StandaloneCropPredictionResponse>(
      API_ENDPOINTS.ML.CROP_RECOMMENDATION,
      payload
    );
    return response.data;
  },

  // Standalone ML Yield Prediction (6 parameters)
  predictCropYield: async (
    payload: StandaloneYieldPredictionRequest
  ): Promise<StandaloneYieldPredictionResponse> => {
    const response = await apiClient.post<StandaloneYieldPredictionResponse>(
      API_ENDPOINTS.ML.YIELD_PREDICTION,
      payload
    );
    return response.data;
  },
};
