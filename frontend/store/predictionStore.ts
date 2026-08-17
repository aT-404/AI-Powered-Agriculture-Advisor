/**
 * Prediction State Store (Placeholder)
 * Manages active soil parameters, prediction results, and recent history.
 * Can be integrated with Zustand, Redux Toolkit, or React Context.
 */

import { SoilData, PredictionResult, PredictionHistoryItem } from '@/types/prediction';

export interface PredictionStoreState {
  currentSoilData: SoilData;
  latestResult: PredictionResult | null;
  history: PredictionHistoryItem[];
  isPredicting: boolean;
  setSoilData: (soilData: Partial<SoilData>) => void;
  setLatestResult: (result: PredictionResult | null) => void;
  resetForm: () => void;
}

const defaultSoilData: SoilData = {
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  ph: 6.5,
  temperature: 25,
  humidity: 70,
  rainfall: 200,
};

export const initialPredictionState: PredictionStoreState = {
  currentSoilData: defaultSoilData,
  latestResult: null,
  history: [],
  isPredicting: false,
  setSoilData: (soilData) => {
    console.log('[predictionStore] setSoilData called:', soilData);
  },
  setLatestResult: (result) => {
    console.log('[predictionStore] setLatestResult called:', result);
  },
  resetForm: () => {
    console.log('[predictionStore] resetForm called');
  },
};

export default initialPredictionState;
