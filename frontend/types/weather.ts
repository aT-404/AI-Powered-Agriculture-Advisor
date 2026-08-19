/**
 * Weather Service Types (Open-Meteo Integration)
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  country?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number; // in Celsius
  feels_like: number; // apparent temperature in Celsius
  humidity: number; // relative humidity in %
  wind_speed: number; // wind speed in km/h
  precipitation: number; // precipitation in mm
  rain: number; // rain in mm
  weather_code?: number;
  condition: string; // e.g. "Partly Cloudy", "Clear Sky", "Moderate Rain"
  icon: string; // Ionicons icon name e.g. "partly-sunny-outline", "rainy-outline"
  is_day?: number;
  time?: string;
}

export interface DailyForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  rain_probability: number; // in %
  precipitation: number; // in mm
  humidity?: number; // in %
  wind_speed: number; // in km/h
  weather_code?: number;
  condition: string;
  icon: string;
}

export interface WeatherResponse {
  location: LocationInfo;
  current: CurrentWeather;
  forecast: DailyForecast[];
}

// Backward compatibility interfaces
export interface WeatherData {
  temperature: number;
  feelsLike?: number;
  humidity: number;
  rainfall: number;
  windSpeed?: number;
  condition: string;
  icon?: string;
  cityName?: string;
  timestamp?: string;
}

export interface WeatherForecast {
  current: WeatherData;
  forecast: DailyForecast[];
}
