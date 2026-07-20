export interface Option {
  option_id: string;
  description: string;
  score: number;
}

export interface DecisionRecord {
  decision_id: string;
  timestamp: string;
  options_considered: Option[];
  chosen_option: string;
  reasoning: string;
  confidence: number; // 0.0 to 1.0
  agent_version: string;
  
  // UI & Extended Trust Engine Metadata
  scenario: string;
  model: string;
  processing_time_ms: number;
  ledger_hash: string;
  previous_hash: string;
  verification_status: 'verified' | 'tampered' | 'pending';
  ledger_status: 'committed' | 'pending' | 'failed';
  is_simulated?: boolean;
}

export interface SystemStats {
  total_decisions: number;
  verified_decisions: number;
  failed_verification: number;
  average_confidence: number;
  average_processing_time: number;
  ledger_availability: number; // Uptime, e.g. 0.9998
}
