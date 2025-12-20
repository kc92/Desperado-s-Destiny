/**
 * Legendary Hunt Service
 * API client for legendary animal hunt operations
 */

import api from './api';

// ===== Types =====

export type LegendaryCategory = 'predator' | 'prey' | 'mythical' | 'extinct';

export type DiscoveryStatus = 'unknown' | 'rumored' | 'tracked' | 'discovered' | 'defeated';

export type CombatAction = 'attack' | 'special' | 'defend' | 'item' | 'flee';

export interface LegendaryAnimal {
  _id: string;
  name: string;
  description: string;
  category: LegendaryCategory;
  location: string;
  level: number;
  health: number;
  maxHealth: number;
  abilities: LegendaryAbility[];
  resistances: {
    physical?: number;
    fire?: number;
    ice?: number;
    poison?: number;
  };
  weaknesses: string[];
  behaviorPattern: string;
  discoveryHints: string[];
  lore: string;
  rewards: {
    experience: number;
    gold: number;
    items: { itemId: string; name: string; rarity: string; dropRate: number }[];
    trophy: {
      name: string;
      description: string;
      bonuses: { stat: string; value: number }[];
    };
  };
}

export interface LegendaryAbility {
  name: string;
  description: string;
  damage?: number;
  cooldown?: number;
  effect?: string;
}

export interface LegendaryProgress {
  legendaryId: string;
  discoveryStatus: DiscoveryStatus;
  cluesFound: number;
  rumorsHeard: number;
  encountersAttempted: number;
  encountersWon: number;
  encountersLost: number;
  bestTime?: number;
  hasTrophy: boolean;
  lastEncounterDate?: string;
}

export interface LegendaryTrophy {
  _id: string;
  legendaryId: string;
  legendaryName: string;
  category: LegendaryCategory;
  defeatedAt: string;
  completionTime: number;
  bonuses: { stat: string; value: number }[];
  equipped: boolean;
}

export interface HuntSession {
  _id: string;
  legendaryId: string;
  characterId: string;
  status: 'active' | 'completed' | 'fled' | 'defeated';
  turnCount: number;
  damageDealt: number;
  damageTaken: number;
  itemsUsed: number;
  startTime: string;
  endTime?: string;
  legendaryHealth: number;
  characterHealth: number;
  combatLog: CombatLogEntry[];
  result?: {
    victory: boolean;
    rewards?: {
      experience: number;
      gold: number;
      items: { itemId: string; name: string; rarity: string }[];
    };
  };
}

export interface CombatLogEntry {
  turn: number;
  timestamp: string;
  action: string;
  damage?: number;
  effect?: string;
  description: string;
}

export interface DifficultyRating {
  overall: number;
  factors: {
    levelDifference: number;
    equipmentScore: number;
    skillsScore: number;
    recommendation: string;
  };
  estimatedWinChance: number;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  completionTime: number;
  defeatedAt: string;
  turnsUsed: number;
}

// ===== Request/Response Types =====

export interface GetLegendaryAnimalsRequest {
  category?: LegendaryCategory;
  location?: string;
  discoveryStatus?: DiscoveryStatus;
}

export interface GetLegendaryAnimalsResponse {
  legendaries: (LegendaryAnimal & { progress: LegendaryProgress })[];
  totalCount: number;
}

export interface GetTrophiesResponse {
  trophies: LegendaryTrophy[];
  totalDefeated: number;
}

export interface GetLegendaryAnimalResponse {
  legendary: LegendaryAnimal;
  progress: LegendaryProgress;
  canInitiate: boolean;
  requiredLevel?: number;
}

export interface DiscoverClueRequest {
  location: string;
}

export interface DiscoverClueResponse {
  clueFound: boolean;
  clueDescription?: string;
  progress: LegendaryProgress;
  message: string;
}

export interface HearRumorRequest {
  npcId: string;
}

export interface HearRumorResponse {
  rumorHeard: boolean;
  rumorText?: string;
  progress: LegendaryProgress;
  message: string;
}

export interface InitiateHuntRequest {
  location: string;
}

export interface InitiateHuntResponse {
  session: HuntSession;
  legendary: LegendaryAnimal;
  message: string;
}

export interface ClaimRewardsRequest {
  sessionId?: string;
}

export interface ClaimRewardsResponse {
  rewards: {
    experience: number;
    gold: number;
    items: { itemId: string; name: string; rarity: string }[];
    trophy?: LegendaryTrophy;
  };
  message: string;
}

export interface ExecuteTurnRequest {
  action: CombatAction;
  itemId?: string;
}

export interface ExecuteTurnResponse {
  session: HuntSession;
  turnResult: {
    playerAction: string;
    playerDamage?: number;
    enemyAction?: string;
    enemyDamage?: number;
    effects?: string[];
    combatOver: boolean;
    victory?: boolean;
  };
}

// ===== Legendary Hunt Service =====

export const legendaryHuntService = {
  // ===== Discovery & Tracking Routes =====

  /**
   * Get all legendary animals with character's progress
   */
  async getLegendaryAnimals(filters?: GetLegendaryAnimalsRequest): Promise<GetLegendaryAnimalsResponse> {
    const response = await api.get<{ data: GetLegendaryAnimalsResponse }>('/legendary-hunts', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get all legendary trophies for character
   */
  async getTrophies(): Promise<GetTrophiesResponse> {
    const response = await api.get<{ data: GetTrophiesResponse }>('/legendary-hunts/trophies');
    return response.data.data;
  },

  /**
   * Get specific legendary animal with character's progress
   */
  async getLegendaryAnimal(legendaryId: string): Promise<GetLegendaryAnimalResponse> {
    const response = await api.get<{ data: GetLegendaryAnimalResponse }>(
      `/legendary-hunts/${legendaryId}`
    );
    return response.data.data;
  },

  /**
   * Get difficulty rating for a legendary hunt
   */
  async getDifficultyRating(legendaryId: string): Promise<DifficultyRating> {
    const response = await api.get<{ data: DifficultyRating }>(
      `/legendary-hunts/${legendaryId}/difficulty`
    );
    return response.data.data;
  },

  /**
   * Get leaderboard for a legendary animal
   */
  async getLeaderboard(legendaryId: string, limit?: number): Promise<LeaderboardEntry[]> {
    const params = limit ? { limit } : {};
    const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
      `/legendary-hunts/${legendaryId}/leaderboard`,
      { params }
    );
    return response.data.data?.leaderboard || [];
  },

  /**
   * Discover a clue for a legendary animal at a location
   */
  async discoverClue(legendaryId: string, location: string): Promise<DiscoverClueResponse> {
    const response = await api.post<{ data: DiscoverClueResponse }>(
      `/legendary-hunts/${legendaryId}/discover-clue`,
      { location }
    );
    return response.data.data;
  },

  /**
   * Hear a rumor about a legendary animal from an NPC
   */
  async hearRumor(legendaryId: string, npcId: string): Promise<HearRumorResponse> {
    const response = await api.post<{ data: HearRumorResponse }>(
      `/legendary-hunts/${legendaryId}/hear-rumor`,
      { npcId }
    );
    return response.data.data;
  },

  /**
   * Initiate a hunt against a legendary animal
   */
  async initiateHunt(legendaryId: string, location: string): Promise<InitiateHuntResponse> {
    const response = await api.post<{ data: InitiateHuntResponse }>(
      `/legendary-hunts/${legendaryId}/initiate`,
      { location }
    );
    return response.data.data;
  },

  /**
   * Claim rewards after defeating a legendary (if not auto-claimed)
   */
  async claimRewards(legendaryId: string, sessionId?: string): Promise<ClaimRewardsResponse> {
    const response = await api.post<{ data: ClaimRewardsResponse }>(
      `/legendary-hunts/${legendaryId}/claim-rewards`,
      { sessionId }
    );
    return response.data.data;
  },

  // ===== Combat Session Routes =====

  /**
   * Get current hunt session status
   */
  async getHuntSession(sessionId: string): Promise<HuntSession> {
    const response = await api.get<{ data: { session: HuntSession } }>(
      `/legendary-hunts/combat/${sessionId}`
    );
    return response.data.data.session;
  },

  /**
   * Execute a turn in legendary combat
   */
  async executeHuntTurn(sessionId: string, request: ExecuteTurnRequest): Promise<ExecuteTurnResponse> {
    const response = await api.post<{ data: ExecuteTurnResponse }>(
      `/legendary-hunts/combat/${sessionId}/attack`,
      request
    );
    return response.data.data;
  },

  /**
   * Abandon a hunt session
   */
  async abandonHuntSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete<{ data: { message: string } }>(
      `/legendary-hunts/combat/${sessionId}`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if legendary is discovered
   */
  isDiscovered(progress: LegendaryProgress): boolean {
    return progress.discoveryStatus === 'discovered' || progress.discoveryStatus === 'defeated';
  },

  /**
   * Check if legendary is defeated
   */
  isDefeated(progress: LegendaryProgress): boolean {
    return progress.discoveryStatus === 'defeated';
  },

  /**
   * Get discovery progress percentage
   */
  getDiscoveryProgressPercent(progress: LegendaryProgress): number {
    const statusValues: Record<DiscoveryStatus, number> = {
      unknown: 0,
      rumored: 25,
      tracked: 50,
      discovered: 75,
      defeated: 100,
    };
    return statusValues[progress.discoveryStatus] || 0;
  },

  /**
   * Calculate win rate
   */
  getWinRate(progress: LegendaryProgress): number {
    const totalAttempts = progress.encountersAttempted;
    if (totalAttempts === 0) return 0;
    return Math.floor((progress.encountersWon / totalAttempts) * 100);
  },

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: LegendaryCategory): string {
    const categoryNames: Record<LegendaryCategory, string> = {
      predator: 'Predator',
      prey: 'Prey',
      mythical: 'Mythical',
      extinct: 'Extinct',
    };
    return categoryNames[category] || category;
  },

  /**
   * Get difficulty color/tier based on rating
   */
  getDifficultyTier(rating: number): {
    tier: string;
    color: string;
    label: string;
  } {
    if (rating >= 90) {
      return { tier: 'legendary', color: '#ff0000', label: 'Legendary' };
    } else if (rating >= 70) {
      return { tier: 'epic', color: '#a335ee', label: 'Epic' };
    } else if (rating >= 50) {
      return { tier: 'hard', color: '#ff8000', label: 'Hard' };
    } else if (rating >= 30) {
      return { tier: 'moderate', color: '#ffd700', label: 'Moderate' };
    } else {
      return { tier: 'easy', color: '#00ff00', label: 'Easy' };
    }
  },

  /**
   * Calculate legendary health percentage
   */
  getLegendaryHealthPercent(session: HuntSession, legendary: LegendaryAnimal): number {
    return Math.floor((session.legendaryHealth / legendary.maxHealth) * 100);
  },

  /**
   * Check if session is active
   */
  isSessionActive(session: HuntSession): boolean {
    return session.status === 'active';
  },

  /**
   * Format completion time
   */
  formatCompletionTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  },
};

export default legendaryHuntService;
