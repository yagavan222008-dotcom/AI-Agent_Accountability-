import { decisionClient } from './axiosClient';
import { DecisionRecord, SystemStats } from '../types/decision';

export const decisionApi = {
  /**
   * Fetches the full historical log of decisions made by the engine.
   * Path: GET /history
   */
  getHistory: async (): Promise<DecisionRecord[]> => {
    const response = await decisionClient.get('/ledger/chain');
    return response.data;
  },

  /**
   * Fetches the single most recent decision record.
   * Path: GET /latest
   */
  getLatest: async (): Promise<DecisionRecord> => {
    const response = await decisionClient.get<DecisionRecord>('/latest');
    return response.data;
  },

  /**
   * Fetches general aggregate system statistics.
   * Path: GET /stats
   */
  getStats: async (): Promise<SystemStats> => {
    const response = await decisionClient.get<SystemStats>('/stats');
    return response.data;
  }
};
