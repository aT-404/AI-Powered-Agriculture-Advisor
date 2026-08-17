/**
 * Prediction Service
 * Placeholder service for ML crop prediction and historical records.
 */

import { PredictionRequest, PredictionResult, PredictionHistoryItem } from '@/types/prediction';

export async function predictCrop(request: PredictionRequest): Promise<PredictionResult> {
  // TODO: Connect to backend ML model API (POST /predict/crop)
  console.log('[predictionService] predictCrop called with:', request);
  return {
    id: `pred-${Date.now()}`,
    timestamp: new Date().toISOString(),
    input: request.soil,
    primaryRecommendation: {
      cropId: 'rice-01',
      cropName: 'Rice',
      confidence: 0.92,
      description: 'Optimal soil nitrogen and moisture levels detected for wetland rice.',
    },
    recommendedCrops: [
      { cropId: 'rice-01', cropName: 'Rice', confidence: 0.92 },
      { cropId: 'wheat-02', cropName: 'Wheat', confidence: 0.81 },
      { cropId: 'maize-03', cropName: 'Maize', confidence: 0.74 },
    ],
  };
}

export async function getPredictionHistory(): Promise<PredictionHistoryItem[]> {
  // TODO: Connect to backend GET /predict/history API
  console.log('[predictionService] getPredictionHistory called');
  return [];
}

export async function getPredictionById(id: string): Promise<PredictionResult | null> {
  // TODO: Connect to backend GET /predict/history/:id API
  console.log('[predictionService] getPredictionById called for:', id);
  return null;
}
