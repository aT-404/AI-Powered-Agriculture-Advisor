import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Info, ArrowRight } from 'lucide-react';
import predictionService from '../services/predictionService';
import { PredictionInput } from '../types/prediction';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const PredictCrop: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    N: string;
    P: string;
    K: string;
    temperature: string;
    humidity: string;
    ph: string;
    rainfall: string;
    latitude: string;
    longitude: string;
  }>({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    latitude: '',
    longitude: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(4),
            longitude: position.coords.longitude.toFixed(4),
          }));
        },
        (err) => {
          console.warn('Geolocation failed:', err);
          setError('Unable to fetch device coordinates automatically. You can enter them manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const nVal = parseInt(formData.N, 10);
    const pVal = parseInt(formData.P, 10);
    const kVal = parseInt(formData.K, 10);
    const tempVal = parseFloat(formData.temperature);
    const humVal = parseFloat(formData.humidity);
    const phVal = parseFloat(formData.ph);
    const rainVal = parseFloat(formData.rainfall);

    if (
      isNaN(nVal) ||
      isNaN(pVal) ||
      isNaN(kVal) ||
      isNaN(tempVal) ||
      isNaN(humVal) ||
      isNaN(phVal) ||
      isNaN(rainVal)
    ) {
      setError('Please enter valid numerical values for all required soil and climate parameters.');
      return;
    }

    if (nVal < 0 || pVal < 0 || kVal < 0) {
      setError('Soil N, P, K values cannot be negative.');
      return;
    }

    if (phVal < 0 || phVal > 14) {
      setError('Soil pH must be a value between 0.0 and 14.0.');
      return;
    }

    const payload: PredictionInput = {
      N: nVal,
      P: pVal,
      K: kVal,
      temperature: tempVal,
      humidity: humVal,
      ph: phVal,
      rainfall: rainVal,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    setLoading(true);

    try {
      const result = await predictionService.createPrediction(payload);
      // Navigate to prediction result details
      navigate(`/predictions/${result.id}`, { state: { prediction: result } });
    } catch (err: unknown) {
      console.error('Prediction error:', err);
      const resData = (err as { response?: { data?: { error?: string; detail?: string } } })?.response?.data;
      setError(
        resData?.error ||
          resData?.detail ||
          'Backend prediction execution failed. Please ensure the backend ML pipeline is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-agri-100 rounded-xl text-agri-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crop & Yield Prediction</h1>
            <p className="text-xs text-gray-500">
              Input soil nutrient ratios and local climate parameters to run the Django ML prediction orchestration.
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage title="Prediction Execution Error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Soil Parameters Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              1. Soil Nutrients (NPK Ratios)
            </h2>
            <span className="text-xs text-gray-400">Ratio in mg/kg (or ppm)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nitrogen (N)"
              type="number"
              name="N"
              placeholder="e.g. 90"
              value={formData.N}
              onChange={handleChange}
              helperText="Nitrogen content in soil"
              required
            />
            <Input
              label="Phosphorus (P)"
              type="number"
              name="P"
              placeholder="e.g. 42"
              value={formData.P}
              onChange={handleChange}
              helperText="Phosphorus content in soil"
              required
            />
            <Input
              label="Potassium (K)"
              type="number"
              name="K"
              placeholder="e.g. 43"
              value={formData.K}
              onChange={handleChange}
              helperText="Potassium content in soil"
              required
            />
          </div>
        </div>

        {/* Climate & Weather Parameters Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              2. Climate & Environment
            </h2>
            <span className="text-xs text-gray-400">Environmental factors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              name="temperature"
              placeholder="e.g. 25.5"
              value={formData.temperature}
              onChange={handleChange}
              helperText="Average ambient temperature in Celsius"
              required
            />
            <Input
              label="Relative Humidity (%)"
              type="number"
              step="0.1"
              name="humidity"
              placeholder="e.g. 80.0"
              value={formData.humidity}
              onChange={handleChange}
              helperText="Relative humidity percentage"
              required
            />
            <Input
              label="Soil pH Level"
              type="number"
              step="0.1"
              min="0"
              max="14"
              name="ph"
              placeholder="e.g. 6.5"
              value={formData.ph}
              onChange={handleChange}
              helperText="Acidity/alkalinity scale (0 to 14)"
              required
            />
            <Input
              label="Annual Rainfall (mm)"
              type="number"
              step="0.1"
              name="rainfall"
              placeholder="e.g. 202.0"
              value={formData.rainfall}
              onChange={handleChange}
              helperText="Annual average rainfall in mm"
              required
            />
          </div>
        </div>

        {/* Location Parameters Card (Optional) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              3. Geographic Coordinates (Optional)
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFetchLocation}
              leftIcon={<MapPin className="w-3.5 h-3.5 text-agri-600" />}
            >
              Use GPS Location
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              name="latitude"
              placeholder="e.g. 10.0159"
              value={formData.latitude}
              onChange={handleChange}
              helperText="Decimal latitude coordinate"
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              name="longitude"
              placeholder="e.g. 76.5741"
              value={formData.longitude}
              onChange={handleChange}
              helperText="Decimal longitude coordinate"
            />
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-agri-50 border border-agri-200 rounded-xl text-agri-900 text-xs flex items-start space-x-3">
          <Info className="w-5 h-5 text-agri-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Backend Automated Pipeline:</span> Upon submitting this form, Django runs the ML crop model, yield prediction model, queries real-time Agmarknet mandi commodity rates, and computes projected financial revenue per hectare.
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Execute ML Prediction Pipeline
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PredictCrop;
