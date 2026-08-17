/**
 * Soil and Crop Prediction Types
 * Note: Update these interfaces after ML model input/output and backend API contracts are finalized.
 */

export interface SoilData {
  nitrogen: number; // N ratio in soil
  phosphorus: number; // P ratio in soil
  potassium: number; // K ratio in soil
  ph: number; // pH value of the soil (0-14)
  temperature?: number; // Temperature in Celsius
  humidity?: number; // Relative humidity in percentage
  rainfall?: number; // Rainfall in mm
}

export interface PredictionRequest {
  soil: SoilData;
  location?: {
    latitude: number;
    longitude: number;
  };
  additionalNotes?: string;
}

export interface RecommendedCrop {
  cropId: string;
  cropName: string;
  confidence: number; // Confidence score 0.0 - 1.0 (or percentage)
  description?: string;
  suitabilityReason?: string;
  estimatedYield?: string;
}

export interface PredictionResult {
  id: string;
  timestamp: string;
  input: SoilData;
  recommendedCrops: RecommendedCrop[];
  primaryRecommendation: RecommendedCrop;
  fertilizerAdvice?: string[];
  weatherSnapshot?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
}

export interface PredictionHistoryItem {
  id: string;
  date: string;
  primaryCropName: string;
  confidence: number;
  locationName?: string;
}
