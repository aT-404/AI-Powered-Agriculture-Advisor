/**
 * Crop Library and Botanical Info Types
 * Note: Update these interfaces after backend crop database schema is finalized.
 */

export interface SoilRequirements {
  minPh: number;
  maxPh: number;
  nitrogenRequirement: 'Low' | 'Medium' | 'High';
  phosphorusRequirement: 'Low' | 'Medium' | 'High';
  potassiumRequirement: 'Low' | 'Medium' | 'High';
  soilType?: string[];
}

export interface ClimateRequirements {
  minTemperature: number; // in Celsius
  maxTemperature: number; // in Celsius
  optimalRainfall: string; // e.g. "500 - 800 mm"
  growingSeason: string; // e.g. "Kharif", "Rabi", "Summer"
}

export interface Crop {
  id: string;
  name: string;
  scientificName?: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Vegetable' | 'Fruit' | 'Cash Crop' | 'Other';
  description: string;
  imageUrl?: string;
  soilRequirements?: SoilRequirements;
  climateRequirements?: ClimateRequirements;
  growthDurationDays?: number;
  commonPests?: string[];
  harvestingTips?: string;
}
