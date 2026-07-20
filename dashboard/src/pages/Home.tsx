import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Gauge, 
  Clock, 
  Globe,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

export const Home: React.FC = () => {
  const { decisions, stats, demoMode, setSelectedDecision } = useDashboard();
  const navigate = useNavigate();

  // Get the 5 most recent decisions
  const recentDecisions = decisions.slice(0, 5);

  const viewDetails = (record: any) => {
    setSelectedDecision(record);
    navigate('/details');
  };

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Welcome / Mode Alert */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 border border-purple-500/10 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            System Overview <TrendingUp className="w-5 h-5 text-purple-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time audit overview of the cryptographic AI decision chain.
          </p>
        </div>
        {demoMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            Generating live transactions locally.
          </div>
        )}
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Decisions"
          value={stats.total_decisions}
          icon={<Database className="w-5 h-5" />}
          description="Total blocks recorded in ledger"
          color="blue"
        />
        <MetricCard
          title="Verified Decisions"
          value={stats.verified_decisions}
          icon={<ShieldCheck className="w-5 h-5" />}
          description="Passed cryptographic integrity audits"
          color="green"
          trend={{ value: "100%", isPositive: true }}
        />
        <MetricCard
          title="Failed Verification"
          value={stats.failed_verification}
          icon={<ShieldAlert className="w-5 h-5" />}
          description="Mismatched ledger block signatures"
          color="red"
          trend={stats.failed_verification > 0 ? { value: `${stats.failed_verification} block(s)`, isPositive: false } : undefined}
        />
        <MetricCard
          title="Average Confidence"
          value={`${(stats.average_confidence * 100).toFixed(1)}%`}
          icon={<Gauge className="w-5 h-5" />}
          description="Average decision probability threshold"
          color="purple"
        />
        <MetricCard
          title="Avg Processing Time"
          value={`${Math.round(stats.average_processing_time)} ms`}
          icon={<Clock className="w-5 h-5" />}
          description="Model response delay latency"
          color="yellow"
        />
        <MetricCard
          title="Ledger Availability"
          value={`${(stats.ledger_availability * 100).toFixed(2)}%`}
          icon={<Globe className="w-5 h-5" />}
          description="Trust-node network consensus status"
          color="green"
        />
      </div>

      {/* Recent Logged Decisions Table */}
      <div className="glassmorphism rounded-2xl border border-slate-900 overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-900/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Recent Logged Decisions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Immutable audit trail of latest agent computations.</p>
          </div>
          <Link 
            to="/timeline" 
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/15 px-3 py-1.5 rounded-lg transition-all"
          >
            Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No decisions logged yet. Turn on Demo Mode or check API connections.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="px-6 py-4">Scenario Context</th>
                  <th className="px-6 py-4 hidden md:table-cell">Decision ID</th>
                  <th className="px-6 py-4">Chosen Option</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Audit Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 bg-slate-950/10">
                {recentDecisions.map((record) => {
                  const isSimulated = record.is_simulated || (record as any)._isNew;
                  
                  return (
                    <tr 
                      key={record.decision_id} 
                      className={`hover:bg-slate-900/20 transition-all cursor-pointer ${
                        (record as any)._isNew ? 'bg-purple-950/10 border-l-2 border-l-purple-500' : ''
                      }`}
                      onClick={() => viewDetails(record)}
                    >
                      <td className="px-6 py-4 font-medium text-white max-w-[240px] truncate">
                        <div className="flex flex-col">
                          <span className="truncate">{record.scenario}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{record.model}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell font-mono text-slate-500 text-xs truncate max-w-[120px]">
                        {record.decision_id}
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate">
                        {record.options_considered.find(o => o.option_id === record.chosen_option)?.description || record.chosen_option}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                record.confidence >= 0.8 ? 'bg-emerald-500' : (record.confidence >= 0.5 ? 'bg-amber-500' : 'bg-rose-500')
                              }`}
                              style={{ width: `${record.confidence * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-slate-300 font-bold">
                            {(record.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.verification_status} size="sm" />
                          {isSimulated && (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold px-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Sim
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetails(record);
                          }}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;
