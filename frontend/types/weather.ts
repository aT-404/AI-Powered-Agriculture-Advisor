/**
 * Weather Service Types
 * Note: Update these interfaces after weather API provider (e.g. OpenWeatherMap, WeatherAPI) is selected.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperature: number; // in Celsius
  feelsLike?: number;
  humidity: number; // in %
  rainfall: number; // in mm
  windSpeed?: number; // in km/h
  condition: string; // e.g. "Sunny", "Rainy", "Cloudy"
  icon?: string;
  cityName?: string;
  timestamp?: string;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  rainProbability: number;
}

export interface WeatherForecast {
  current: WeatherData;
  forecast: DailyForecast[];
}
