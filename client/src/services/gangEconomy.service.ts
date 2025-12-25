/**
 * Gang Economy Service
 * API client for gang economy, bank, businesses, heists, and payroll endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface GangEconomy {
  gangId: string;
  treasury: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  accounts: GangAccount[];
  lastUpdated: Date;
}

export interface GangAccount {
  accountId: string;
  name: string;
  balance: number;
  type: 'operations' | 'war_fund' | 'savings' | 'payroll';
}

export interface GangBank {
  totalBalance: number;
  accounts: GangAccount[];
  recentTransactions: GangTransaction[];
}

export interface GangTransaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  characterId: string;
  characterName: string;
  description: string;
  createdAt: Date;
}

export interface GangBusiness {
  _id: string;
  name: string;
  type: string;
  locationId: string;
  weeklyRevenue: number;
  weeklyExpenses: number;
  netProfit: number;
}

export interface Heist {
  _id: string;
  gangId: string;
  targetId: string;
  targetName: string;
  targetType: string;
  status: 'planning' | 'ready' | 'executing' | 'completed' | 'failed' | 'cancelled';
  planningLevel: number;
  participants: HeistParticipant[];
  estimatedPayout: number;
  actualPayout?: number;
  createdAt: Date;
  executedAt?: Date;
}

export interface HeistParticipant {
  characterId: string;
  characterName: string;
  role: string;
  share: number;
}

export interface AvailableHeist {
  targetId: string;
  targetName: string;
  targetType: string;
  difficulty: number;
  estimatedPayout: number;
  requiredPlanning: number;
  minimumParticipants: number;
}

export interface GangPayroll {
  totalWeeklyPayroll: number;
  members: PayrollMember[];
  lastPaidAt: Date;
  nextPaymentAt: Date;
}

export interface PayrollMember {
  characterId: string;
  characterName: string;
  role: string;
  weeklyPay: number;
  bonuses: number;
}

/**
 * Gang Economy service for API calls
 */
export const gangEconomyService = {
  // ============================================================================
  // Economy Overview
  // ============================================================================

  /**
   * Get gang economy overview
   */
  getEconomy: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ economy: GangEconomy }>>(
      `/gangs/${gangId}/economy`
    );
    return response.data;
  },

  // ============================================================================
  // Bank Routes
  // ============================================================================

  /**
   * Get gang bank details
   */
  getBank: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ bank: GangBank }>>(
      `/gangs/${gangId}/bank`
    );
    return response.data;
  },

  /**
   * Deposit to gang bank
   */
  deposit: async (gangId: string, amount: number, accountId?: string) => {
    const response = await apiClient.post<ApiResponse<{ transaction: GangTransaction; newBalance: number }>>(
      `/gangs/${gangId}/bank/deposit`,
      { amount, accountId }
    );
    return response.data;
  },

  /**
   * Withdraw from gang bank
   */
  withdraw: async (gangId: string, amount: number, accountId?: string) => {
    const response = await apiClient.post<ApiResponse<{ transaction: GangTransaction; newBalance: number }>>(
      `/gangs/${gangId}/bank/withdraw`,
      { amount, accountId }
    );
    return response.data;
  },

  /**
   * Transfer between accounts
   */
  transfer: async (gangId: string, amount: number, fromAccountId: string, toAccountId: string) => {
    const response = await apiClient.post<ApiResponse<{ transaction: GangTransaction }>>(
      `/gangs/${gangId}/bank/transfer`,
      { amount, fromAccountId, toAccountId }
    );
    return response.data;
  },

  // ============================================================================
  // Business Routes
  // ============================================================================

  /**
   * Get gang businesses
   */
  getBusinesses: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ businesses: GangBusiness[] }>>(
      `/gangs/${gangId}/businesses`
    );
    return response.data;
  },

  /**
   * Buy a business for the gang
   */
  buyBusiness: async (gangId: string, businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ business: GangBusiness }>>(
      `/gangs/${gangId}/businesses/buy`,
      { businessId }
    );
    return response.data;
  },

  /**
   * Sell a gang business
   */
  sellBusiness: async (gangId: string, businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ salePrice: number }>>(
      `/gangs/${gangId}/businesses/${businessId}/sell`
    );
    return response.data;
  },

  // ============================================================================
  // Heist Routes
  // ============================================================================

  /**
   * Get available heist targets
   */
  getAvailableHeists: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ heists: AvailableHeist[] }>>(
      `/gangs/${gangId}/heists/available`
    );
    return response.data;
  },

  /**
   * Get gang's heists
   */
  getHeists: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ heists: Heist[] }>>(
      `/gangs/${gangId}/heists`
    );
    return response.data;
  },

  /**
   * Plan a new heist
   */
  planHeist: async (gangId: string, targetId: string, targetType: string) => {
    const response = await apiClient.post<ApiResponse<{ heist: Heist }>>(
      `/gangs/${gangId}/heists/plan`,
      { targetId, targetType }
    );
    return response.data;
  },

  /**
   * Increase heist planning level
   */
  increasePlanning: async (gangId: string, heistId: string, investmentAmount: number) => {
    const response = await apiClient.post<ApiResponse<{ heist: Heist }>>(
      `/gangs/${gangId}/heists/${heistId}/plan`,
      { investmentAmount }
    );
    return response.data;
  },

  /**
   * Execute a heist
   */
  executeHeist: async (gangId: string, heistId: string) => {
    const response = await apiClient.post<ApiResponse<{ heist: Heist; result: { success: boolean; payout: number } }>>(
      `/gangs/${gangId}/heists/${heistId}/execute`
    );
    return response.data;
  },

  /**
   * Cancel a planned heist
   */
  cancelHeist: async (gangId: string, heistId: string) => {
    const response = await apiClient.post<ApiResponse<{ refund: number }>>(
      `/gangs/${gangId}/heists/${heistId}/cancel`
    );
    return response.data;
  },

  // ============================================================================
  // Payroll Routes
  // ============================================================================

  /**
   * Get gang payroll
   */
  getPayroll: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ payroll: GangPayroll }>>(
      `/gangs/${gangId}/payroll`
    );
    return response.data;
  },

  /**
   * Set member payroll
   */
  setPayroll: async (gangId: string, characterId: string, weeklyPay: number) => {
    const response = await apiClient.post<ApiResponse<{ payroll: GangPayroll }>>(
      `/gangs/${gangId}/payroll`,
      { characterId, weeklyPay }
    );
    return response.data;
  },
};

export default gangEconomyService;
