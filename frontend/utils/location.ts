import * as Location from 'expo-location';
import { fetchWeather } from '@/services/weatherService';

export interface UserLocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
}

/**
 * Get user's current device position and optionally fetch live weather data
 */
export async function getCurrentUserLocation(): Promise<UserLocationResult> {
  // 1. Request permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // 2. Fetch position
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  let city: string | undefined;
  let region: string | undefined;
  let country: string | undefined;

  // 3. Reverse geocode if available
  try {
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (geocode && geocode.length > 0) {
      city = geocode[0].city || geocode[0].subregion || geocode[0].district;
      region = geocode[0].region;
      country = geocode[0].country;
    }
  } catch (geoErr) {
    console.warn('Reverse geocoding error:', geoErr);
  }

  // 4. Fetch live weather for these coordinates
  let temperature: number | undefined;
  let humidity: number | undefined;
  let rainfall: number | undefined;

  try {
    const { data } = await fetchWeather(undefined, { latitude, longitude });
    if (data?.current) {
      temperature = data.current.temperature;
      humidity = data.current.humidity;
      rainfall = data.current.precipitation;
      if (!city && data.location?.name) {
        city = data.location.name;
      }
    }
  } catch (wErr) {
    console.warn('Weather fetch by location failed:', wErr);
  }

  return {
    latitude,
    longitude,
    city,
    region,
    country,
    temperature,
    humidity,
    rainfall,
  };
}
