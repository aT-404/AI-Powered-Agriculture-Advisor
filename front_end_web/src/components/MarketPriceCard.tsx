import React from 'react';
import { Store, MapPin, Tag } from 'lucide-react';
import { MarketPrice } from '../types/market';

interface MarketPriceCardProps {
  price: MarketPrice;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({ price }) => {
  const commodityName = price.commodity || price.crop || 'Commodity';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 mb-1">
            <Tag className="w-3 h-3 mr-1" />
            {commodityName}
          </span>
          <h4 className="text-base font-bold text-gray-900">{price.market || 'Local Mandi'}</h4>
        </div>
        {price.modal_price != null && (
          <div className="text-right">
            <span className="text-xl font-extrabold text-agri-700">₹{price.modal_price.toLocaleString('en-IN')}</span>
            <span className="block text-[10px] text-gray-400 font-medium">/{price.unit || 'quintal'}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
        <span className="truncate">
          {[price.district, price.state].filter(Boolean).join(', ') || 'India'}
        </span>
      </div>

      {(price.min_price != null || price.max_price != null) && (
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-400 block text-[10px]">Min Rate</span>
            <span className="font-semibold text-gray-700">₹{price.min_price?.toLocaleString('en-IN') ?? '-'}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-400 block text-[10px]">Max Rate</span>
            <span className="font-semibold text-gray-700">₹{price.max_price?.toLocaleString('en-IN') ?? '-'}</span>
          </div>
        </div>
      )}

      {price.price_date && (
        <div className="mt-3 text-[10px] text-gray-400 text-right">
          Updated: {price.price_date}
        </div>
      )}
    </div>
  );
};

export default MarketPriceCard;
