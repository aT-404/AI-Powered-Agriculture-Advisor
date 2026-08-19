/**
 * Price Alert Types
 */

export interface PriceAlert {
  id: number;
  user_identifier: string;
  commodity: string;
  state?: string;
  district?: string;
  market: string;
  target_price: number; // in ₹/Quintal
  condition: 'GTE' | 'LTE'; // GTE = >= Target, LTE = <= Target
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string | null;
  triggered_price?: number | null;
  created_at: string;
  updated_at: string;
  notification_message?: string | null;
}

export interface CreatePriceAlertInput {
  user_identifier?: string;
  commodity: string;
  state?: string;
  district?: string;
  market: string;
  target_price: number;
  condition?: 'GTE' | 'LTE';
  is_active?: boolean;
}
