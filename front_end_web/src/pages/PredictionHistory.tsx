import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Trash2, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import predictionService from '../services/predictionService';
import { PredictionItem } from '../types/prediction';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export const PredictionHistory: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await predictionService.getPredictionHistory(page, 10);
      if (Array.isArray(response)) {
        setPredictions(response);
        setTotalCount(response.length);
        setHasNext(false);
        setHasPrev(false);
      } else if (response && Array.isArray(response.results)) {
        setPredictions(response.results);
        setTotalCount(response.count);
        setHasNext(!!response.next);
        setHasPrev(!!response.previous);
      }
    } catch (err: unknown) {
      console.error('Failed to load prediction history:', err);
      setError('Unable to fetch prediction history from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    setDeleting(true);

    try {
      await predictionService.deletePrediction(deleteTargetId);
      setDeleteTargetId(null);
      fetchHistory(currentPage);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete prediction record.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter local search by crop name
  const filteredPredictions = predictions.filter((item) =>
    item.crop_prediction.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <History className="w-6 h-6 mr-2 text-agri-600" />
            Prediction History
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse and review all past ML crop & yield prediction pipeline runs from backend.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/predict')}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          New Prediction
        </Button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchHistory(currentPage)} />}

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <Input
          placeholder="Filter predictions by recommended crop name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table / List */}
      {loading ? (
        <Loading text="Loading prediction history records..." />
      ) : filteredPredictions.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-agri-600" />}
          title="No prediction records found"
          description={
            searchQuery
              ? `No prediction history matching "${searchQuery}".`
              : 'You have not created any prediction records yet.'
          }
          actionLabel="Run New Prediction"
          onAction={() => navigate('/predict')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Recommended Crop</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Expected Yield</th>
                  <th className="py-3.5 px-4">Mandi Rate</th>
                  <th className="py-3.5 px-4">Est. Revenue</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredPredictions.map((item) => {
                  const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const confPct = Math.round(item.crop_prediction.confidence * 100);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 text-gray-500 whitespace-nowrap">{dateStr}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{item.crop_prediction.crop}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-agri-50 text-agri-700 border border-agri-200">
                          {confPct}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {item.yield_prediction ? `${item.yield_prediction.yield} ${item.yield_prediction.unit}` : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {item.market?.modal_price != null ? `₹${item.market.modal_price.toLocaleString('en-IN')}` : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-bold text-agri-700">
                        {item.financial_estimate?.expected_revenue != null
                          ? `₹${item.financial_estimate.expected_revenue.toLocaleString('en-IN')}`
                          : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/predictions/${item.id}`)}
                          className="p-1.5 text-agri-600 hover:text-agri-800 hover:bg-agri-50 rounded-lg transition-colors"
                          title="View detail breakdown"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete prediction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination bar if paginated */}
          {(hasNext || hasPrev || totalCount > 10) && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Showing Page {currentPage} ({totalCount} total results)</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev && currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Prediction Record"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
              Delete Record
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete prediction record <span className="font-bold text-gray-900">#{deleteTargetId}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PredictionHistory;
