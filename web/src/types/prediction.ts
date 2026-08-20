export interface PredictionInput {
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
  market: string | null;
  district: string | null;
  state: string | null;
  modal_price: number | null;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  unit: string | null;
  price_date: string | null;
  source: string | null;
  is_cached: boolean;
}

export interface FinancialEstimateResult {
  expected_revenue: number | null;
  currency: string;
  unit: string | null;
}

export interface PredictionItem {
  id: number;
  input: PredictionInput;
  crop_prediction: CropPredictionResult;
  yield_prediction: YieldPredictionResult | null;
  market: MarketPriceResult | null;
  financial_estimate: FinancialEstimateResult | null;
  created_at: string;
}

export interface PredictionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PredictionItem[];
}
