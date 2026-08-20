export interface Crop {
  id: number;
  name: string;
  scientific_name?: string;
  description: string;
  image?: string | null;
  ideal_temperature_min: number;
  ideal_temperature_max: number;
  ideal_ph_min: number;
  ideal_ph_max: number;
  ideal_rainfall_min: number;
  ideal_rainfall_max: number;
  created_at?: string;
  updated_at?: string;
}
