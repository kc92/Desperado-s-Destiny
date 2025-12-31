/**
 * Bank Service
 * API client for Red Gulch Bank vault operations
 */

import api from './api';

// ===== Types =====

export interface VaultTier {
  tier: string;
  name: string;
  description: string;
  capacity: number | string; // string for 'Unlimited'
  upgradeCost: number;
  interestRate?: number;
  features?: string[];
  requirements?: {
    minLevel?: number;
    minReputation?: number;
  };
}

/**
 * Vault info returned from server
 * Note: Server returns flat structure with tier as string
 */
export interface Vault {
  tier: string;
  tierName: string;
  balance: number;
  capacity: number; // -1 represents unlimited
  availableSpace: number;
  nextTier: string | null;
  upgradeCost: number;
  // Optional fields for future expansion
  interestAccrued?: number;
  depositHistory?: VaultTransaction[];
  withdrawHistory?: VaultTransaction[];
}

export interface VaultTransaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  balanceAfter: number;
  timestamp: string;
  description?: string;
}

export interface BankStats {
  totalDeposits: number;
  totalVaults: number;
  averageBalance: number;
  totalInterestPaid: number;
}

// ===== Request/Response Types =====

export interface VaultInfoResponse {
  vault: Vault;
  characterGold?: number;
  canUpgrade?: boolean;
}

export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  message: string;
  vaultBalance: number;
  walletBalance: number;
}

export interface WithdrawRequest {
  amount: number;
}

export interface WithdrawResponse {
  message: string;
  vaultBalance: number;
  walletBalance: number;
}

export interface UpgradeResponse {
  message: string;
  vault: Vault;
}

// ===== Bank Service =====

export const bankService = {
  // ===== Public Routes =====

  /**
   * Get available vault tier options
   */
  async getVaultTiers(): Promise<VaultTier[]> {
    const response = await api.get<{ data: { tiers: VaultTier[] } }>('/bank/tiers');
    return response.data.data?.tiers || [];
  },

  // ===== Authenticated Routes =====

  /**
   * Get current vault information
   */
  async getVaultInfo(): Promise<VaultInfoResponse> {
    const response = await api.get<{ data: VaultInfoResponse }>('/bank/vault');
    return response.data.data;
  },

  /**
   * Upgrade vault to next tier
   */
  async upgradeVault(): Promise<UpgradeResponse> {
    const response = await api.post<{ data: UpgradeResponse }>('/bank/upgrade');
    return response.data.data;
  },

  /**
   * Deposit gold into vault
   */
  async deposit(amount: number): Promise<DepositResponse> {
    const response = await api.post<{ data: DepositResponse }>('/bank/deposit', { amount });
    return response.data.data;
  },

  /**
   * Withdraw gold from vault
   */
  async withdraw(amount: number): Promise<WithdrawResponse> {
    const response = await api.post<{ data: WithdrawResponse }>('/bank/withdraw', { amount });
    return response.data.data;
  },

  /**
   * Get total deposits stats (may be admin-only in future)
   */
  async getTotalDeposits(): Promise<BankStats> {
    const response = await api.get<{ data: BankStats }>('/bank/stats/total');
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Deposit all available gold
   */
  async depositAll(currentGold: number, maxCapacity: number, currentBalance: number): Promise<DepositResponse> {
    const availableSpace = maxCapacity - currentBalance;
    const amountToDeposit = Math.min(currentGold, availableSpace);
    return this.deposit(amountToDeposit);
  },

  /**
   * Withdraw all gold from vault
   */
  async withdrawAll(vaultBalance: number): Promise<WithdrawResponse> {
    return this.withdraw(vaultBalance);
  },

  /**
   * Check if upgrade is affordable
   */
  canAffordUpgrade(characterGold: number, nextTier: VaultTier | undefined): boolean {
    if (!nextTier) return false;
    return characterGold >= nextTier.upgradeCost;
  },

  /**
   * Calculate interest earnings projection
   */
  calculateInterestProjection(
    balance: number,
    interestRate: number,
    days: number
  ): number {
    // Simple interest calculation
    return Math.floor(balance * (interestRate / 100) * (days / 365));
  },
};

export default bankService;
