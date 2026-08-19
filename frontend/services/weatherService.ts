/**
 * Weather Service
 * Connects to Django backend /api/weather/ powered by Open-Meteo.
 */

import { apiClient } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { Coordinates, WeatherResponse, WeatherData, WeatherForecast } from '@/types/weather';

export async function fetchWeather(
  location?: string,
  coords?: Coordinates
): Promise<{ data: WeatherResponse | null; error: string | null }> {
  const queryParams = new URLSearchParams();
  if (location && location.trim()) {
    queryParams.append('location', location.trim());
  }
  if (coords?.latitude !== undefined && coords?.longitude !== undefined) {
    queryParams.append('latitude', coords.latitude.toString());
    queryParams.append('longitude', coords.longitude.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `${API_ENDPOINTS.WEATHER.GET}?${queryString}`
    : API_ENDPOINTS.WEATHER.GET;

  return apiClient<WeatherResponse>(endpoint, {
    method: 'GET',
    requiresAuth: false,
  });
}

export async function getCurrentWeather(coords?: Coordinates): Promise<WeatherData | null> {
  const { data } = await fetchWeather(undefined, coords);
  if (!data) return null;

  return {
    temperature: data.current.temperature,
    feelsLike: data.current.feels_like,
    humidity: data.current.humidity,
    rainfall: data.current.precipitation,
    windSpeed: data.current.wind_speed,
    condition: data.current.condition,
    icon: data.current.icon,
    cityName: data.location.name,
    timestamp: data.current.time,
  };
}

export async function getWeatherForecast(coords?: Coordinates): Promise<WeatherForecast | null> {
  const { data } = await fetchWeather(undefined, coords);
  if (!data) return null;

  return {
    current: {
      temperature: data.current.temperature,
      feelsLike: data.current.feels_like,
      humidity: data.current.humidity,
      rainfall: data.current.precipitation,
      windSpeed: data.current.wind_speed,
      condition: data.current.condition,
      icon: data.current.icon,
      cityName: data.location.name,
      timestamp: data.current.time,
    },
    forecast: data.forecast,
  };
}

export default {
  fetchWeather,
  getCurrentWeather,
  getWeatherForecast,
};
