/**
 * Market Intelligence Types (Agmarknet / Mandi Prices & Trends)
 */

export interface MarketPrice {
  commodity: string;
  variety?: string;
  state: string;
  district: string;
  market: string;
  min_price: number; // in ₹/Quintal
  modal_price: number; // in ₹/Quintal
  max_price: number; // in ₹/Quintal
  unit: string; // e.g. "₹/Quintal"
  date: string;
  last_updated: string;
}

export interface MarketPricesResponse {
  count: number;
  results: MarketPrice[];
}

export interface MarketTrendPoint {
  date: string;
  display_date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
}

export interface MarketTrendData {
  commodity: string;
  market: string;
  district: string;
  state: string;
  timeframe_days: number;
  current_price: number;
  previous_price: number;
  price_difference: number;
  percentage_change: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  unit: string;
  points: MarketTrendPoint[];
}

export interface DistrictInfo {
  name: string;
  markets: string[];
}

export interface StateInfo {
  name: string;
  districts: DistrictInfo[];
}

export interface MarketFilterHierarchy {
  states: StateInfo[];
  commodities: string[];
}

export interface MarketQueryParams {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  days?: number;
}
