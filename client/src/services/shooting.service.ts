/**
 * Shooting Contest Service
 * API client for shooting contests and competitions
 */

import api from './api';

// ===== Types =====

export type ContestType = 'quickdraw' | 'target' | 'skeet' | 'distance' | 'trick_shot';
export type ContestStatus = 'upcoming' | 'registration' | 'in_progress' | 'finished' | 'cancelled';
export type TargetType = 'stationary' | 'moving' | 'popup' | 'clay_pigeon';

export interface ContestTemplate {
  id: string;
  name: string;
  description: string;
  type: ContestType;
  rounds: number;
  shotsPerRound: number;
  targetType: TargetType;
  entryFee: number;
  prizePool: number;
  difficulty: number;
  requirements?: {
    minLevel?: number;
    minAccuracy?: number;
    weaponType?: string;
  };
}

export interface Contest {
  _id: string;
  name: string;
  type: ContestType;
  status: ContestStatus;
  templateId: string;
  locationId: string;
  locationName: string;
  rounds: number;
  currentRound: number;
  shotsPerRound: number;
  targetType: TargetType;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  participants: ContestParticipant[];
  startTime: string;
  registrationDeadline: string;
  results?: ContestResult[];
}

export interface ContestParticipant {
  characterId: string;
  characterName: string;
  score: number;
  shotsRemaining: number;
  currentRound: number;
  shotHistory: ShotResult[];
}

export interface ShotResult {
  round: number;
  shotNumber: number;
  hit: boolean;
  accuracy: number;
  points: number;
  bonusPoints: number;
  targetDistance: number;
  timeToShoot: number;
}

export interface ContestResult {
  position: number;
  characterId: string;
  characterName: string;
  totalScore: number;
  accuracy: number;
  prize: number;
}

export interface ShootingRecord {
  totalContests: number;
  wins: number;
  podiumFinishes: number;
  bestScore: number;
  averageAccuracy: number;
  favoriteContestType: ContestType | null;
  totalEarnings: number;
  longestWinStreak: number;
  currentStreak: number;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  wins: number;
  contests: number;
  winRate: number;
  bestScore: number;
  totalEarnings: number;
}

export interface ContestHistoryEntry {
  _id: string;
  contestId: string;
  contestName: string;
  contestType: ContestType;
  position: number;
  totalParticipants: number;
  score: number;
  accuracy: number;
  prize: number;
  date: string;
}

// ===== Request/Response Types =====

export interface RegisterContestResponse {
  success: boolean;
  contest: Contest;
  participant: ContestParticipant;
  message: string;
}

export interface TakeShotRequest {
  aimTime?: number; // Optional - how long player took to aim
  accuracy?: number; // Optional - for client-side accuracy calculation
}

export interface TakeShotResponse {
  success: boolean;
  shot: ShotResult;
  participant: ContestParticipant;
  contest: Contest;
  message: string;
  roundComplete?: boolean;
  contestComplete?: boolean;
  finalResults?: ContestResult[];
}

export interface CreateContestRequest {
  templateId: string;
  locationId: string;
  startTime: string;
  customPrizePool?: number;
  maxParticipants?: number;
}

export interface CreateContestResponse {
  success: boolean;
  contest: Contest;
  message: string;
}

// ===== Shooting Service =====

export const shootingService = {
  // ===== Public Routes =====

  /**
   * Get all active and upcoming contests
   */
  async getActiveContests(filters?: {
    type?: ContestType;
    status?: ContestStatus;
    locationId?: string;
  }): Promise<Contest[]> {
    const response = await api.get<{ data: { contests: Contest[] } }>('/shooting/contests', {
      params: filters,
    });
    return response.data.data?.contests || [];
  },

  /**
   * Get available contest templates
   */
  async getContestTemplates(): Promise<ContestTemplate[]> {
    const response = await api.get<{ data: { templates: ContestTemplate[] } }>(
      '/shooting/templates'
    );
    return response.data.data?.templates || [];
  },

  /**
   * Get details for a specific contest
   */
  async getContestDetails(contestId: string): Promise<Contest> {
    const response = await api.get<{ data: Contest }>(`/shooting/contests/${contestId}`);
    return response.data.data;
  },

  /**
   * Get shooting leaderboard
   */
  async getLeaderboard(period?: 'daily' | 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]> {
    const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
      '/shooting/leaderboard',
      { params: period ? { period } : {} }
    );
    return response.data.data?.leaderboard || [];
  },

  // ===== Authenticated Routes =====

  /**
   * Get character's shooting record and stats
   */
  async getMyRecord(): Promise<ShootingRecord> {
    const response = await api.get<{ data: ShootingRecord }>('/shooting/my-record');
    return response.data.data;
  },

  /**
   * Get character's current contests
   */
  async getMyContests(): Promise<Contest[]> {
    const response = await api.get<{ data: { contests: Contest[] } }>('/shooting/my-contests');
    return response.data.data?.contests || [];
  },

  /**
   * Get character's contest history
   */
  async getContestHistory(limit?: number): Promise<ContestHistoryEntry[]> {
    const response = await api.get<{ data: { history: ContestHistoryEntry[] } }>(
      '/shooting/history',
      { params: limit ? { limit } : {} }
    );
    return response.data.data?.history || [];
  },

  /**
   * Register for a contest
   */
  async registerForContest(contestId: string): Promise<RegisterContestResponse> {
    const response = await api.post<{ data: RegisterContestResponse }>(
      `/shooting/contests/${contestId}/register`
    );
    return response.data.data;
  },

  /**
   * Take a shot during a contest
   */
  async takeShot(contestId: string, options?: TakeShotRequest): Promise<TakeShotResponse> {
    const response = await api.post<{ data: TakeShotResponse }>(
      `/shooting/contests/${contestId}/shoot`,
      options || {}
    );
    return response.data.data;
  },

  /**
   * Create a new contest (admin/scheduled use)
   */
  async createContest(request: CreateContestRequest): Promise<CreateContestResponse> {
    const response = await api.post<{ data: CreateContestResponse }>(
      '/shooting/contests',
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get contests by type
   */
  async getContestsByType(type: ContestType): Promise<Contest[]> {
    return this.getActiveContests({ type });
  },

  /**
   * Get upcoming contests only
   */
  async getUpcomingContests(): Promise<Contest[]> {
    return this.getActiveContests({ status: 'upcoming' });
  },

  /**
   * Get contests open for registration
   */
  async getOpenContests(): Promise<Contest[]> {
    return this.getActiveContests({ status: 'registration' });
  },
};

export default shootingService;
