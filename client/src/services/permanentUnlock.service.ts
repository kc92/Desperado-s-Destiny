/**
 * Permanent Unlock Service
 * API methods for permanent unlock system (account-wide unlocks)
 */

import { apiCall } from './api';
import type {
  AccountUnlocks,
  AvailableUnlock,
  UnlockProgress,
  ClaimUnlockResponse,
} from '@desperados/shared';

/**
 * Response wrapper for API calls
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Character slots response
 */
export interface CharacterSlotsResponse {
  maxSlots: number;
  canCreate: boolean;
}

/**
 * Eligibility check response
 */
export interface EligibilityResponse {
  eligible: boolean;
  reason?: string;
  progress?: UnlockProgress;
}

/**
 * Get all account unlocks for the authenticated user
 */
export async function getAccountUnlocks(): Promise<AccountUnlocks> {
  const response = await apiCall<ApiResponse<AccountUnlocks>>('get', '/unlocks');

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Get all available unlocks (both earned and unearned) with progress
 */
export async function getAvailableUnlocks(): Promise<AvailableUnlock[]> {
  const response = await apiCall<ApiResponse<AvailableUnlock[]>>('get', '/unlocks/available');

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Get max character slots and whether user can create more characters
 */
export async function getCharacterSlots(): Promise<CharacterSlotsResponse> {
  const response = await apiCall<ApiResponse<CharacterSlotsResponse>>('get', '/unlocks/character-slots');

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Sync unlocks based on current legacy tier
 * This will automatically grant unlocks the user is eligible for based on their legacy progress
 */
export async function syncLegacyUnlocks(): Promise<AccountUnlocks> {
  const response = await apiCall<ApiResponse<AccountUnlocks>>('post', '/unlocks/sync-legacy');

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Get progress toward a specific unlock
 */
export async function getUnlockProgress(unlockId: string): Promise<UnlockProgress> {
  const response = await apiCall<ApiResponse<UnlockProgress>>('get', `/unlocks/${unlockId}/progress`);

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Check if user is eligible for a specific unlock
 */
export async function checkEligibility(unlockId: string): Promise<EligibilityResponse> {
  const response = await apiCall<ApiResponse<EligibilityResponse>>('get', `/unlocks/${unlockId}/eligibility`);

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Claim an earned unlock
 * This marks the unlock as claimed/acknowledged and may trigger additional effects
 */
export async function claimUnlock(unlockId: string): Promise<ClaimUnlockResponse> {
  const response = await apiCall<ApiResponse<ClaimUnlockResponse>>('post', `/unlocks/${unlockId}/claim`);

  if (!response.data) {
    throw new Error('Invalid response structure');
  }

  return response.data;
}

/**
 * Default export with all service methods
 */
const permanentUnlockService = {
  getAccountUnlocks,
  getAvailableUnlocks,
  getCharacterSlots,
  syncLegacyUnlocks,
  getUnlockProgress,
  checkEligibility,
  claimUnlock,
};

export default permanentUnlockService;
