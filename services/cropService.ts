/**
 * Crop Catalog Service
 * Placeholder service for fetching crop library data, plant details, and agronomy advice.
 */

import { Crop } from '@/types/crop';

export async function getCrops(category?: string): Promise<Crop[]> {
  // TODO: Connect to backend GET /crops API
  console.log('[cropService] getCrops called with category:', category);
  return [];
}

export async function getCropById(id: string): Promise<Crop | null> {
  // TODO: Connect to backend GET /crops/:id API
  console.log('[cropService] getCropById called with id:', id);
  return null;
}

export async function searchCrops(query: string): Promise<Crop[]> {
  // TODO: Connect to backend GET /crops/search?q=query API
  console.log('[cropService] searchCrops called with query:', query);
  return [];
}
