import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Server, 
  Terminal, 
  ShieldCheck, 
  TrendingUp, 
  Database,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { StatusBadge } from '../components/StatusBadge';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  service: 'ledger' | 'decision-engine' | 'trust-validator';
  message: string;
}

export const Status: React.FC = () => {
  const { isBackendConnected, demoMode, decisions } = useDashboard();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Generate initial mock logs on mount
  useEffect(() => {
    const services: ('ledger' | 'decision-engine' | 'trust-validator')[] = ['ledger', 'decision-engine', 'trust-validator'];
    const messages = {
      'ledger': [
        "Blockchain ledger heights synced to block #8491",
        "Cryptographic state root confirmed by consensus node-A",
        "Broadcasting block hash to backup verification nodes",
        "Writing block transaction record... SUCCESS"
      ],
      'decision-engine': [
        "Initializing neural weights configuration... DONE",
        "Awaiting pipeline instructions on port :8000",
        "Evaluating decision weights for credit model assessment",
        "Processing time calculated: 245ms for request UUID #74"
      ],
      'trust-validator': [
        "Validating block chain link signature root... VERIFIED",
        "Verifying transaction hash index #241... VERIFIED",
        "Starting integrity check... No tampering detected",
        "Auditing block signature nodes validation certificate"
      ]
    };

    const initialLogs: LogEntry[] = [];
    const now = new Date();
    
    for (let i = 10; i >= 0; i--) {
      const service = services[i % services.length];
      const serviceMsgs = messages[service];
      const message = serviceMsgs[Math.floor(Math.random() * serviceMsgs.length)];
      
      initialLogs.push({
        timestamp: new Date(now.getTime() - i * 12 * 1000).toISOString(),
        level: i % 6 === 0 ? 'warn' : (i % 8 === 0 ? 'success' : 'info'),
        service,
        message
      });
    }

    setLogs(initialLogs);
  }, []);

  // Auto scroll console to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Dynamic log streamer for Demo Mode
  useEffect(() => {
    const interval = setInterval(() => {
      const services: ('ledger' | 'decision-engine' | 'trust-validator')[] = ['ledger', 'decision-engine', 'trust-validator'];
      const msgMap = {
        'ledger': [
          "New transaction block proposed to ledger index #" + (8491 + decisions.length),
          "Consensus signature verified by validator peer #3",
          "Committed transaction block hash signature to memory database",
        ],
        'decision-engine': [
          "New incoming query request dispatched to model",
          "Confidence probability calculated successfully",
          "Selecting highest risk-adjusted utility option",
        ],
        'trust-validator': [
          "Triggered GET /verify audit verification link check",
          "Integrity check passed: Block hashes matched previous pointers",
          "Synching cryptographic block registry state",
        ]
      };

      const service = services[Math.floor(Math.random() * services.length)];
      const msgs = msgMap[service];
      const message = msgs[Math.floor(Math.random() * msgs.length)];

      const randomFlag = Math.random();
      const level = randomFlag < 0.15 ? 'success' : (randomFlag < 0.25 ? 'warn' : 'info');

      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          level,
          service,
          message
        }
      ].slice(-30)); // keep last 30 logs

    }, 6000);

    return () => clearInterval(interval);
  }, [decisions.length]);

  const formatLogTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          System Status & Nodes <Activity className="w-5 h-5 text-purple-400" />
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor active decision nodes, ledger integrity checks, and real-time execution logs.
        </p>
      </div>

      {/* Node Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Load */}
        <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" /> Host Uptime & Load
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Uptime</span>
              <span className="text-white font-mono font-bold">14d 6h 32m</span>
            </div>
            
            {/* CPU Load bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">CPU Usage</span>
                <span className="text-white font-mono">12.4%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '12.4%' }} />
              </div>
            </div>

            {/* RAM Load bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">RAM Utilized</span>
                <span className="text-white font-mono">3.8 / 8.0 GB</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '47.5%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* API Engine Health */}
        <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" /> Engine Services
          </h3>
          <div className="space-y-3">
            {/* Decision Engine */}
            <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-900">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Decision Engine
              </span>
              <span className={`font-bold ${isBackendConnected ? 'text-emerald-400' : (demoMode ? 'text-purple-400' : 'text-slate-600')}`}>
                {isBackendConnected ? 'ONLINE (200 OK)' : (demoMode ? 'SIMULATOR ACTIVE' : 'OFFLINE')}
              </span>
            </div>

            {/* Trust validator */}
            <div className="flex justify-between items-center text-xs pb-1 border-b border-slate-900">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Trust Validator
              </span>
              <span className={`font-bold ${isBackendConnected ? 'text-emerald-400' : (demoMode ? 'text-purple-400' : 'text-slate-600')}`}>
                {isBackendConnected ? 'ONLINE (200 OK)' : (demoMode ? 'SIMULATOR ACTIVE' : 'OFFLINE')}
              </span>
            </div>

            {/* Sync Delay */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Sync Propagation delay</span>
              <span className="text-white font-mono">1.2 seconds</span>
            </div>
          </div>
        </div>

        {/* Ledger Sync block height */}
        <div className="glassmorphism rounded-2xl border border-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-purple-400" /> Ledger Block parameters
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total ledger blocks</span>
              <span className="text-white font-mono font-bold">#{8491 + decisions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Consensus signature nodes</span>
              <span className="text-white font-mono">3/3 active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tamper detection status</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 font-bold">SECURED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colored Terminal Console Logger */}
      <div className="glassmorphism rounded-2xl border border-slate-900 overflow-hidden flex flex-col shadow-xl h-[400px]">
        {/* Terminal Header */}
        <div className="px-5 py-3 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold font-mono tracking-wider">cons_audit_log_stream</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        {/* Terminal logs list */}
        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-2 bg-slate-950/80 scrollbar-thin">
          {logs.map((log, idx) => {
            let lvlColor = 'text-slate-400';
            let lvlLabel = 'INFO';
            if (log.level === 'warn') {
              lvlColor = 'text-amber-500';
              lvlLabel = 'WARN';
            } else if (log.level === 'error') {
              lvlColor = 'text-rose-500';
              lvlLabel = 'FAIL';
            } else if (log.level === 'success') {
              lvlColor = 'text-emerald-400';
              lvlLabel = 'PASS';
            }

            const serviceColors = {
              'ledger': 'text-purple-400',
              'decision-engine': 'text-blue-400',
              'trust-validator': 'text-cyan-400',
            };

            return (
              <div key={idx} className="flex items-start gap-3 hover:bg-slate-900/10 py-0.5 rounded transition-all">
                <span className="text-slate-600 select-none">[{formatLogTime(log.timestamp)}]</span>
                <span className={`font-bold select-none ${lvlColor}`}>[{lvlLabel}]</span>
                <span className={`font-bold select-none ${serviceColors[log.service]}`}>[{log.service}]</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            );
          })}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};
export default Status;
