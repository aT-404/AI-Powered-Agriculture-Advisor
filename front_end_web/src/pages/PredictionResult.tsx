import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sprout, BarChart3, TrendingUp, DollarSign, ArrowLeft, History, Calendar, CheckCircle2 } from 'lucide-react';
import { PredictionItem } from '../types/prediction';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

export const PredictionResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const prediction = (location.state as { prediction?: PredictionItem })?.prediction;

  if (!prediction) {
    return (
      <EmptyState
        icon={<Sprout className="w-8 h-8 text-agri-600" />}
        title="No active prediction result found"
        description="Please execute a prediction or select a record from your prediction history."
        actionLabel="Go to Prediction Form"
        onAction={() => navigate('/predict')}
      />
    );
  }

  const confidencePct = Math.round(prediction.crop_prediction.confidence * 100);
  const dateFormatted = new Date(prediction.created_at).toLocaleString();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/predict')}
          className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Run Another Prediction
        </button>
        <Link
          to="/predictions"
          className="inline-flex items-center text-xs font-bold text-agri-600 hover:text-agri-700 transition-colors"
        >
          <History className="w-4 h-4 mr-1" />
          View History
        </Link>
      </div>

      {/* Recommended Crop Card */}
      <div className="bg-white rounded-2xl border border-agri-200 p-8 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sprout className="w-48 h-48 text-agri-800" />
        </div>

        <div className="inline-flex items-center space-x-2 bg-agri-100 text-agri-800 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4">
          <CheckCircle2 className="w-4 h-4 text-agri-600" />
          <span>ML Crop Recommendation</span>
        </div>

        <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-1">
          Recommended Crop
        </h3>
        <h1 className="text-4xl font-black text-agri-700 tracking-tight uppercase my-2">
          {prediction.crop_prediction.crop}
        </h1>
        <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-sm font-extrabold my-2">
          {confidencePct}% Confidence Score
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Generated on: {dateFormatted}
        </p>
      </div>

      {/* Yield & Market Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expected Yield */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Expected Yield</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {prediction.yield_prediction ? prediction.yield_prediction.yield : 'N/A'}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {prediction.yield_prediction ? prediction.yield_prediction.unit : 'Unit not specified'}
            </span>
          </div>
        </div>

        {/* Market Price */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Market Mandi Price</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">
              {prediction.market?.modal_price != null
                ? `₹${prediction.market.modal_price.toLocaleString('en-IN')}`
                : 'N/A'}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {prediction.market ? `per ${prediction.market.unit || 'quintal'} (${prediction.market.market || 'Agmarknet'})` : 'Market rate unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Revenue Projection */}
      <div className="bg-gradient-to-br from-agri-900 via-agri-800 to-emerald-950 rounded-xl p-6 text-white shadow-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-agri-800/80 rounded-full text-agri-300 mb-2">
          <DollarSign className="w-6 h-6" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-agri-300">Expected Revenue Projection</h4>
        <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
          {prediction.financial_estimate?.expected_revenue != null
            ? `₹${prediction.financial_estimate.expected_revenue.toLocaleString('en-IN')}`
            : 'N/A'}
        </div>
        <p className="text-xs text-agri-200">
          {prediction.financial_estimate?.unit || 'Revenue calculated from yield & market modal price'}
        </p>
      </div>

      {/* Input Conditions Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
          Input Soil & Environmental Conditions
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Nitrogen (N)</span>
            <span className="font-bold text-gray-900">{prediction.input.N}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Phosphorus (P)</span>
            <span className="font-bold text-gray-900">{prediction.input.P}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Potassium (K)</span>
            <span className="font-bold text-gray-900">{prediction.input.K}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Temperature</span>
            <span className="font-bold text-gray-900">{prediction.input.temperature}°C</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Humidity</span>
            <span className="font-bold text-gray-900">{prediction.input.humidity}%</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Soil pH</span>
            <span className="font-bold text-gray-900">{prediction.input.ph}</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Rainfall</span>
            <span className="font-bold text-gray-900">{prediction.input.rainfall} mm</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg">
            <span className="text-gray-400 block">Coordinates</span>
            <span className="font-bold text-gray-900">
              {prediction.input.latitude != null ? `${prediction.input.latitude}, ${prediction.input.longitude}` : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
