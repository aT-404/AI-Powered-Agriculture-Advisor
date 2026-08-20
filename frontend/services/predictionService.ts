/**
 * Prediction Service
 * Connects to Django REST backend ML model API (POST /api/predict/crop/)
 */

import { 
  PredictionRequest, 
  PredictionResult, 
  PredictionHistoryItem, 
  RecommendedCrop,
  YieldPredictionRequest,
  YieldPredictionResult
} from '@/types/prediction';
import { apiClient } from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api';

interface DjangoPredictionResponse {
  recommended_crop: string;
  confidence: number;
  top_recommendations: Array<{
    crop: string;
    confidence: number;
  }>;
}

interface DjangoYieldPredictionResponse {
  success: boolean;
  predicted_yield: number;
  unit: string;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function predictCrop(request: PredictionRequest): Promise<PredictionResult> {
  const payload = {
    N: Number(request.soil.nitrogen),
    P: Number(request.soil.phosphorus),
    K: Number(request.soil.potassium),
    ph: Number(request.soil.ph),
    temperature: Number(request.soil.temperature ?? 25.0),
    humidity: Number(request.soil.humidity ?? 80.0),
    rainfall: Number(request.soil.rainfall ?? 200.0),
  };

  console.log('[predictionService] Sending request to Django API:', payload);

  const { data, error } = await apiClient<DjangoPredictionResponse>(
    API_ENDPOINTS.PREDICTION.PREDICT,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: false,
    }
  );

  if (error || !data) {
    console.error('[predictionService] API request failed:', error);
    throw new Error(error || 'Failed to fetch crop prediction from backend API');
  }

  const primaryName = capitalize(data.recommended_crop);

  const recommendedCrops: RecommendedCrop[] = (data.top_recommendations || []).map((item, idx) => ({
    cropId: `${item.crop.toLowerCase()}-0${idx + 1}`,
    cropName: capitalize(item.crop),
    confidence: item.confidence,
    description: `Optimal suitability match for ${capitalize(item.crop)} based on soil nutrients.`,
  }));

  const primaryRecommendation: RecommendedCrop = {
    cropId: `${data.recommended_crop.toLowerCase()}-01`,
    cropName: primaryName,
    confidence: data.confidence,
    description: `Your soil parameters (N=${payload.N}, P=${payload.P}, K=${payload.K}, pH=${payload.ph}) combined with local climate metrics present optimal conditions for ${primaryName} cultivation.`,
    suitabilityReason: `Nitrogen level (${payload.N} kg/ha) and pH (${payload.ph}) support healthy panicle and root development.`,
  };

  return {
    id: `pred-${Date.now()}`,
    timestamp: new Date().toISOString(),
    input: request.soil,
    primaryRecommendation,
    recommendedCrops,
  };
}

export async function predictCropYield(request: YieldPredictionRequest): Promise<YieldPredictionResult> {
  console.log('[predictionService] Sending yield request to Django API:', request);

  const { data, error } = await apiClient<DjangoYieldPredictionResponse>(
    API_ENDPOINTS.PREDICTION.PREDICT_YIELD,
    {
      method: 'POST',
      body: JSON.stringify(request),
      requiresAuth: false,
    }
  );

  if (error || !data) {
    console.error('[predictionService] API request failed:', error);
    throw new Error(error || 'Failed to fetch crop yield prediction from backend API');
  }

  return {
    id: `yield-${Date.now()}`,
    timestamp: new Date().toISOString(),
    predicted_yield: data.predicted_yield,
    unit: data.unit,
    input: request,
  };
}

export async function getPredictionHistory(): Promise<PredictionHistoryItem[]> {
  console.log('[predictionService] getPredictionHistory called');
  return [];
}

export async function getPredictionById(id: string): Promise<PredictionResult | null> {
  console.log('[predictionService] getPredictionById called for:', id);
  return null;
}
