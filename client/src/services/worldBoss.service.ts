/**
 * World Boss Service
 * API client for world boss and server-wide boss event operations
 */

import api from './api';

// ===== Types =====

export type WorldBossStatus = 'dormant' | 'spawning' | 'active' | 'defeated' | 'despawned';

export interface WorldBoss {
  _id: string;
  name: string;
  description: string;
  lore: string;
  level: number;
  maxHealth: number;
  currentHealth: number;
  abilities: BossAbility[];
  resistances: {
    physical?: number;
    fire?: number;
    ice?: number;
    poison?: number;
  };
  weaknesses: string[];
  spawnLocation: string;
  spawnSchedule: {
    frequency: string;
    duration: number;
    nextSpawn?: string;
  };
  status: WorldBossStatus;
  rewards: {
    experience: number;
    gold: number;
    items: { itemId: string; name: string; rarity: string; dropRate: number }[];
  };
}

export interface BossAbility {
  name: string;
  description: string;
  damage?: number;
  cooldown?: number;
  effect?: string;
  type: 'single_target' | 'area_of_effect' | 'buff' | 'debuff';
}

export interface WorldBossSession {
  _id: string;
  worldBossId: string;
  bossName: string;
  status: 'active' | 'victory' | 'defeat' | 'timeout';
  spawnedAt: string;
  endedAt?: string;
  currentHealth: number;
  maxHealth: number;
  participantCount: number;
  totalDamageDealt: number;
  timeRemaining?: number;
}

export interface WorldBossParticipant {
  characterId: string;
  characterName: string;
  damageDealt: number;
  rank: number;
  joinedAt: string;
  lastAttackAt?: string;
  isActive: boolean;
}

export interface WorldBossLeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  damageDealt: number;
  reward?: {
    experience: number;
    gold: number;
    items: { itemId: string; name: string; rarity: string }[];
  };
}

// ===== Request/Response Types =====

export interface GetAllWorldBossesResponse {
  bosses: WorldBoss[];
  activeSessions: WorldBossSession[];
}

export interface GetWorldBossStatusResponse {
  boss: WorldBoss;
  activeSession?: WorldBossSession;
  participantCount?: number;
  nextSpawn?: string;
}

export interface GetWorldBossLeaderboardResponse {
  leaderboard: WorldBossLeaderboardEntry[];
  sessionId: string;
  totalParticipants: number;
}

export interface JoinWorldBossResponse {
  session: WorldBossSession;
  participant: WorldBossParticipant;
  message: string;
}

export interface AttackWorldBossRequest {
  damage: number;
}

export interface AttackWorldBossResponse {
  session: WorldBossSession;
  damageDealt: number;
  participant: WorldBossParticipant;
  bossDefeated: boolean;
  message: string;
}

export interface GetParticipantDataResponse {
  participant: WorldBossParticipant;
  session: WorldBossSession;
}

export interface SpawnWorldBossResponse {
  session: WorldBossSession;
  boss: WorldBoss;
  message: string;
}

export interface EndWorldBossSessionRequest {
  victory: boolean;
}

export interface EndWorldBossSessionResponse {
  session: WorldBossSession;
  results: {
    victory: boolean;
    totalParticipants: number;
    totalDamage: number;
    topDamageDealer: string;
    rewardsDistributed: number;
  };
  message: string;
}

export interface CheckBossAvailabilityResponse {
  available: boolean;
  boss: WorldBoss;
  reason?: string;
  requiredLevel?: number;
}

export interface InitiateBossEncounterRequest {
  location: string;
  partyMemberIds?: string[];
}

export interface InitiateBossEncounterResponse {
  sessionId: string;
  boss: WorldBoss;
  partyMembers: string[];
  message: string;
}

export interface ProcessBossAttackRequest {
  action: 'attack' | 'defend' | 'item' | 'flee';
  targetId?: string;
  itemId?: string;
}

export interface ProcessBossAttackResponse {
  turnResult: {
    playerAction: string;
    playerDamage?: number;
    bossAction?: string;
    bossDamage?: number;
    effects?: string[];
    combatOver: boolean;
    victory?: boolean;
  };
  sessionStatus: string;
}

// ===== World Boss Service =====

export const worldBossService = {
  // ===== Public Routes =====

  /**
   * Get all world bosses and their status
   */
  async getAllWorldBosses(): Promise<GetAllWorldBossesResponse> {
    const response = await api.get<{ data: GetAllWorldBossesResponse }>('/world-bosses');
    return response.data.data;
  },

  /**
   * Get status of a specific world boss
   */
  async getWorldBossStatus(bossId: string): Promise<GetWorldBossStatusResponse> {
    const response = await api.get<{ data: GetWorldBossStatusResponse }>(
      `/world-bosses/${bossId}/status`
    );
    return response.data.data;
  },

  /**
   * Get leaderboard for a world boss session
   */
  async getWorldBossLeaderboard(bossId: string): Promise<GetWorldBossLeaderboardResponse> {
    const response = await api.get<{ data: GetWorldBossLeaderboardResponse }>(
      `/world-bosses/${bossId}/leaderboard`
    );
    return response.data.data;
  },

  // ===== Protected Routes (auth + character required) =====

  /**
   * Join a world boss fight
   */
  async joinWorldBoss(bossId: string): Promise<JoinWorldBossResponse> {
    const response = await api.post<{ data: JoinWorldBossResponse }>(
      `/world-bosses/${bossId}/join`
    );
    return response.data.data;
  },

  /**
   * Attack a world boss
   */
  async attackWorldBoss(bossId: string, damage: number): Promise<AttackWorldBossResponse> {
    const response = await api.post<{ data: AttackWorldBossResponse }>(
      `/world-bosses/${bossId}/attack`,
      { damage }
    );
    return response.data.data;
  },

  /**
   * Get participant data for current character
   */
  async getParticipantData(bossId: string): Promise<GetParticipantDataResponse> {
    const response = await api.get<{ data: GetParticipantDataResponse }>(
      `/world-bosses/${bossId}/participant`
    );
    return response.data.data;
  },

  // ===== Admin Routes =====

  /**
   * Spawn a world boss (admin only)
   */
  async spawnWorldBoss(bossId: string): Promise<SpawnWorldBossResponse> {
    const response = await api.post<{ data: SpawnWorldBossResponse }>(
      `/world-bosses/${bossId}/spawn`
    );
    return response.data.data;
  },

  /**
   * End a world boss session (admin only)
   */
  async endWorldBossSession(bossId: string, victory: boolean): Promise<EndWorldBossSessionResponse> {
    const response = await api.post<{ data: EndWorldBossSessionResponse }>(
      `/world-bosses/${bossId}/end`,
      { victory }
    );
    return response.data.data;
  },

  // ===== Boss Encounter Routes (Individual Boss Fights) =====

  /**
   * Check if a specific boss is available for the character
   */
  async checkBossAvailability(bossId: string): Promise<CheckBossAvailabilityResponse> {
    const response = await api.get<{ data: CheckBossAvailabilityResponse }>(
      `/world-bosses/encounters/${bossId}/availability`
    );
    return response.data.data;
  },

  /**
   * Initiate a boss encounter
   */
  async initiateBossEncounter(
    bossId: string,
    request: InitiateBossEncounterRequest
  ): Promise<InitiateBossEncounterResponse> {
    const response = await api.post<{ data: InitiateBossEncounterResponse }>(
      `/world-bosses/encounters/${bossId}/initiate`,
      request
    );
    return response.data.data;
  },

  /**
   * Attack a boss in an active encounter
   */
  async processBossAttack(
    sessionId: string,
    request: ProcessBossAttackRequest
  ): Promise<ProcessBossAttackResponse> {
    const response = await api.post<{ data: ProcessBossAttackResponse }>(
      `/world-bosses/encounters/${sessionId}/attack`,
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if world boss is active
   */
  isBossActive(boss: WorldBoss): boolean {
    return boss.status === 'active';
  },

  /**
   * Check if session is active
   */
  isSessionActive(session: WorldBossSession): boolean {
    return session.status === 'active';
  },

  /**
   * Calculate boss health percentage
   */
  getBossHealthPercent(session: WorldBossSession): number {
    if (session.maxHealth === 0) return 0;
    return Math.floor((session.currentHealth / session.maxHealth) * 100);
  },

  /**
   * Calculate damage contribution percentage
   */
  getDamageContributionPercent(participant: WorldBossParticipant, totalDamage: number): number {
    if (totalDamage === 0) return 0;
    return Math.floor((participant.damageDealt / totalDamage) * 100);
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  /**
   * Format next spawn time
   */
  formatNextSpawn(nextSpawnDate: string): string {
    const now = new Date();
    const spawn = new Date(nextSpawnDate);
    const diffMs = spawn.getTime() - now.getTime();

    if (diffMs < 0) {
      return 'Spawning soon...';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  /**
   * Get status color
   */
  getStatusColor(status: WorldBossStatus): string {
    const statusColors: Record<WorldBossStatus, string> = {
      dormant: '#808080',
      spawning: '#ffd700',
      active: '#ff0000',
      defeated: '#00ff00',
      despawned: '#4169e1',
    };
    return statusColors[status] || '#ffffff';
  },

  /**
   * Get status display name
   */
  getStatusDisplayName(status: WorldBossStatus): string {
    const statusNames: Record<WorldBossStatus, string> = {
      dormant: 'Dormant',
      spawning: 'Spawning',
      active: 'Active',
      defeated: 'Defeated',
      despawned: 'Despawned',
    };
    return statusNames[status] || status;
  },

  /**
   * Get reward tier based on rank
   */
  getRewardTier(rank: number): string {
    if (rank === 1) return 'Legendary';
    if (rank <= 3) return 'Epic';
    if (rank <= 10) return 'Rare';
    if (rank <= 25) return 'Uncommon';
    return 'Common';
  },
};

export default worldBossService;
