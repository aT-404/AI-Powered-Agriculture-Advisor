import React from 'react';
import { Sprout, Thermometer, Droplets, CloudRain } from 'lucide-react';
import { Crop } from '../types/crop';

interface CropCardProps {
  crop: Crop;
  onClick?: () => void;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
    >
      <div className="h-40 bg-gradient-to-br from-agri-100 to-emerald-200 relative overflow-hidden flex items-center justify-center">
        {crop.image ? (
          <img
            src={crop.image}
            alt={crop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback on image error
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center text-agri-700">
            <Sprout className="w-12 h-12 mb-1" />
            <span className="text-xs font-semibold uppercase tracking-wider">Crop Index</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-agri-600 transition-colors">
              {crop.name}
            </h3>
            <span className="text-xs italic text-gray-500 font-serif">{crop.scientific_name}</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {crop.description}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-center text-amber-600 mb-1">
              <Thermometer className="w-3.5 h-3.5 mr-1" />
              <span className="font-semibold">{crop.ideal_temperature_min}-{crop.ideal_temperature_max}°C</span>
            </div>
            <span className="text-[10px] text-gray-400">Temp</span>
          </div>

          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-center text-emerald-600 mb-1">
              <Droplets className="w-3.5 h-3.5 mr-1" />
              <span className="font-semibold">{crop.ideal_ph_min}-{crop.ideal_ph_max}</span>
            </div>
            <span className="text-[10px] text-gray-400">pH</span>
          </div>

          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <CloudRain className="w-3.5 h-3.5 mr-1" />
              <span className="font-semibold">{crop.ideal_rainfall_min}-{crop.ideal_rainfall_max}</span>
            </div>
            <span className="text-[10px] text-gray-400">Rain (mm)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
