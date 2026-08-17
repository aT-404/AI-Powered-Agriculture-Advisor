/**
 * Weather Service
 * Placeholder service for fetching current weather conditions and forecasts for the farm location.
 */

import { Coordinates, WeatherData, WeatherForecast } from '@/types/weather';

export async function getCurrentWeather(coords?: Coordinates): Promise<WeatherData | null> {
  // TODO: Connect to backend GET /weather/current API
  console.log('[weatherService] getCurrentWeather called with coords:', coords);
  return null;
}

export async function getWeatherForecast(coords?: Coordinates): Promise<WeatherForecast | null> {
  // TODO: Connect to backend GET /weather/forecast API
  console.log('[weatherService] getWeatherForecast called with coords:', coords);
  return null;
}
