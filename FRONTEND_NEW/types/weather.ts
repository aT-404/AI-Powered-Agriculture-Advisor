export interface WeatherCurrent {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  condition: string;
  icon: string;
  is_day: number;
  time: string;
}

export interface WeatherDailyForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  rain_probability: number;
  wind_speed: number;
  weather_code: number;
  condition: string;
  icon: string;
}

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  country?: string;
  timezone?: string;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: WeatherCurrent;
  forecast: WeatherDailyForecast[];
}
