import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  SearchX,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { DecisionRecord } from '../types/decision';

export const Timeline: React.FC = () => {
  const { decisions, setSelectedDecision } = useDashboard();
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Clipboard copy feedbacks
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset to page 1 when filter size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [decisions.length]);

  const totalPages = Math.max(1, Math.ceil(decisions.length / itemsPerPage));
  const paginatedDecisions = decisions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll back to top of filter bar
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToDetails = (record: DecisionRecord) => {
    setSelectedDecision(record);
    navigate('/details');
  };

  // Helper for formatting timestamp in localized readable string
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + d.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Decision Timeline <Clock className="w-5 h-5 text-purple-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse, search, and verify all decisions recorded on the system blockchain ledger.
          </p>
        </div>
      </div>

      {/* Advanced Client-Side Filters */}
      <FilterBar />

      {/* Timeline List Content */}
      <div className="space-y-6">
        {paginatedDecisions.length === 0 ? (
          <div className="glassmorphism rounded-2xl p-12 text-center border border-slate-900/60 flex flex-col items-center justify-center space-y-4">
            <SearchX className="w-12 h-12 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-300">No decisions match filters</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Try adjusting search terms, reducing the minimum confidence setting, or checking more verification check boxes.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-slate-900 ml-4 md:ml-6 pl-6 md:pl-10 space-y-8 py-2">
            {paginatedDecisions.map((record) => {
              const chosenOptObj = record.options_considered.find(
                (o) => o.option_id === record.chosen_option
              );
              const isSimulated = record.is_simulated || (record as any)._isNew;

              // Setup badge style for Ledger Status
              const ledgerStatusColors = {
                committed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
                pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                failed: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
              };

              return (
                <div 
                  key={record.decision_id} 
                  className={`relative group bg-slate-950/40 rounded-2xl border border-slate-900 p-6 hover:bg-slate-900/25 hover:border-slate-800 transition-all duration-300 transform hover:-translate-x-1 cursor-pointer shadow-lg hover:shadow-xl ${
                    (record as any)._isNew ? 'bg-purple-950/15 border-purple-500/20 glow-purple animate-slide-in' : ''
                  }`}
                  onClick={() => navigateToDetails(record)}
                >
                  {/* Timeline bullet dot */}
                  <span className={`absolute -left-[31px] md:-left-[47px] top-7 w-3.5 h-3.5 rounded-full border-2 border-slate-950 transition-all duration-300 group-hover:scale-125 ${
                    record.verification_status === 'tampered'
                      ? 'bg-rose-500 glow-red ring-4 ring-rose-500/15'
                      : (record.verification_status === 'pending' ? 'bg-amber-500 ring-4 ring-amber-500/15' : 'bg-purple-500 glow-purple ring-4 ring-purple-500/15')
                  }`} />

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-white group-hover:text-purple-400 transition-all">
                        {record.scenario}
                      </h3>
                      {isSimulated && (
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Simulated
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-500 font-mono">
                      {formatTime(record.timestamp)}
                    </span>
                  </div>

                  {/* Core Card Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                    {/* Left: Chosen Decision */}
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Decision Chosen</span>
                      <p className="text-sm font-semibold text-slate-200">
                        {chosenOptObj ? chosenOptObj.description : record.chosen_option}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        <span className="font-semibold text-slate-300">Reasoning:</span> {record.reasoning}
                      </p>
                    </div>

                    {/* Right: Confidence gauge */}
                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-3 p-4 rounded-xl bg-slate-950 border border-slate-900/60 md:border-transparent md:bg-transparent">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Confidence</span>
                        <span className="text-xl font-bold font-mono text-white block mt-0.5">
                          {(record.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Linear bar index */}
                      <div className="w-24 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full ${
                            record.confidence >= 0.8 ? 'bg-emerald-500 glow-green' : (record.confidence >= 0.5 ? 'bg-amber-500' : 'bg-rose-500 glow-red')
                          }`}
                          style={{ width: `${record.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom details block (Ledger Audit) */}
                  <div className="pt-4 border-t border-slate-900/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                    {/* Decision ID */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">ID:</span>
                      <button
                        onClick={(e) => handleCopy(e, record.decision_id)}
                        className="font-mono text-slate-400 hover:text-white transition-all flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-900 hover:border-slate-800"
                        title="Copy Decision UUID"
                      >
                        <span className="truncate max-w-[120px] sm:max-w-none">{record.decision_id}</span>
                        {copiedId === record.decision_id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-600" />
                        )}
                      </button>
                    </div>

                    {/* Badges section */}
                    <div className="flex items-center gap-3">
                      {/* Ledger Status Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[11px]">Ledger:</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${ledgerStatusColors[record.ledger_status]}`}>
                          {record.ledger_status}
                        </span>
                      </div>

                      {/* Verification Badge */}
                      <StatusBadge status={record.verification_status} size="sm" />

                      {/* Navigation Link Icon */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToDetails(record);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-purple-500/5 border border-transparent hover:border-purple-500/10 transition-all ml-1"
                        title="View Detailed Cryptographic Ledger Block"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-900 pt-6 px-4">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-300">
              {Math.min(currentPage * itemsPerPage, decisions.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-300">{decisions.length}</span> decisions
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Render numbered buttons */}
            <div className="hidden sm:flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg border font-mono text-xs font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-purple-600 text-white border-purple-500 glow-purple'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Timeline;
