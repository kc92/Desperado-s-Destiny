/**
 * Legacy Service
 * API methods for cross-character progression system
 */

import { apiCall } from './api';
import type {
  LegacyProfileResponse,
  LegacyMilestonesResponse,
  ActiveLegacyBonuses,
  NewCharacterBonuses,
  LegacyReward,
  LifetimeStats,
  CharacterLegacyContribution,
  ClaimLegacyRewardResponse,
} from '@shared/types';

/**
 * Request interface for claiming a reward
 */
export interface ClaimRewardRequest {
  rewardId: string;
  characterId: string;
}

/**
 * Request interface for updating a stat (admin/dev only)
 */
export interface UpdateStatRequest {
  statKey: string;
  value: number;
  increment?: boolean;
}

/**
 * Get complete legacy profile with tier info and bonuses
 */
export async function getLegacyProfile(): Promise<LegacyProfileResponse> {
  const response = await apiCall<LegacyProfileResponse>('get', '/legacy/profile');
  return response;
}

/**
 * Get all milestones with progress tracking
 */
export async function getMilestones(): Promise<LegacyMilestonesResponse> {
  const response = await apiCall<LegacyMilestonesResponse>('get', '/legacy/milestones');
  return response;
}

/**
 * Get active bonuses (multipliers, starting bonuses)
 */
export async function getActiveBonuses(): Promise<ActiveLegacyBonuses> {
  const response = await apiCall<ActiveLegacyBonuses>('get', '/legacy/bonuses');
  return response;
}

/**
 * Get bonuses that apply when creating a new character
 */
export async function getNewCharacterBonuses(): Promise<NewCharacterBonuses> {
  const response = await apiCall<NewCharacterBonuses>('get', '/legacy/new-character-bonuses');
  return response;
}

/**
 * Get available unclaimed rewards
 */
export async function getAvailableRewards(): Promise<LegacyReward[]> {
  const response = await apiCall<LegacyReward[]>('get', '/legacy/rewards');
  return response;
}

/**
 * Claim a legacy reward for a character
 */
export async function claimReward(request: ClaimRewardRequest): Promise<ClaimLegacyRewardResponse> {
  const response = await apiCall<ClaimLegacyRewardResponse>(
    'post',
    '/legacy/claim-reward',
    request
  );
  return response;
}

/**
 * Get lifetime stats aggregated across all characters
 */
export async function getLifetimeStats(): Promise<LifetimeStats> {
  const response = await apiCall<LifetimeStats>('get', '/legacy/stats');
  return response;
}

/**
 * Get character contribution history
 */
export async function getCharacterContributions(): Promise<CharacterLegacyContribution[]> {
  const response = await apiCall<CharacterLegacyContribution[]>('get', '/legacy/contributions');
  return response;
}

/**
 * Admin/Dev endpoint to manually update a stat (for testing)
 */
export async function updateStat(request: UpdateStatRequest): Promise<void> {
  return apiCall<void>('post', '/legacy/admin/update-stat', request);
}

const legacyService = {
  getLegacyProfile,
  getMilestones,
  getActiveBonuses,
  getNewCharacterBonuses,
  getAvailableRewards,
  claimReward,
  getLifetimeStats,
  getCharacterContributions,
  updateStat,
};

export default legacyService;
