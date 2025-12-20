/**
 * Reputation Service
 * API methods for faction reputation system
 */

import { apiCall } from './api';

/**
 * Faction types
 */
export type Faction = 'settlerAlliance' | 'nahiCoalition' | 'frontera';

/**
 * Standing levels
 */
export type Standing = 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored';

/**
 * Faction standing data
 */
export interface FactionStanding {
  rep: number;
  standing: Standing;
}

/**
 * Faction standing with benefits
 */
export interface FactionStandingWithBenefits extends FactionStanding {
  benefits: string[];
  priceModifier: number;
}

/**
 * All faction standings response
 */
export interface AllStandingsResponse {
  settlerAlliance: FactionStandingWithBenefits;
  nahiCoalition: FactionStandingWithBenefits;
  frontera: FactionStandingWithBenefits;
}

/**
 * Specific faction standing response
 */
export interface FactionStandingResponse extends FactionStandingWithBenefits {
  faction: Faction;
  nextStanding: Standing | null;
  repNeededForNext: number | null;
}

/**
 * Reputation change history entry
 */
export interface ReputationHistoryEntry {
  _id: string;
  characterId: string;
  faction: Faction;
  change: number;
  reason: string;
  previousValue: number;
  newValue: number;
  timestamp: string;
}

/**
 * Reputation history response
 */
export interface ReputationHistoryResponse {
  history: ReputationHistoryEntry[];
  count: number;
}

/**
 * Standing benefits information
 */
export interface StandingBenefits {
  threshold: number;
  priceModifier: number;
  benefits: string[];
}

/**
 * Benefits guide for a single faction
 */
export interface FactionBenefitsGuide {
  hostile: StandingBenefits;
  unfriendly: StandingBenefits;
  neutral: StandingBenefits;
  friendly: StandingBenefits;
  honored: StandingBenefits;
}

/**
 * Complete benefits guide for all factions
 */
export interface BenefitsGuideResponse {
  settlerAlliance: FactionBenefitsGuide;
  nahiCoalition: FactionBenefitsGuide;
  frontera: FactionBenefitsGuide;
}

/**
 * Get all faction standings for current character
 */
export async function getAllStandings(): Promise<AllStandingsResponse> {
  const response = await apiCall<AllStandingsResponse>('get', '/reputation');
  return response;
}

/**
 * Get standing with a specific faction
 */
export async function getFactionStanding(faction: Faction): Promise<FactionStandingResponse> {
  const response = await apiCall<FactionStandingResponse>('get', `/reputation/${faction}`);
  return response;
}

/**
 * Get reputation change history
 * @param faction - Optional: Filter by specific faction
 * @param limit - Optional: Limit number of results (default 50)
 */
export async function getHistory(faction?: Faction, limit?: number): Promise<ReputationHistoryResponse> {
  const params = new URLSearchParams();
  if (faction) {
    params.append('faction', faction);
  }
  if (limit) {
    params.append('limit', limit.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/reputation/history?${queryString}` : '/reputation/history';

  const response = await apiCall<ReputationHistoryResponse>('get', url);
  return response;
}

/**
 * Get benefits guide for all factions and standings
 */
export async function getBenefitsGuide(): Promise<BenefitsGuideResponse> {
  const response = await apiCall<BenefitsGuideResponse>('get', '/reputation/benefits');
  return response;
}

/**
 * Default export: Reputation service object
 */
const reputationService = {
  getAllStandings,
  getFactionStanding,
  getHistory,
  getBenefitsGuide,
};

export default reputationService;
