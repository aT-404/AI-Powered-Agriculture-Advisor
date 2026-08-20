import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  Thermometer,
  Droplets,
  CloudRain,
  ArrowLeft,
  Sparkles,
  Calendar,
} from 'lucide-react';
import cropService from '../services/cropService';
import { Crop } from '../types/crop';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const CropDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCrop = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await cropService.getCropById(id);
        setCrop(res);
      } catch (err: unknown) {
        console.error('Failed to load crop detail:', err);
        setError(`Unable to fetch crop profile #${id} from Django backend.`);
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  if (loading) {
    return <Loading text={`Loading crop details #${id}...`} />;
  }

  if (error || !crop) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => navigate('/crops')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Crop Library
        </Button>
        <ErrorMessage title="Crop Not Found" message={error || 'Crop record does not exist.'} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        to="/crops"
        className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Crop Library
      </Link>

      {/* Main Crop Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-64 bg-gradient-to-r from-agri-800 to-emerald-900 relative flex items-center justify-center">
          {crop.image ? (
            <img
              src={crop.image}
              alt={crop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="text-center text-agri-100 p-6">
              <Sprout className="w-20 h-20 mx-auto mb-2 text-agri-400 animate-pulse" />
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white">{crop.name}</h2>
              <p className="text-sm italic font-serif text-agri-200">{crop.scientific_name}</p>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex items-baseline justify-between">
              <h1 className="text-3xl font-extrabold text-gray-900">{crop.name}</h1>
              <span className="text-sm italic font-serif text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {crop.scientific_name}
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">{crop.description}</p>
          </div>

          {/* Environmental Range Indicators */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-gray-500">
              Optimal Agronomic Growing Conditions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-xl">
                <div className="flex items-center justify-center text-amber-700 mb-2">
                  <Thermometer className="w-5 h-5 mr-2" />
                  <span className="font-bold text-xs uppercase">Ideal Temperature</span>
                </div>
                <div className="text-2xl font-black text-amber-900">
                  {crop.ideal_temperature_min} - {crop.ideal_temperature_max}°C
                </div>
                <span className="text-[11px] text-amber-700">Ambient growth range</span>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-xl">
                <div className="flex items-center justify-center text-emerald-700 mb-2">
                  <Droplets className="w-5 h-5 mr-2" />
                  <span className="font-bold text-xs uppercase">Soil pH Tolerance</span>
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  {crop.ideal_ph_min} - {crop.ideal_ph_max}
                </div>
                <span className="text-[11px] text-emerald-700">Soil acidity range</span>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/60 p-4 rounded-xl">
                <div className="flex items-center justify-center text-blue-700 mb-2">
                  <CloudRain className="w-5 h-5 mr-2" />
                  <span className="font-bold text-xs uppercase">Annual Rainfall</span>
                </div>
                <div className="text-2xl font-black text-blue-900">
                  {crop.ideal_rainfall_min} - {crop.ideal_rainfall_max} mm
                </div>
                <span className="text-[11px] text-blue-700">Precipitation range</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="primary"
              onClick={() => navigate('/predict')}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Test Soil Suitability for {crop.name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;
