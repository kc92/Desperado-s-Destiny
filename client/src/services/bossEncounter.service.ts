/**
 * Boss Encounter Service
 * API client for individual boss encounter operations
 * (separate from world boss system which handles server-wide boss events)
 */

import api from './api';

// ===== Types =====

export type BossType = 'story' | 'optional' | 'raid' | 'elite' | 'champion';

export type BossDiscoveryStatus = 'locked' | 'discovered' | 'available' | 'defeated';

export type EncounterStatus = 'active' | 'victory' | 'defeat' | 'fled' | 'abandoned';

export type BossCombatAction = 'attack' | 'defend' | 'item' | 'flee';

export interface Boss {
  _id: string;
  name: string;
  title?: string;
  description: string;
  lore: string;
  type: BossType;
  level: number;
  maxHealth: number;
  abilities: BossAbility[];
  resistances: {
    physical?: number;
    fire?: number;
    ice?: number;
    poison?: number;
  };
  weaknesses: string[];
  mechanics: string[];
  location: string;
  requirements?: {
    minLevel?: number;
    questCompleted?: string;
    itemRequired?: string;
  };
  rewards: {
    experience: number;
    gold: number;
    items: { itemId: string; name: string; rarity: string; dropRate: number }[];
    guaranteedDrops?: { itemId: string; name: string; rarity: string }[];
  };
  respawnTime?: number;
}

export interface BossAbility {
  name: string;
  description: string;
  damage?: number;
  cooldown?: number;
  effect?: string;
  type: 'single_target' | 'area_of_effect' | 'buff' | 'debuff' | 'mechanic';
}

export interface BossProgress {
  bossId: string;
  discoveryStatus: BossDiscoveryStatus;
  encountersAttempted: number;
  encountersWon: number;
  encountersLost: number;
  fastestKillTime?: number;
  lastEncounterDate?: string;
  lastRespawn?: string;
  availableAt?: string;
}

export interface BossEncounterSession {
  _id: string;
  bossId: string;
  characterId: string;
  partyMembers: string[];
  status: EncounterStatus;
  bossHealth: number;
  bossMaxHealth: number;
  characterHealth: number;
  turnCount: number;
  damageDealt: number;
  damageTaken: number;
  itemsUsed: number;
  startTime: string;
  endTime?: string;
  combatLog: EncounterCombatLogEntry[];
  result?: {
    victory: boolean;
    experience?: number;
    gold?: number;
    items?: { itemId: string; name: string; rarity: string }[];
    killTime?: number;
  };
}

export interface EncounterCombatLogEntry {
  turn: number;
  timestamp: string;
  actor: 'player' | 'boss';
  action: string;
  target?: string;
  damage?: number;
  healing?: number;
  effect?: string;
  description: string;
}

export interface BossLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  killTime: number;
  defeatedAt: string;
  turnsUsed: number;
  partySize: number;
}

// ===== Request/Response Types =====

export interface GetAllBossesResponse {
  bosses: (Boss & { progress: BossProgress })[];
  totalBosses: number;
  totalDefeated: number;
}

export interface GetActiveEncounterResponse {
  session: BossEncounterSession | null;
  boss?: Boss;
}

export interface GetBossDetailsResponse {
  boss: Boss;
  progress: BossProgress;
  canChallenge: boolean;
  reason?: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  reason?: string;
  requiredLevel?: number;
  requiredQuest?: string;
  requiredItem?: string;
  nextAvailableTime?: string;
}

export interface GetEncounterHistoryResponse {
  encounters: {
    _id: string;
    status: EncounterStatus;
    startTime: string;
    endTime?: string;
    turnCount: number;
    victory: boolean;
    killTime?: number;
    rewards?: {
      experience: number;
      gold: number;
      items: { itemId: string; name: string }[];
    };
  }[];
  totalAttempts: number;
  totalVictories: number;
  fastestKill?: number;
}

export interface InitiateBossEncounterRequest {
  location: string;
  partyMemberIds?: string[];
}

export interface InitiateBossEncounterResponse {
  session: BossEncounterSession;
  boss: Boss;
  message: string;
}

export interface ProcessBossAttackRequest {
  action: BossCombatAction;
  targetId?: string;
  itemId?: string;
}

export interface ProcessBossAttackResponse {
  session: BossEncounterSession;
  turnResult: {
    playerAction: string;
    playerDamage?: number;
    bossAction?: string;
    bossDamage?: number;
    effects?: string[];
    combatOver: boolean;
    victory?: boolean;
  };
}

export interface AbandonEncounterResponse {
  message: string;
  penaltyApplied?: {
    experienceLost?: number;
    goldLost?: number;
  };
}

// ===== Boss Encounter Service =====

export const bossEncounterService = {
  // ===== Boss Discovery & Information Routes =====

  /**
   * Get all available bosses and character's discovery progress
   */
  async getAllBosses(): Promise<GetAllBossesResponse> {
    const response = await api.get<{ data: GetAllBossesResponse }>('/boss-encounters');
    return response.data.data;
  },

  /**
   * Get character's active boss encounter if any
   */
  async getActiveEncounter(): Promise<GetActiveEncounterResponse> {
    const response = await api.get<{ data: GetActiveEncounterResponse }>(
      '/boss-encounters/active'
    );
    return response.data.data;
  },

  /**
   * Get specific boss details and character's discovery progress
   */
  async getBossDetails(bossId: string): Promise<GetBossDetailsResponse> {
    const response = await api.get<{ data: GetBossDetailsResponse }>(
      `/boss-encounters/${bossId}`
    );
    return response.data.data;
  },

  /**
   * Check if a boss is available for the character
   */
  async checkAvailability(bossId: string): Promise<CheckAvailabilityResponse> {
    const response = await api.get<{ data: CheckAvailabilityResponse }>(
      `/boss-encounters/${bossId}/availability`
    );
    return response.data.data;
  },

  /**
   * Get character's encounter history for a specific boss
   */
  async getEncounterHistory(bossId: string): Promise<GetEncounterHistoryResponse> {
    const response = await api.get<{ data: GetEncounterHistoryResponse }>(
      `/boss-encounters/${bossId}/history`
    );
    return response.data.data;
  },

  /**
   * Get leaderboard for a specific boss
   */
  async getBossLeaderboard(bossId: string, limit?: number): Promise<BossLeaderboardEntry[]> {
    const params = limit ? { limit } : {};
    const response = await api.get<{ data: { leaderboard: BossLeaderboardEntry[] } }>(
      `/boss-encounters/${bossId}/leaderboard`,
      { params }
    );
    return response.data.data?.leaderboard || [];
  },

  // ===== Encounter Initiation Routes =====

  /**
   * Initiate a boss encounter
   */
  async initiateBossEncounter(
    bossId: string,
    request: InitiateBossEncounterRequest
  ): Promise<InitiateBossEncounterResponse> {
    const response = await api.post<{ data: InitiateBossEncounterResponse }>(
      `/boss-encounters/${bossId}/initiate`,
      request
    );
    return response.data.data;
  },

  // ===== Combat Session Routes =====

  /**
   * Get current boss encounter session status
   */
  async getEncounterSession(sessionId: string): Promise<BossEncounterSession> {
    const response = await api.get<{ data: { session: BossEncounterSession } }>(
      `/boss-encounters/sessions/${sessionId}`
    );
    return response.data.data.session;
  },

  /**
   * Execute a combat action in boss encounter
   */
  async processBossAttack(
    sessionId: string,
    request: ProcessBossAttackRequest
  ): Promise<ProcessBossAttackResponse> {
    const response = await api.post<{ data: ProcessBossAttackResponse }>(
      `/boss-encounters/sessions/${sessionId}/attack`,
      request
    );
    return response.data.data;
  },

  /**
   * Abandon a boss encounter (counts as defeat)
   */
  async abandonEncounter(sessionId: string): Promise<AbandonEncounterResponse> {
    const response = await api.post<{ data: AbandonEncounterResponse }>(
      `/boss-encounters/sessions/${sessionId}/abandon`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if boss is available to challenge
   */
  isBossAvailable(progress: BossProgress): boolean {
    return progress.discoveryStatus === 'available' || progress.discoveryStatus === 'defeated';
  },

  /**
   * Check if boss is defeated
   */
  isBossDefeated(progress: BossProgress): boolean {
    return progress.discoveryStatus === 'defeated';
  },

  /**
   * Calculate win rate
   */
  getWinRate(progress: BossProgress): number {
    if (progress.encountersAttempted === 0) return 0;
    return Math.floor((progress.encountersWon / progress.encountersAttempted) * 100);
  },

  /**
   * Calculate boss health percentage
   */
  getBossHealthPercent(session: BossEncounterSession): number {
    if (session.bossMaxHealth === 0) return 0;
    return Math.floor((session.bossHealth / session.bossMaxHealth) * 100);
  },

  /**
   * Check if session is active
   */
  isSessionActive(session: BossEncounterSession): boolean {
    return session.status === 'active';
  },

  /**
   * Get boss type display name
   */
  getBossTypeDisplayName(type: BossType): string {
    const typeNames: Record<BossType, string> = {
      story: 'Story Boss',
      optional: 'Optional Boss',
      raid: 'Raid Boss',
      elite: 'Elite Boss',
      champion: 'Champion',
    };
    return typeNames[type] || type;
  },

  /**
   * Get boss type color
   */
  getBossTypeColor(type: BossType): string {
    const typeColors: Record<BossType, string> = {
      story: '#ff8c00',
      optional: '#4169e1',
      raid: '#a335ee',
      elite: '#ffd700',
      champion: '#ff0000',
    };
    return typeColors[type] || '#ffffff';
  },

  /**
   * Get discovery status display name
   */
  getDiscoveryStatusDisplayName(status: BossDiscoveryStatus): string {
    const statusNames: Record<BossDiscoveryStatus, string> = {
      locked: 'Locked',
      discovered: 'Discovered',
      available: 'Available',
      defeated: 'Defeated',
    };
    return statusNames[status] || status;
  },

  /**
   * Format kill time
   */
  formatKillTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  },

  /**
   * Get difficulty estimate based on level difference
   */
  getDifficultyEstimate(characterLevel: number, bossLevel: number): {
    difficulty: string;
    color: string;
    warning?: string;
  } {
    const levelDiff = bossLevel - characterLevel;

    if (levelDiff >= 10) {
      return {
        difficulty: 'Impossible',
        color: '#ff0000',
        warning: 'This boss is far beyond your current strength!',
      };
    } else if (levelDiff >= 5) {
      return {
        difficulty: 'Very Hard',
        color: '#ff4500',
        warning: 'This will be an extremely challenging fight.',
      };
    } else if (levelDiff >= 2) {
      return {
        difficulty: 'Hard',
        color: '#ffa500',
        warning: 'Prepare carefully for this encounter.',
      };
    } else if (levelDiff >= -2) {
      return {
        difficulty: 'Moderate',
        color: '#ffd700',
      };
    } else if (levelDiff >= -5) {
      return {
        difficulty: 'Easy',
        color: '#00ff00',
      };
    } else {
      return {
        difficulty: 'Trivial',
        color: '#808080',
      };
    }
  },

  /**
   * Check if party is recommended
   */
  isPartyRecommended(boss: Boss): boolean {
    return boss.type === 'raid' || boss.type === 'elite';
  },

  /**
   * Get recommended party size
   */
  getRecommendedPartySize(boss: Boss): number {
    switch (boss.type) {
      case 'raid':
        return 5;
      case 'elite':
        return 3;
      case 'champion':
        return 2;
      default:
        return 1;
    }
  },
};

export default bossEncounterService;
