import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  History,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Sprout,
  DollarSign,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import predictionService from '../services/predictionService';
import cropService from '../services/cropService';
import marketService from '../services/marketService';
import { PredictionItem } from '../types/prediction';
import { Crop } from '../types/crop';
import { MarketPrice } from '../types/market';
import StatCard from '../components/StatCard';
import PredictionCard from '../components/PredictionCard';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recentPredictions, setRecentPredictions] = useState<PredictionItem[]>([]);
  const [totalPredictionCount, setTotalPredictionCount] = useState<number>(0);
  const [cropCount, setCropCount] = useState<number>(0);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user's predictions history from backend
      const historyRes = await predictionService.getPredictionHistory(1, 5);
      if (Array.isArray(historyRes)) {
        setRecentPredictions(historyRes);
        setTotalPredictionCount(historyRes.length);
      } else if (historyRes && Array.isArray(historyRes.results)) {
        setRecentPredictions(historyRes.results);
        setTotalPredictionCount(historyRes.count || historyRes.results.length);
      }

      // Fetch crops count from backend
      try {
        const crops = await cropService.getCrops();
        setCropCount(crops.length);
      } catch (cropErr) {
        console.warn('Failed to load crop catalog count:', cropErr);
      }

      // Fetch sample market prices from backend
      try {
        const pricesRes = await marketService.getMarketPrices();
        if (Array.isArray(pricesRes)) {
          setMarketPrices(pricesRes.slice(0, 3));
        } else if (pricesRes && Array.isArray(pricesRes.results)) {
          setMarketPrices(pricesRes.results.slice(0, 3));
        }
      } catch (mktErr) {
        console.warn('Failed to load market prices summary:', mktErr);
      }
    } catch (err: unknown) {
      console.error('Dashboard data fetch error:', err);
      setError('Unable to load dashboard data from backend APIs. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Fetching live agricultural metrics and predictions..." />;
  }

  const latestCrop = recentPredictions[0]?.crop_prediction?.crop || 'None Yet';
  const latestRevenue = recentPredictions[0]?.financial_estimate?.expected_revenue;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-agri-800 via-agri-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
          <Sprout className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-agri-900/40 backdrop-blur-md px-3 py-1 rounded-full text-agri-200 text-xs font-semibold mb-4 border border-agri-600/30">
            <Sparkles className="w-3.5 h-3.5 text-agri-400" />
            <span>AI Agriculture Engine Ready</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || 'Farmer'}! 👋
          </h1>
          <p className="mt-2 text-agri-100 text-sm sm:text-base leading-relaxed">
            Run soil & climate analyses to receive ML-powered crop recommendations, yield forecasts, and live Agmarknet mandi financial estimates.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/predict')}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-white text-agri-900 hover:bg-agri-50 focus:ring-white border-0 shadow-md font-bold"
            >
              Predict Crop & Yield
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/market')}
              leftIcon={<TrendingUp className="w-4 h-4 text-white" />}
              className="text-white hover:bg-white/10"
            >
              Explore Mandi Prices
            </Button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Predictions"
          value={totalPredictionCount}
          subtitle="Saved pipeline runs"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <StatCard
          title="Top Recommended"
          value={latestCrop}
          subtitle="Most recent prediction"
          icon={<Sprout className="w-5 h-5" />}
        />
        <StatCard
          title="Est. Latest Revenue"
          value={latestRevenue != null ? `₹${latestRevenue.toLocaleString('en-IN')}` : 'N/A'}
          subtitle="Per hectare projection"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard
          title="Crop Catalog"
          value={cropCount}
          subtitle="Indexed crop profiles"
          icon={<BookOpen className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid: Recent Predictions + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Predictions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <History className="w-5 h-5 mr-2 text-agri-600" />
              Recent Prediction Pipeline Runs
            </h2>
            <Link
              to="/predictions"
              className="text-xs font-bold text-agri-600 hover:text-agri-700 flex items-center transition-colors"
            >
              View History
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentPredictions.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <Sprout className="w-10 h-10 text-agri-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No predictions created yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
                Enter your soil Nitrogen, Phosphorus, Potassium ratios and local weather metrics to get instant crop & yield recommendations.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/predict')}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Run First Crop Prediction
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPredictions.map((pred) => (
                <PredictionCard
                  key={pred.id}
                  prediction={pred}
                  onViewDetails={(id) => navigate(`/predictions/${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Market Highlights & Platform Shortcuts */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-500">
              Quick Actions
            </h3>

            <Link
              to="/predict"
              className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-agri-50 hover:border-agri-200 transition-all group"
            >
              <div className="p-2 bg-agri-100 rounded-md text-agri-700 group-hover:bg-agri-600 group-hover:text-white transition-colors mr-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900">Crop Predictor</h4>
                <p className="text-[11px] text-gray-500">ML soil & climate analysis</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-600 transition-colors" />
            </Link>

            <Link
              to="/crops"
              className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-agri-50 hover:border-agri-200 transition-all group"
            >
              <div className="p-2 bg-emerald-100 rounded-md text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900">Crop Catalog</h4>
                <p className="text-[11px] text-gray-500">Ideal temperature & pH ranges</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-600 transition-colors" />
            </Link>

            <Link
              to="/market"
              className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-agri-50 hover:border-agri-200 transition-all group"
            >
              <div className="p-2 bg-amber-100 rounded-md text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors mr-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900">Mandi Market Prices</h4>
                <p className="text-[11px] text-gray-500">Live commodity price index</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri-600 transition-colors" />
            </Link>
          </div>

          {/* Mandi Price Highlights */}
          {marketPrices.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1.5 text-agri-600" />
                  Mandi Price Snapshot
                </h3>
                <Link to="/market" className="text-[11px] font-semibold text-agri-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {marketPrices.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-gray-50 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{item.commodity || item.crop}</span>
                      <span className="text-[10px] text-gray-500">{item.market || item.district}</span>
                    </div>
                    {item.modal_price && (
                      <span className="font-extrabold text-agri-700">
                        ₹{item.modal_price.toLocaleString('en-IN')}/{item.unit || 'qtl'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
