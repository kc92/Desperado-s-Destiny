/**
 * Bribe Service
 * API client for bribery system operations
 */

import { apiCall } from './api';

/**
 * Bribe result response
 */
export interface BribeResult {
  success: boolean;
  goldSpent?: number;
  accessGranted?: boolean;
  duration?: number; // Minutes of access
  message: string;
  newCriminalRep?: number;
}

/**
 * Calculate recommended bribe request params
 */
export interface CalculateRecommendedParams {
  npcFaction?: string;
  requestDifficulty: number; // 1-10
}

/**
 * Calculate recommended bribe response
 */
export interface CalculateRecommendedResponse {
  recommendedAmount: number;
  npcFaction: string;
  characterFaction: string;
  requestDifficulty: number;
  canAfford: boolean;
  characterGold: number;
}

/**
 * Building bribe options response
 */
export interface BuildingBribeOptions {
  buildingId: string;
  wantedLevel: number;
  bribeCost: number;
  canAfford: boolean;
  characterGold: number;
  accessDuration: number; // minutes
  successChance: number;
}

/**
 * Bribe guard request body
 */
export interface BribeGuardRequest {
  buildingId: string;
  amount: number;
}

/**
 * Bribe NPC request body
 */
export interface BribeNPCRequest {
  npcId: string;
  amount: number;
}

/**
 * Calculate recommended bribe amount for an NPC
 */
export async function calculateRecommended(
  params: CalculateRecommendedParams
): Promise<CalculateRecommendedResponse> {
  const queryParams = new URLSearchParams();

  if (params.npcFaction) {
    queryParams.append('npcFaction', params.npcFaction);
  }

  queryParams.append('requestDifficulty', params.requestDifficulty.toString());

  return apiCall<CalculateRecommendedResponse>(
    'get',
    `/bribe/calculate?${queryParams.toString()}`
  );
}

/**
 * Get bribe options for a specific building
 */
export async function getBuildingOptions(buildingId: string): Promise<BuildingBribeOptions> {
  return apiCall<BuildingBribeOptions>('get', `/bribe/options/${buildingId}`);
}

/**
 * Bribe a guard to bypass wanted level restrictions
 */
export async function bribeGuard(request: BribeGuardRequest): Promise<BribeResult> {
  return apiCall<BribeResult>('post', '/bribe/guard', request);
}

/**
 * Bribe an NPC for information or services
 */
export async function bribeNPC(request: BribeNPCRequest): Promise<BribeResult> {
  return apiCall<BribeResult>('post', '/bribe/npc', request);
}

const bribeService = {
  calculateRecommended,
  getBuildingOptions,
  bribeGuard,
  bribeNPC,
};

export default bribeService;
