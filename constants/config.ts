/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  appName: 'CropWise AI',
  appTagline: 'Smart Crop Prediction & Agricultural Advisory',
  version: '1.0.0',
  supportEmail: 'support@cropwise.ai',
  defaultLanguage: 'en',
  defaultCoordinates: {
    latitude: 20.5937,
    longitude: 78.9629, // Default center (India)
  },
  defaultSoilLimits: {
    nitrogen: { min: 0, max: 200, unit: 'kg/ha' },
    phosphorus: { min: 0, max: 150, unit: 'kg/ha' },
    potassium: { min: 0, max: 250, unit: 'kg/ha' },
    ph: { min: 0, max: 14, unit: 'pH' },
    temperature: { min: -10, max: 60, unit: '°C' },
    humidity: { min: 0, max: 100, unit: '%' },
    rainfall: { min: 0, max: 1000, unit: 'mm' },
  },
};

export default APP_CONFIG;
