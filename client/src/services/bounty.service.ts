/**
 * Bounty Service
 * API client for bounty and wanted system operations
 */

import api from './api';

// ===== Types =====

export interface Bounty {
  _id: string;
  targetId: string;
  targetName: string;
  placedById: string;
  placedByName: string;
  amount: number;
  reason?: string;
  status: 'active' | 'collected' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
  collectedBy?: string;
  collectedAt?: string;
}

export interface WantedLevel {
  characterId: string;
  characterName: string;
  wantedLevel: number;
  totalBounty: number;
  activeBounties: Bounty[];
  crimes: Crime[];
  reputation: 'outlaw' | 'neutral' | 'lawful';
  lastCrimeDate?: string;
}

export interface Crime {
  _id: string;
  type: 'murder' | 'theft' | 'assault' | 'vandalism' | 'trespassing';
  severity: number;
  location: string;
  timestamp: string;
  witnessed: boolean;
  description?: string;
}

export interface BountyBoard {
  bounties: BountyListing[];
  totalBounties: number;
  totalRewards: number;
  location?: string;
}

export interface BountyListing {
  _id: string;
  targetId: string;
  targetName: string;
  targetLevel: number;
  targetLocation?: string;
  amount: number;
  reason?: string;
  createdAt: string;
  expiresAt: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  isOnline: boolean;
}

export interface MostWantedEntry {
  rank: number;
  characterId: string;
  characterName: string;
  wantedLevel: number;
  totalBounty: number;
  activeBounties: number;
  faction: string;
  lastSeen?: string;
  isOnline: boolean;
}

export interface BountyHunterCheck {
  shouldSpawn: boolean;
  hunterId?: string;
  hunterName?: string;
  hunterLevel?: number;
  bountyAmount?: number;
  spawnChance?: number;
  wantedLevel: number;
  message?: string;
}

// ===== Request/Response Types =====

export interface PlaceBountyRequest {
  targetId: string;
  amount: number;
  reason?: string;
}

export interface PlaceBountyResponse {
  success: boolean;
  bounty: Bounty;
  newCharacterGold: number;
  message: string;
}

export interface CollectBountyRequest {
  bountyId: string;
}

export interface CollectBountyResponse {
  success: boolean;
  bounty: Bounty;
  reward: number;
  bonus?: number;
  newCharacterGold: number;
  reputationGain?: number;
  message: string;
}

export interface GetBountyBoardParams {
  limit?: number;
  location?: string;
}

export interface GetMostWantedParams {
  limit?: number;
}

// ===== Bounty Service =====

export const bountyService = {
  // ===== Authenticated Routes =====

  /**
   * Get wanted level for current character
   */
  async getWantedLevel(): Promise<WantedLevel> {
    const response = await api.get<{ data: WantedLevel }>('/bounty/wanted');
    return response.data.data;
  },

  /**
   * Get bounty board (available bounties to hunt)
   */
  async getBountyBoard(params?: GetBountyBoardParams): Promise<BountyBoard> {
    const response = await api.get<{ data: BountyBoard }>('/bounty/board', { params });
    return response.data.data;
  },

  /**
   * Get most wanted criminals leaderboard
   */
  async getMostWanted(params?: GetMostWantedParams): Promise<MostWantedEntry[]> {
    const response = await api.get<{ data: { mostWanted: MostWantedEntry[] } }>(
      '/bounty/most-wanted',
      { params }
    );
    return response.data.data?.mostWanted || [];
  },

  /**
   * Check if bounty hunter should spawn for current character
   */
  async checkBountyHunter(): Promise<BountyHunterCheck> {
    const response = await api.get<{ data: BountyHunterCheck }>('/bounty/hunter-check');
    return response.data.data;
  },

  /**
   * Get active bounties for a specific character
   */
  async getCharacterBounties(characterId: string): Promise<Bounty[]> {
    const response = await api.get<{ data: { bounties: Bounty[] } }>(
      `/bounty/${characterId}`
    );
    return response.data.data?.bounties || [];
  },

  /**
   * Place a bounty on another player
   */
  async placeBounty(request: PlaceBountyRequest): Promise<PlaceBountyResponse> {
    const response = await api.post<{ data: PlaceBountyResponse }>(
      '/bounty/place',
      request
    );
    return response.data.data;
  },

  /**
   * Collect a bounty by bringing in the target
   */
  async collectBounty(request: CollectBountyRequest): Promise<CollectBountyResponse> {
    const response = await api.post<{ data: CollectBountyResponse }>(
      '/bounty/collect',
      request
    );
    return response.data.data;
  },

  /**
   * Admin: Cancel all bounties for a character
   */
  async cancelBounties(characterId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ data: { success: boolean; message: string } }>(
      `/bounty/cancel/${characterId}`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character is wanted
   */
  isWanted(wantedLevel: WantedLevel): boolean {
    return wantedLevel.wantedLevel > 0 && wantedLevel.activeBounties.length > 0;
  },

  /**
   * Get total bounty amount for a character
   */
  getTotalBounty(bounties: Bounty[]): number {
    return bounties.reduce((total, bounty) => total + bounty.amount, 0);
  },

  /**
   * Calculate bounty difficulty based on target level
   */
  calculateDifficulty(
    targetLevel: number,
    characterLevel: number
  ): 'easy' | 'medium' | 'hard' | 'deadly' {
    const levelDiff = targetLevel - characterLevel;
    if (levelDiff <= -5) return 'easy';
    if (levelDiff <= 0) return 'medium';
    if (levelDiff <= 5) return 'hard';
    return 'deadly';
  },

  /**
   * Filter bounty board by difficulty
   */
  filterByDifficulty(
    bounties: BountyListing[],
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
  ): BountyListing[] {
    return bounties.filter(bounty => bounty.difficulty === difficulty);
  },

  /**
   * Filter bounty board by online status
   */
  filterByOnlineStatus(bounties: BountyListing[], onlineOnly: boolean): BountyListing[] {
    return onlineOnly ? bounties.filter(bounty => bounty.isOnline) : bounties;
  },

  /**
   * Sort bounties by reward amount
   */
  sortByReward(bounties: BountyListing[], descending: boolean = true): BountyListing[] {
    return [...bounties].sort((a, b) =>
      descending ? b.amount - a.amount : a.amount - b.amount
    );
  },

  /**
   * Calculate estimated bounty hunter spawn chance
   */
  calculateSpawnChance(wantedLevel: number): number {
    // Base 5% chance per wanted level
    const baseChance = Math.min(wantedLevel * 5, 50);
    return baseChance;
  },

  /**
   * Check if bounty is expiring soon (within 1 hour)
   */
  isExpiringSoon(bounty: Bounty | BountyListing): boolean {
    const expiresAt = new Date(bounty.expiresAt).getTime();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return expiresAt - now < oneHour;
  },

  /**
   * Format wanted level as reputation string
   */
  formatWantedLevel(level: number): string {
    if (level === 0) return 'Lawful Citizen';
    if (level <= 2) return 'Petty Criminal';
    if (level <= 5) return 'Known Outlaw';
    if (level <= 10) return 'Notorious Bandit';
    return 'Public Enemy';
  },

  /**
   * Get crime severity description
   */
  getCrimeSeverityLabel(severity: number): string {
    if (severity <= 1) return 'Minor';
    if (severity <= 3) return 'Moderate';
    if (severity <= 5) return 'Serious';
    return 'Heinous';
  },
};

export default bountyService;
