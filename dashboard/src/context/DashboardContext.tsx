import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DecisionRecord, SystemStats } from '../types/decision';
import { generateMockDecisions, generateSingleSimulatedDecision, calculateStats } from '../services/mockData';
import { decisionApi } from '../services/decisionApi';
import { ledgerApi } from '../services/ledgerApi';

interface Filters {
  search: string; // matches Scenario or Decision ID
  dateRange: 'all' | 'today' | '7days' | '30days';
  verificationStatus: ('verified' | 'tampered' | 'pending')[];
  minConfidence: number; // 0 to 100
}

interface DashboardContextType {
  decisions: DecisionRecord[];
  allDecisions: DecisionRecord[]; // unfiltered records
  stats: SystemStats;
  verificationStatus: 'verified' | 'tampered' | 'pending';
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  isBackendConnected: boolean;
  selectedDecision: DecisionRecord | null;
  filters: Filters;
  setDemoMode: (value: boolean) => void;
  setSelectedDecision: (record: DecisionRecord | null) => void;
  updateFilters: (updated: Partial<Filters>) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
  generateSimulatedEntry: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const INITIAL_FILTERS: Filters = {
  search: '',
  dateRange: 'all',
  verificationStatus: ['verified', 'tampered', 'pending'],
  minConfidence: 0,
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allDecisions, setAllDecisions] = useState<DecisionRecord[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    total_decisions: 0,
    verified_decisions: 0,
    failed_verification: 0,
    average_confidence: 0,
    average_processing_time: 0,
    ledger_availability: 0,
  });
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'tampered' | 'pending'>('pending');
  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('demo_mode');
    return saved ? saved === 'true' : true; // Default to true so they see data instantly!
  });
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  // Keep references to avoid re-triggering timers unnecessarily
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const decisionsRef = useRef<DecisionRecord[]>([]);

  decisionsRef.current = allDecisions;

  // Toggle Demo Mode
  const setDemoMode = (value: boolean) => {
    setDemoModeState(value);
    localStorage.setItem('demo_mode', String(value));
  };

  // Helper to generate simulated decision in Demo Mode
  const generateSimulatedEntry = useCallback(() => {
    const lastRecord = decisionsRef.current[0];
    const newRecord = generateSingleSimulatedDecision(lastRecord);
    
    // Set a custom animation flag
    const animatedRecord = { ...newRecord, _isNew: true } as any;

    setAllDecisions((prev) => {
      const updated = [animatedRecord, ...prev];
      // Keep list under 50 records to prevent memory lag
      return updated.slice(0, 50);
    });
  }, []);

  // Update Filters
  const updateFilters = (updated: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Main Data Refresh function
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      if (demoMode) {
        // Mock execution
        setIsBackendConnected(false);
        setError(null);
        if (decisionsRef.current.length === 0) {
          const seeds = generateMockDecisions(15);
          setAllDecisions(seeds);
        }
      } else {
        // Attempt actual API Connection
        const historyData = await decisionApi.getHistory();
        const trustData = await ledgerApi.verifyLedger();
        
        setAllDecisions(historyData);
        setVerificationStatus(trustData.status);
        setIsBackendConnected(true);
        setError(null);
      }
    } catch (err: any) {
      console.warn("Backend API not reachable, falling back to mock mode. Error:", err.message);
      setIsBackendConnected(false);
      
      // Fallback seeds if we have nothing loaded
      if (decisionsRef.current.length === 0) {
        const seeds = generateMockDecisions(15);
        setAllDecisions(seeds);
      }
      setVerificationStatus('verified'); // Fallback baseline
    } finally {
      setLoading(false);
    }
  }, [demoMode]);

  // Initial Fetch on mount or mode change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Client-Side Search and Filtering logic
  useEffect(() => {
    let filtered = [...allDecisions];

    // 1. Search Query (Decision ID or Scenario)
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.decision_id.toLowerCase().includes(query) ||
          r.scenario.toLowerCase().includes(query)
      );
    }

    // 2. Date Range Filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const recordDate = new Date(r.timestamp);
        const diffTime = Math.abs(now.getTime() - recordDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (filters.dateRange === 'today') {
          return diffDays <= 1;
        } else if (filters.dateRange === '7days') {
          return diffDays <= 7;
        } else if (filters.dateRange === '30days') {
          return diffDays <= 30;
        }
        return true;
      });
    }

    // 3. Verification Status Filter
    if (filters.verificationStatus.length > 0) {
      filtered = filtered.filter((r) =>
        filters.verificationStatus.includes(r.verification_status)
      );
    } else {
      filtered = []; // None selected
    }

    // 4. Confidence Score Filter (minimum slider)
    if (filters.minConfidence > 0) {
      filtered = filtered.filter(
        (r) => r.confidence * 100 >= filters.minConfidence
      );
    }

    // Newest first sorting
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setDecisions(filtered);
  }, [allDecisions, filters]);

  // Recalculate KPI Stats whenever the list of all decisions changes
  useEffect(() => {
    const computedStats = calculateStats(allDecisions);
    setStats(computedStats);
    
    // Auto sync context verification status from the latest block status
    if (allDecisions.length > 0) {
      const latest = allDecisions[0];
      setVerificationStatus(latest.verification_status);
    }
  }, [allDecisions]);

  // Setup Demo Mode Simulation Interval (5 seconds)
  useEffect(() => {
    if (demoMode) {
      demoIntervalRef.current = setInterval(() => {
        generateSimulatedEntry();
      }, 5500);
    } else {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    }

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, [demoMode, generateSimulatedEntry]);

  // Setup Trust Engine Auto-Refresh Interval (15 seconds)
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      if (!demoMode) {
        // Refresh live data
        refreshData();
      } else {
        // In demo mode, simulate dynamic verification status updates
        // Periodically refresh states to simulate background validation sync
        setAllDecisions((prev) => {
          return prev.map((r) => {
            if (r.verification_status === 'pending' && Math.random() > 0.4) {
              const verifiedStatus: 'verified' | 'tampered' = Math.random() > 0.1 ? 'verified' : 'tampered';
              return {
                ...r,
                verification_status: verifiedStatus,
                ledger_status: verifiedStatus === 'verified' ? 'committed' : 'failed'
              };
            }
            return r;
          });
        });
      }
    }, 15000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [demoMode, refreshData]);

  return (
    <DashboardContext.Provider
      value={{
        decisions,
        allDecisions,
        stats,
        verificationStatus,
        loading,
        error,
        demoMode,
        isBackendConnected,
        selectedDecision,
        filters,
        setDemoMode,
        setSelectedDecision,
        updateFilters,
        resetFilters,
        refreshData,
        generateSimulatedEntry,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
