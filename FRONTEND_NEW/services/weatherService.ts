import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { WeatherResponse } from '../types/weather';

export const weatherService = {
  getWeather: async (params?: {
    location?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<WeatherResponse> => {
    const response = await apiClient.get<WeatherResponse>(
      API_ENDPOINTS.WEATHER,
      { params }
    );
    return response.data;
  },
};
