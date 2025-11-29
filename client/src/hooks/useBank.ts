/**
 * useBank Hook
 * Manages bank vault operations: deposits, withdrawals, upgrades, and loan management
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Vault tier types
export type VaultTier = 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';

// Transaction types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'LOAN' | 'REPAYMENT' | 'FEE';

// Loan status
export type LoanStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAID' | 'DEFAULTED';

export interface VaultTierInfo {
  tier: VaultTier;
  name: string;
  description: string;
  maxCapacity: number;
  interestRate: number; // Daily interest percentage
  withdrawalFee: number; // Percentage
  securityLevel: number; // 1-10
  upgradeCost: number;
  requiredLevel: number;
  features: string[];
}

export interface VaultInfo {
  tier: VaultTier;
  tierName: string;
  balance: number;
  maxCapacity: number;
  interestRate: number;
  withdrawalFee: number;
  securityLevel: number;
  lastInterestPaid: string;
  pendingInterest: number;
  canUpgrade: boolean;
  nextTier?: VaultTierInfo;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export interface Loan {
  _id: string;
  amount: number;
  interestRate: number;
  totalOwed: number;
  amountPaid: number;
  remainingBalance: number;
  status: LoanStatus;
  dueDate: string;
  appliedAt: string;
  approvedAt?: string;
  payments: {
    amount: number;
    paidAt: string;
  }[];
}

export interface LoanEligibility {
  isEligible: boolean;
  maxLoanAmount: number;
  interestRate: number;
  reason?: string;
  creditScore: number;
}

export interface BankStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalInterestEarned: number;
  accountAge: number; // in days
}

interface UseBankReturn {
  vaultInfo: VaultInfo | null;
  vaultTiers: VaultTierInfo[];
  transactions: Transaction[];
  currentLoan: Loan | null;
  loanEligibility: LoanEligibility | null;
  isLoading: boolean;
  error: string | null;
  fetchVaultInfo: () => Promise<void>;
  fetchVaultTiers: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  fetchCurrentLoan: () => Promise<void>;
  checkLoanEligibility: () => Promise<void>;
  deposit: (amount: number) => Promise<{ success: boolean; message: string; newBalance?: number }>;
  withdraw: (amount: number) => Promise<{ success: boolean; message: string; newBalance?: number; fee?: number }>;
  upgradeVault: () => Promise<{ success: boolean; message: string; newTier?: VaultTier }>;
  applyForLoan: (amount: number) => Promise<{ success: boolean; message: string; loan?: Loan }>;
  repayLoan: (amount: number) => Promise<{ success: boolean; message: string; remainingBalance?: number }>;
  clearError: () => void;
}

export const useBank = (): UseBankReturn => {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [vaultTiers, setVaultTiers] = useState<VaultTierInfo[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
  const [loanEligibility, setLoanEligibility] = useState<LoanEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch vault information
  const fetchVaultInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { vault: VaultInfo } }>('/bank/vault');
      setVaultInfo(response.data.data.vault);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch vault info';
      setError(errorMessage);
      console.error('[useBank] Fetch vault info error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch available vault tiers
  const fetchVaultTiers = useCallback(async () => {
    try {
      const response = await api.get<{ data: { tiers: VaultTierInfo[] } }>('/bank/tiers');
      setVaultTiers(response.data.data.tiers || []);
    } catch (err: any) {
      console.error('[useBank] Fetch vault tiers error:', err);
    }
  }, []);

  // Fetch transaction history
  const fetchTransactions = useCallback(async (limit: number = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { transactions: Transaction[] } }>(
        `/bank/transactions?limit=${limit}`
      );
      setTransactions(response.data.data.transactions || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('[useBank] Fetch transactions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch current loan
  const fetchCurrentLoan = useCallback(async () => {
    try {
      const response = await api.get<{ data: { loan: Loan | null } }>('/bank/loan');
      setCurrentLoan(response.data.data.loan);
    } catch (err: any) {
      console.error('[useBank] Fetch current loan error:', err);
    }
  }, []);

  // Check loan eligibility
  const checkLoanEligibility = useCallback(async () => {
    try {
      const response = await api.get<{ data: { eligibility: LoanEligibility } }>('/bank/loan/eligibility');
      setLoanEligibility(response.data.data.eligibility);
    } catch (err: any) {
      console.error('[useBank] Check loan eligibility error:', err);
    }
  }, []);

  // Deposit gold
  const deposit = useCallback(async (amount: number): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    try {
      const response = await api.post<{ data: { message: string; vault: VaultInfo; transaction: Transaction } }>(
        '/bank/deposit',
        { amount }
      );
      const { vault, transaction, message } = response.data.data;

      // Update local state
      setVaultInfo(vault);
      setTransactions(prev => [transaction, ...prev]);

      // Refresh character to update gold
      await refreshCharacter();

      return { success: true, message, newBalance: vault.balance };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to deposit gold';
      setError(errorMessage);
      console.error('[useBank] Deposit error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Withdraw gold
  const withdraw = useCallback(async (amount: number): Promise<{ success: boolean; message: string; newBalance?: number; fee?: number }> => {
    try {
      const response = await api.post<{ data: { message: string; vault: VaultInfo; transaction: Transaction; fee: number } }>(
        '/bank/withdraw',
        { amount }
      );
      const { vault, transaction, fee, message } = response.data.data;

      // Update local state
      setVaultInfo(vault);
      setTransactions(prev => [transaction, ...prev]);

      // Refresh character to update gold
      await refreshCharacter();

      return { success: true, message, newBalance: vault.balance, fee };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to withdraw gold';
      setError(errorMessage);
      console.error('[useBank] Withdraw error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Upgrade vault tier
  const upgradeVault = useCallback(async (): Promise<{ success: boolean; message: string; newTier?: VaultTier }> => {
    try {
      const response = await api.post<{ data: { message: string; vault: VaultInfo } }>('/bank/upgrade');
      const { vault, message } = response.data.data;

      // Update local state
      setVaultInfo(vault);

      // Refresh character to update gold spent
      await refreshCharacter();

      return { success: true, message, newTier: vault.tier };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upgrade vault';
      setError(errorMessage);
      console.error('[useBank] Upgrade vault error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Apply for a loan
  const applyForLoan = useCallback(async (amount: number): Promise<{ success: boolean; message: string; loan?: Loan }> => {
    try {
      const response = await api.post<{ data: { message: string; loan: Loan } }>(
        '/bank/loan/apply',
        { amount }
      );
      const { loan, message } = response.data.data;

      // Update local state
      setCurrentLoan(loan);

      // Refresh character to update gold
      await refreshCharacter();

      return { success: true, message, loan };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to apply for loan';
      setError(errorMessage);
      console.error('[useBank] Apply for loan error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Repay loan
  const repayLoan = useCallback(async (amount: number): Promise<{ success: boolean; message: string; remainingBalance?: number }> => {
    try {
      const response = await api.post<{ data: { message: string; loan: Loan | null; transaction: Transaction } }>(
        '/bank/loan/repay',
        { amount }
      );
      const { loan, transaction, message } = response.data.data;

      // Update local state
      setCurrentLoan(loan);
      setTransactions(prev => [transaction, ...prev]);

      // Refresh character to update gold
      await refreshCharacter();

      return { success: true, message, remainingBalance: loan?.remainingBalance ?? 0 };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to repay loan';
      setError(errorMessage);
      console.error('[useBank] Repay loan error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    vaultInfo,
    vaultTiers,
    transactions,
    currentLoan,
    loanEligibility,
    isLoading,
    error,
    fetchVaultInfo,
    fetchVaultTiers,
    fetchTransactions,
    fetchCurrentLoan,
    checkLoanEligibility,
    deposit,
    withdraw,
    upgradeVault,
    applyForLoan,
    repayLoan,
    clearError,
  };
};

export default useBank;
