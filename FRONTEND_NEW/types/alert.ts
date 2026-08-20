export interface PriceAlert {
  id: number;
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  target_price: number;
  condition: 'ABOVE' | 'BELOW' | 'EQUALS';
  user_identifier: string;
  is_active: boolean;
  is_triggered: boolean;
  notification_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePriceAlertRequest {
  commodity: string;
  target_price: number;
  condition: 'ABOVE' | 'BELOW' | 'EQUALS';
  state?: string;
  district?: string;
  market?: string;
  user_identifier?: string;
}
