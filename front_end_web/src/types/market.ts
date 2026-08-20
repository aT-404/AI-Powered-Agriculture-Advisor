export interface MarketPrice {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  crop?: string;
  min_price?: number;
  max_price?: number;
  modal_price?: number;
  unit?: string;
  price_date?: string;
}

export interface MarketPriceListResponse {
  count?: number;
  results?: MarketPrice[];
  [key: string]: unknown;
}

export interface MarketFilters {
  states: string[];
  districts: string[];
  markets: string[];
  commodities: string[];
}

export interface TrendPoint {
  date: string;
  price: number;
}

export interface MarketTrend {
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  trend: 'up' | 'down' | 'stable' | string;
  percentage_change: number;
  points: TrendPoint[];
}

export interface PriceAlert {
  id: number;
  user_identifier: string;
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  target_price: number;
  condition: 'ABOVE' | 'BELOW';
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string | null;
  triggered_price?: number | null;
  created_at: string;
  updated_at: string;
}
