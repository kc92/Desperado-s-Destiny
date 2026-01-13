/**
 * Gang Service
 * API client for gang-related endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type {
  Gang,
  GangSearchFilters,
  GangBankTransaction,
  Territory,
  GangWar,
  GangUpgradeType,
  GangRole,
  GangInvitation,
} from '@desperados/shared';

/**
 * Gang service for API calls
 */
export const gangService = {
  /**
   * Create a new gang
   */
  createGang: async (name: string, tag: string, characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang }>>(
      '/gangs',
      { characterId, name, tag }
    );
    return response.data;
  },

  /**
   * Get current user's gang
   */
  getCurrentGang: async () => {
    const response = await apiClient.get<ApiResponse<{ gang: Gang | null }>>(
      '/gangs/current'
    );
    return response.data;
  },

  /**
   * Get all gangs with filters
   */
  getGangs: async (filters?: GangSearchFilters) => {
    const response = await apiClient.get<ApiResponse<{ gangs: Gang[]; total: number; hasMore: boolean }>>(
      '/gangs',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get a specific gang by ID
   */
  getGang: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ gang: Gang }>>(
      `/gangs/${gangId}`
    );
    return response.data;
  },

  /**
   * Join a gang
   */
  joinGang: async (gangId: string) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang }>>(
      `/gangs/${gangId}/join`
    );
    return response.data;
  },

  /**
   * Leave current gang
   */
  leaveGang: async () => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/gangs/leave'
    );
    return response.data;
  },

  /**
   * Kick a member from gang (officer+ only)
   */
  kickMember: async (gangId: string, characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang }>>(
      `/gangs/${gangId}/kick`,
      { characterId }
    );
    return response.data;
  },

  /**
   * Promote a member (leader only)
   */
  promoteMember: async (gangId: string, characterId: string, newRole: GangRole) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang }>>(
      `/gangs/${gangId}/promote`,
      { characterId, newRole }
    );
    return response.data;
  },

  /**
   * Deposit gold to gang bank
   */
  depositToBank: async (gangId: string, amount: number) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang; newBalance: number }>>(
      `/gangs/${gangId}/bank/deposit`,
      { amount }
    );
    return response.data;
  },

  /**
   * Withdraw gold from gang bank (officer+ only)
   */
  withdrawFromBank: async (gangId: string, amount: number) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang; newBalance: number }>>(
      `/gangs/${gangId}/bank/withdraw`,
      { amount }
    );
    return response.data;
  },

  /**
   * Get bank transaction history
   */
  getBankTransactions: async (gangId: string, limit: number = 50, offset: number = 0) => {
    const response = await apiClient.get<ApiResponse<{ transactions: GangBankTransaction[]; total: number; hasMore: boolean }>>(
      `/gangs/${gangId}/bank/transactions`,
      { params: { limit, offset } }
    );
    return response.data;
  },

  /**
   * Purchase gang upgrade (leader only)
   */
  purchaseUpgrade: async (gangId: string, upgradeType: GangUpgradeType) => {
    const response = await apiClient.post<ApiResponse<{ gang: Gang }>>(
      `/gangs/${gangId}/upgrades/purchase`,
      { upgradeType }
    );
    return response.data;
  },

  /**
   * Disband gang (leader only)
   */
  disbandGang: async (gangId: string) => {
    const response = await apiClient.delete<ApiResponse<{ fundsDistributed: number }>>(
      `/gangs/${gangId}`
    );
    return response.data;
  },

  /**
   * Check gang name availability
   */
  checkNameAvailability: async (name: string) => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      '/gangs/check-name',
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Check gang tag availability
   */
  checkTagAvailability: async (tag: string) => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      '/gangs/check-tag',
      { params: { tag } }
    );
    return response.data;
  },

  /**
   * Get all territories
   */
  getTerritories: async () => {
    const response = await apiClient.get<ApiResponse<{ territories: Territory[] }>>(
      '/territories'
    );
    return response.data;
  },

  /**
   * Get a specific territory
   */
  getTerritory: async (territoryId: string) => {
    const response = await apiClient.get<ApiResponse<{ territory: Territory }>>(
      `/territories/${territoryId}`
    );
    return response.data;
  },

  /**
   * Declare war on a territory (leader only)
   */
  declareWar: async (territoryId: string, funding: number) => {
    const response = await apiClient.post<ApiResponse<{ war: GangWar }>>(
      '/wars/declare',
      { territoryId, funding }
    );
    return response.data;
  },

  /**
   * Contribute to active war
   */
  contributeToWar: async (warId: string, amount: number) => {
    const response = await apiClient.post<ApiResponse<{ war: GangWar }>>(
      `/wars/${warId}/contribute`,
      { amount }
    );
    return response.data;
  },

  /**
   * Get all active wars
   */
  getActiveWars: async () => {
    const response = await apiClient.get<ApiResponse<{ wars: GangWar[] }>>(
      '/wars/active'
    );
    return response.data;
  },

  /**
   * Get a specific war
   */
  getWar: async (warId: string) => {
    const response = await apiClient.get<ApiResponse<{ war: GangWar }>>(
      `/wars/${warId}`
    );
    return response.data;
  },

  /**
   * Send gang invitation
   */
  sendInvitation: async (characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ invitation: GangInvitation }>>(
      '/gangs/invitations/send',
      { characterId }
    );
    return response.data;
  },

  /**
   * Get pending invitations
   */
  getPendingInvitations: async () => {
    const response = await apiClient.get<ApiResponse<{ invitations: GangInvitation[] }>>(
      '/gangs/invitations/pending'
    );
    return response.data;
  },

  /**
   * Cancel invitation
   */
  cancelInvitation: async (invitationId: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/gangs/invitations/${invitationId}`
    );
    return response.data;
  },

  /**
   * Search characters for invitation
   */
  searchCharacters: async (query: string) => {
    const response = await apiClient.get<ApiResponse<{ characters: Array<{ _id: string; name: string; level: number; gangId: string | null }> }>>(
      '/gangs/search-characters',
      { params: { query } }
    );
    return response.data;
  },
};

export default gangService;
