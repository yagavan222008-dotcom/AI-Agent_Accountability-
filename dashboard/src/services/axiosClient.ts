import axios from 'axios';

// Get base URLs from Vite environment variables (or fall back to defaults)
const DECISION_ENGINE_URL = import.meta.env.VITE_DECISION_ENGINE_URL || 'http://localhost:8000';
const LEDGER_ENGINE_URL = import.meta.env.VITE_LEDGER_ENGINE_URL || 'http://localhost:8001';

export const decisionClient = axios.create({
  baseURL: DECISION_ENGINE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ledgerClient = axios.create({
  baseURL: LEDGER_ENGINE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
