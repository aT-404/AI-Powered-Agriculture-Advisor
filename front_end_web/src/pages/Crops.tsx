import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter } from 'lucide-react';
import cropService from '../services/cropService';
import { Crop } from '../types/crop';
import Input from '../components/Input';
import CropCard from '../components/CropCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const Crops: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCrops = async (query?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await cropService.getCrops(query);
      setCrops(data);
    } catch (err: unknown) {
      console.error('Failed to load crops catalog:', err);
      setError('Unable to load crop library records from Django backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agricultural Crop Library</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Explore scientific profiles, climate tolerances, soil pH requirements, and rainfall thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <Input
          placeholder="Search by crop name or scientific classification (e.g., Rice, Oryza sativa)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchCrops(searchQuery)} />}

      {/* Crops Grid */}
      {loading ? (
        <Loading text="Loading crop catalog records..." />
      ) : crops.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-emerald-600" />}
          title="No crops found in library"
          description={
            searchQuery
              ? `No crops matching search query "${searchQuery}".`
              : 'The backend crop database does not contain any crop profiles yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onClick={() => navigate(`/crops/${crop.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Crops;
