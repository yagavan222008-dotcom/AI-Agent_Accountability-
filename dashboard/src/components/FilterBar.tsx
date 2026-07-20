import React from 'react';
import { Search, Calendar, ShieldCheck, BarChart2, RotateCcw } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const FilterBar: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useDashboard();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ dateRange: e.target.value as any });
  };

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ minConfidence: parseInt(e.target.value, 10) });
  };

  const toggleStatus = (status: 'verified' | 'tampered' | 'pending') => {
    const current = [...filters.verificationStatus];
    const index = current.indexOf(status);
    if (index > -1) {
      // Don't allow clearing all if it's the last one (keep at least one active, or allow empty)
      updateFilters({
        verificationStatus: current.filter((s) => s !== status),
      });
    } else {
      updateFilters({
        verificationStatus: [...current, status],
      });
    }
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.minConfidence > 0 ? 1 : 0) +
    (filters.verificationStatus.length < 3 ? 1 : 0);

  return (
    <div className="glassmorphism rounded-xl border border-slate-800 p-5 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Filters & Query Controls
        </h4>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-purple-400 bg-slate-900 border border-slate-800 hover:border-purple-500/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Active Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Search Text
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="ID or Scenario..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Decision Date
          </label>
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={handleDateChange}
              className="w-full appearance-none bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today / Last 24h</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verification Status
          </label>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <button
              onClick={() => toggleStatus('verified')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                filters.verificationStatus.includes('verified')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => toggleStatus('pending')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                filters.verificationStatus.includes('pending')
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => toggleStatus('tampered')}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                filters.verificationStatus.includes('tampered')
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              Tampered
            </button>
          </div>
        </div>

        {/* Confidence Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />
              Min Confidence
            </label>
            <span className="text-xs font-mono font-bold text-purple-400">{filters.minConfidence}%</span>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minConfidence}
              onChange={handleConfidenceChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
