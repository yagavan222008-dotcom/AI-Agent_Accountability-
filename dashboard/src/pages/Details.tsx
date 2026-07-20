import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileSearch, 
  Copy, 
  Check, 
  ArrowLeft, 
  History,
  Cpu,
  Hourglass,
  Link as ChainIcon,
  Code
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { StatusBadge } from '../components/StatusBadge';
import { OptionScoreBar } from '../components/OptionScoreBar';
import { CodeBlock } from '../components/CodeBlock';
import { DecisionRecord } from '../types/decision';

export const Details: React.FC = () => {
  const { decisions, selectedDecision, setSelectedDecision } = useDashboard();
  const navigate = useNavigate();

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active record to inspect (fallback to latest if none selected)
  const [record, setRecord] = useState<DecisionRecord | null>(selectedDecision);

  useEffect(() => {
    if (selectedDecision) {
      setRecord(selectedDecision);
    } else if (decisions.length > 0) {
      setRecord(decisions[0]);
    }
  }, [selectedDecision, decisions]);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleBackToTimeline = () => {
    navigate('/timeline');
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at ' + d.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (!record) {
    return (
      <div className="glassmorphism rounded-2xl p-12 text-center border border-slate-900/60 flex flex-col items-center justify-center space-y-4 animate-slide-in">
        <FileSearch className="w-12 h-12 text-slate-600" />
        <h3 className="text-lg font-bold text-slate-300">No decisions found</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Awaiting ledger database synchronization. Turn on Demo Mode to populate simulated records.
        </p>
      </div>
    );
  }

  const chosenOptObj = record.options_considered.find(
    (o) => o.option_id === record.chosen_option
  );

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToTimeline}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
            title="Back to Timeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Decision Details <FileSearch className="w-5 h-5 text-purple-400" />
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Cryptographic block verify inspection for transaction ID {record.decision_id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="flex items-center gap-3">
          <StatusBadge status={record.verification_status} size="lg" />
          {record.is_simulated && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
              Simulated Entry
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decision Logic & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scenario, Choice and Reasoning */}
          <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mb-1">
                Scenario Context
              </span>
              <h3 className="text-lg font-bold text-white">{record.scenario}</h3>
              <span className="text-xs text-slate-500 font-mono mt-1 block">Made on {formatTime(record.timestamp)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mb-1">
                Chosen Option
              </span>
              <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-500/15 text-white font-medium">
                {chosenOptObj ? chosenOptObj.description : record.chosen_option}
                <span className="text-[10px] block text-purple-400 font-mono mt-1">ID: {record.chosen_option}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block mb-1">
                Decision Reasoning Narrative
              </span>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-900 font-sans">
                {record.reasoning}
              </p>
            </div>
          </div>

          {/* Options Considered Visualizer */}
          <div className="glassmorphism rounded-2xl border border-slate-900 p-6">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" /> Options Evaluated
            </h3>
            <OptionScoreBar 
              options={record.options_considered} 
              chosenOptionId={record.chosen_option} 
            />
          </div>
        </div>

        {/* Right Column: Ledger Audit, Hashes & Raw JSON */}
        <div className="space-y-6">
          {/* Performance & Model Info */}
          <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" /> Computation Audit
            </h3>
            
            {/* Confidence Dial representation */}
            <div className="flex flex-col items-center justify-center py-4 border-b border-slate-900">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Simulated circle SVG */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Line */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`stroke-purple-500 transition-all duration-1000 ${
                      record.confidence >= 0.8 ? 'stroke-emerald-500' : (record.confidence >= 0.5 ? 'stroke-amber-500' : 'stroke-rose-500')
                    }`}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - record.confidence)}`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {Math.round(record.confidence * 100)}%
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold mt-0.5">
                    Confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Model stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Agent Model</span>
                <span className="text-sm font-semibold text-slate-200 block mt-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  {record.model}
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{record.agent_version}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Latency</span>
                <span className="text-sm font-semibold text-slate-200 block mt-1 flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-purple-400" />
                  {record.processing_time_ms} ms
                </span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">Execution delay</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Info */}
          <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ChainIcon className="w-5 h-5 text-purple-400" /> Ledger Block Audit
            </h3>
            
            {/* Decision ID */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between items-center">
                <span>Decision UUID</span>
                <button
                  onClick={() => handleCopy('uuid', record.decision_id)}
                  className="p-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Copy UUID"
                >
                  {copiedKey === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
              <div className="bg-slate-950/80 border border-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-slate-300 truncate">
                {record.decision_id}
              </div>
            </div>

            {/* Current Hash */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between items-center">
                <span>Current Ledger Block Hash</span>
                <button
                  onClick={() => handleCopy('hash', record.ledger_hash)}
                  className="p-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Copy Ledger Block Hash"
                >
                  {copiedKey === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
              <div className="bg-slate-950/80 border border-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-emerald-400/80 truncate">
                {record.ledger_hash}
              </div>
            </div>

            {/* Previous Hash */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between items-center">
                <span>Previous Block Hash (Link)</span>
                <button
                  onClick={() => handleCopy('prevHash', record.previous_hash)}
                  className="p-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                  title="Copy Previous Hash"
                >
                  {copiedKey === 'prevHash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
              <div className="bg-slate-950/80 border border-slate-900 px-3 py-2 rounded-lg font-mono text-xs text-slate-500 truncate">
                {record.previous_hash}
              </div>
            </div>
          </div>

          {/* Raw JSON View */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-400" /> Raw Decison Payload
            </h3>
            <CodeBlock data={record} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Details;
