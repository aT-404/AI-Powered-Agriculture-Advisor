import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sprout,
  BarChart3,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Calendar,
  Trash2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import predictionService from '../services/predictionService';
import { PredictionItem } from '../types/prediction';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

export const PredictionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await predictionService.getPredictionById(id);
        setPrediction(res);
      } catch (err: unknown) {
        console.error('Failed to load prediction detail:', err);
        setError(`Unable to fetch prediction detail #${id} from Django backend.`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);

    try {
      await predictionService.deletePrediction(id);
      navigate('/predictions');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete prediction record.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loading text={`Fetching details for prediction #${id}...`} />;
  }

  if (error || !prediction) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="outline" onClick={() => navigate('/predictions')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to History
        </Button>
        <ErrorMessage title="Prediction Not Found" message={error || 'Prediction record does not exist.'} />
      </div>
    );
  }

  const confidencePct = Math.round(prediction.crop_prediction.confidence * 100);
  const dateFormatted = new Date(prediction.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/predictions"
          className="inline-flex items-center text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Prediction History
        </Link>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteModalOpen(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Record
        </Button>
      </div>

      {/* Main Recommended Crop Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-agri-50 text-agri-800 border border-agri-200 px-3 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-agri-600" />
              <span>Pipeline Run #{prediction.id}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Recommended Crop: <span className="text-agri-600 uppercase">{prediction.crop_prediction.crop}</span>
            </h1>
            <div className="flex items-center space-x-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {dateFormatted}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                {confidencePct}% ML Confidence
              </span>
            </div>
          </div>

          <div className="p-4 bg-agri-50 rounded-2xl text-agri-800 flex items-center justify-center">
            <Sprout className="w-16 h-16 text-agri-600" />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Yield Prediction */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Predicted Yield</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {prediction.yield_prediction ? prediction.yield_prediction.yield : 'N/A'}
          </div>
          <span className="text-xs text-gray-500">
            {prediction.yield_prediction ? prediction.yield_prediction.unit : 'Unit N/A'}
          </span>
        </div>

        {/* Market Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Mandi Market Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {prediction.market?.modal_price != null
              ? `₹${prediction.market.modal_price.toLocaleString('en-IN')}`
              : 'N/A'}
          </div>
          <span className="text-xs text-gray-500">
            {prediction.market ? `per ${prediction.market.unit || 'quintal'}` : 'Market unavailable'}
          </span>
        </div>

        {/* Est. Financial Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase">Expected Revenue</span>
            <DollarSign className="w-4 h-4 text-agri-600" />
          </div>
          <div className="text-2xl font-black text-agri-700">
            {prediction.financial_estimate?.expected_revenue != null
              ? `₹${prediction.financial_estimate.expected_revenue.toLocaleString('en-IN')}`
              : 'N/A'}
          </div>
          <span className="text-xs text-gray-500">
            {prediction.financial_estimate?.unit || 'Financial projection'}
          </span>
        </div>
      </div>

      {/* Market Information Detail */}
      {prediction.market && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
            Market Mandi Rate Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block">Mandi Market Name</span>
              <span className="font-semibold text-gray-900">{prediction.market.market || 'Agmarknet'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">District / State</span>
              <span className="font-semibold text-gray-900">
                {[prediction.market.district, prediction.market.state].filter(Boolean).join(', ') || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Min / Max Price Range</span>
              <span className="font-semibold text-gray-900">
                ₹{prediction.market.min_price} - ₹{prediction.market.max_price}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Price Date / Source</span>
              <span className="font-semibold text-gray-900">
                {prediction.market.price_date} ({prediction.market.source || 'Agmarknet'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input Features Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
          Input Soil & Climate Feature Vectors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Nitrogen (N)</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.N}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Phosphorus (P)</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.P}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Potassium (K)</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.K}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Temperature</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.temperature}°C</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Humidity</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.humidity}%</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Soil pH</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.ph}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Rainfall</span>
            <span className="text-sm font-bold text-gray-900">{prediction.input.rainfall} mm</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-500 block mb-0.5">Coordinates</span>
            <span className="text-sm font-bold text-gray-900">
              {prediction.input.latitude != null ? `${prediction.input.latitude}, ${prediction.input.longitude}` : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Prediction"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete prediction record <span className="font-bold text-gray-900">#{prediction.id}</span>?
        </p>
      </Modal>
    </div>
  );
};

export default PredictionDetails;
