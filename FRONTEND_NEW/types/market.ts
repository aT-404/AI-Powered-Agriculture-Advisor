export interface StateFilterItem {
  name: string;
  districts?: Array<{
    name: string;
    markets?: string[];
  }>;
}

export interface MarketFilterHierarchy {
  states: Array<string | StateFilterItem>;
  commodities: string[];
  districts?: string[];
  markets?: string[];
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
