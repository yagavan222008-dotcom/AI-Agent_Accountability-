import { ledgerClient } from './axiosClient';
import { DecisionRecord } from '../types/decision';

export interface TrustVerificationResult {
  status: 'verified' | 'tampered' | 'pending';
  last_verified_at: string;
  signature_valid: boolean;
  tampered_count: number;
}

export const ledgerApi = {
  /**
   * Fetches all block entries recorded on the ledger.
   * Path: GET /ledger
   */
  getLedger: async (): Promise<DecisionRecord[]> => {
    const response = await ledgerClient.get<DecisionRecord[]>('/ledger');
    return response.data;
  },

  /**
   * Verifies the cryptographic chain integrity of the ledger.
   * Path: GET /verify
   */
  verifyLedger: async (): Promise<TrustVerificationResult> => {
    const response = await ledgerClient.get<TrustVerificationResult>('/verify');
    return response.data;
  },

  /**
   * Fetches specific ledger details for a single decision transaction block.
   * Path: GET /ledger/:id
   */
  getLedgerById: async (id: string): Promise<DecisionRecord> => {
    const response = await ledgerClient.get<DecisionRecord>(`/ledger/${id}`);
    return response.data;
  }
};
