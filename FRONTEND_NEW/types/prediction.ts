export interface CombinedPredictionInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CropPredictionResult {
  crop: string;
  confidence: number;
}

export interface YieldPredictionResult {
  yield: number;
  unit: string;
}

export interface MarketPriceResult {
  market: string;
  district: string;
  state: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  currency: string;
  unit: string;
  price_date: string | null;
  source: string;
  is_cached: boolean;
}

export interface FinancialEstimateResult {
  expected_revenue: number;
  currency: string;
  unit: string;
}

export interface PredictionHistoryItem {
  id: number;
  input: CombinedPredictionInput;
  crop_prediction: CropPredictionResult;
  yield_prediction: YieldPredictionResult | null;
  market: MarketPriceResult | null;
  financial_estimate: FinancialEstimateResult | null;
  created_at: string;
}

export interface PaginatedPredictionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PredictionHistoryItem[];
}

export interface StandaloneCropPredictionRequest {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface StandaloneCropPredictionResponse {
  recommended_crop: string;
  confidence: number;
  primaryRecommendation?: {
    cropName: string;
    confidence: number;
  };
}

export interface StandaloneYieldPredictionRequest {
  Crop: string;
  Crop_Year: number;
  Season: string;
  State: string;
  Area: number;
  Annual_Rainfall: number;
}

export interface StandaloneYieldPredictionResponse {
  success: boolean;
  predicted_yield: number;
  unit: string;
}
