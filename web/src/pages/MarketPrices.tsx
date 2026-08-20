import React, { useState, useEffect } from 'react';
import { TrendingUp, Filter, Search, RefreshCw, Store } from 'lucide-react';
import marketService from '../services/marketService';
import { MarketPrice, MarketFilters } from '../types/market';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import MarketPriceCard from '../components/MarketPriceCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const MarketPrices: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filters, setFilters] = useState<MarketFilters>({
    states: [],
    districts: [],
    markets: [],
    commodities: [],
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [searchCommodity, setSearchCommodity] = useState('');

  // Fetch filter dropdown options from backend
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filterData = await marketService.getMarketFilters();
        setFilters(filterData);
      } catch (err) {
        console.warn('Failed to load filter hierarchy options from backend:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch market prices from backend
  const fetchPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const commodityQuery = searchCommodity || selectedCommodity;
      const res = await marketService.getMarketPrices({
        commodity: commodityQuery || undefined,
        state: selectedState || undefined,
        district: selectedDistrict || undefined,
        market: selectedMarket || undefined,
      });

      if (Array.isArray(res)) {
        setPrices(res);
      } else if (res && Array.isArray(res.results)) {
        setPrices(res.results);
      } else {
        setPrices([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load market prices:', err);
      setError('Unable to load market mandi commodity prices from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedState, selectedDistrict, selectedMarket, selectedCommodity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrices();
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMarket('');
    setSelectedCommodity('');
    setSearchCommodity('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mandi Market Prices</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time agricultural commodity prices synced via backend Agmarknet integration.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPrices}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Rates
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPrices} />}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search commodity (e.g. Rice, Tomato, Wheat, Potato)..."
              value={searchCommodity}
              onChange={(e) => setSearchCommodity(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          <Select
            label="Commodity"
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            options={[
              { value: '', label: 'All Commodities' },
              ...filters.commodities.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={[
              { value: '', label: 'All States' },
              ...filters.states.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Select
            label="District"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            options={[
              { value: '', label: 'All Districts' },
              ...filters.districts.map((d) => ({ value: d, label: d })),
            ]}
          />

          <Select
            label="Mandi Market"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            options={[
              { value: '', label: 'All Markets' },
              ...filters.markets.map((m) => ({ value: m, label: m })),
            ]}
          />
        </div>

        {(selectedState || selectedDistrict || selectedMarket || selectedCommodity || searchCommodity) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Market Prices Grid */}
      {loading ? (
        <Loading text="Querying mandi commodity prices from backend..." />
      ) : prices.length === 0 ? (
        <EmptyState
          icon={<Store className="w-8 h-8 text-amber-600" />}
          title="No market price records found"
          description="Try broadening your commodity, state, or district search filters."
          actionLabel="Reset Search Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((item, index) => (
            <MarketPriceCard key={index} price={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
