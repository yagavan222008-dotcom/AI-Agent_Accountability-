import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Clock, 
  FileSearch, 
  Menu, 
  X, 
  Play, 
  Pause,
  Server,
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { demoMode, setDemoMode, isBackendConnected, refreshData, loading } = useDashboard();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigation = [
    { name: 'Dashboard Overview', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Decision Timeline', path: '/timeline', icon: <Clock className="w-5 h-5" /> },
    { name: 'Decision Details', path: '/details', icon: <FileSearch className="w-5 h-5" /> },
    { name: 'System Status', path: '/status', icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Banner */}
      <header className="md:hidden glassmorphism flex items-center justify-between px-4 py-4 border-b border-slate-900 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
            A
          </div>
          <span className="font-bold text-sm tracking-wide text-white uppercase">TrustEngine</span>
        </Link>

        <div className="flex items-center gap-3">
          {demoMode && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
              Demo
            </span>
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glassmorphism border-r border-slate-900/60 p-6 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-xl shadow-purple-500/25">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white uppercase block">TrustEngine</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Accountability</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'}
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Demo Mode / Server Control Panel */}
        <div className="pt-6 border-t border-slate-900/80 space-y-4">
          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Mode</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`p-1.5 rounded-lg border transition-all ${
                  demoMode 
                    ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
                }`}
                title={demoMode ? "Pause Simulation" : "Start Simulation"}
              >
                {demoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {demoMode 
                ? "Simulating new incoming decisions and log validation metrics every 5 seconds."
                : "Awaiting backend connection. Turn on Demo Mode to run simulated workflows."}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 font-medium">Auto-Refresh: 15s</span>
            <button 
              onClick={refreshData}
              disabled={loading}
              className="text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Manual Reload"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto">
        {/* Top Control Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-900/60 glassmorphism sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Agent Decision Ledger
            </h1>
            {demoMode && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
                Demo Engine Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Backend connection node display */}
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-400">Node Status:</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isBackendConnected 
                    ? 'bg-emerald-500 animate-ping' 
                    : (demoMode ? 'bg-purple-500 animate-pulse' : 'bg-rose-500')
                }`} />
                <span className={`text-xs font-bold ${
                  isBackendConnected 
                    ? 'text-emerald-400' 
                    : (demoMode ? 'text-purple-400' : 'text-rose-400')
                }`}>
                  {isBackendConnected 
                    ? 'CONNECTED' 
                    : (demoMode ? 'MOCK / OFFLINE' : 'OFFLINE')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
