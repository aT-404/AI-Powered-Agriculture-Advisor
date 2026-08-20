/**
 * Crop Catalog Service
 * Connects to Django backend /api/crops/ for crop library data, plant details, and agronomy advice.
 */

import { Crop } from '@/types/crop';
import { apiClient } from './api';

export async function getCrops(category?: string): Promise<Crop[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const { data, error } = await apiClient<Crop[]>(`/crops/${query}`, {
    method: 'GET',
    requiresAuth: false,
  });

  if (error || !data) {
    console.warn('[cropService] Could not fetch crops:', error);
    return [];
  }
  return data;
}

export async function getCropById(id: string): Promise<Crop | null> {
  const { data, error } = await apiClient<Crop>(`/crops/${encodeURIComponent(id)}/`, {
    method: 'GET',
    requiresAuth: false,
  });

  if (error || !data) {
    console.warn('[cropService] Could not fetch crop by id:', id, error);
    return null;
  }
  return data;
}

export async function searchCrops(query: string): Promise<Crop[]> {
  const { data, error } = await apiClient<Crop[]>(`/crops/?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    requiresAuth: false,
  });

  if (error || !data) {
    return [];
  }
  return data;
}

export default {
  getCrops,
  getCropById,
  searchCrops,
};

