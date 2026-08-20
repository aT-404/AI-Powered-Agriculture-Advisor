import React from 'react';
import { Sprout, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { PredictionItem } from '../types/prediction';

interface PredictionCardProps {
  prediction: PredictionItem;
  onViewDetails: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  onViewDetails,
  onDelete,
}) => {
  const dateFormatted = new Date(prediction.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const confidencePct = Math.round(prediction.crop_prediction.confidence * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-agri-100 rounded-lg text-agri-700">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">{prediction.crop_prediction.crop}</h4>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-agri-50 text-agri-700 border border-agri-200">
          {confidencePct}% Confidence
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-400 block mb-0.5">Predicted Yield</span>
          <span className="font-semibold text-gray-900">
            {prediction.yield_prediction ? `${prediction.yield_prediction.yield} ${prediction.yield_prediction.unit}` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block mb-0.5">Est. Revenue</span>
          <span className="font-semibold text-agri-700">
            {prediction.financial_estimate?.expected_revenue != null
              ? `₹${prediction.financial_estimate.expected_revenue.toLocaleString('en-IN')}`
              : 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(prediction.id)}
          className="text-xs font-semibold text-agri-600 hover:text-agri-700 inline-flex items-center transition-colors"
        >
          View Full Breakdown
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(prediction.id);
            }}
            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Delete prediction record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;
