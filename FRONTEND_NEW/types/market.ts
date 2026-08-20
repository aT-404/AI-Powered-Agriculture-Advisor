export interface MarketFilterHierarchy {
  states: string[];
  commodities: string[];
  hierarchy?: Record<string, Record<string, string[]>>;
}

export interface MarketPriceItem {
  commodity: string;
  state: string;
  district: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date?: string;
  source?: string;
}

export interface MarketPricesResponse {
  count: number;
  results: MarketPriceItem[];
}

export interface PriceTrendPoint {
  date: string;
  price: number;
}

export interface MarketTrendResponse {
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  days: number;
  current_price: number;
  previous_price: number;
  percentage_change: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  trend_data: PriceTrendPoint[];
}
