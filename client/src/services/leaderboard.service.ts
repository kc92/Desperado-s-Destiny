/**
 * Leaderboard Service
 * API client for viewing various leaderboards
 */

import api from './api';

// ===== Types =====

export type LeaderboardType = 'level' | 'gold' | 'reputation' | 'combat' | 'bounties' | 'gangs';
export type LeaderboardRange = 'all' | 'monthly' | 'weekly' | 'daily';

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  name: string;
  value: number;
  faction?: string;
  level?: number;
  experience?: number;
  gangName?: string;
  gangTag?: string;
}

export interface GangLeaderboardEntry {
  rank: number;
  gangId: string;
  name: string;
  tag: string;
  value: number;
  memberCount: number;
  level: number;
  leader: string;
  faction?: string;
}

export interface LeaderboardStats {
  myRank?: number;
  myValue: number;
  topValue: number;
  averageValue: number;
  totalEntries: number;
}

// ===== Request/Response Types =====

export interface GetLeaderboardRequest {
  range?: LeaderboardRange;
  limit?: number;
}

export interface GetLevelLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'level';
  range: LeaderboardRange;
}

export interface GetGoldLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'gold';
  range: LeaderboardRange;
}

export interface GetReputationLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'reputation';
  range: LeaderboardRange;
}

export interface GetCombatLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'combat';
  range: LeaderboardRange;
}

export interface GetBountiesLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'bounties';
  range: LeaderboardRange;
}

export interface GetGangsLeaderboardResponse {
  leaderboard: GangLeaderboardEntry[];
  type: 'gangs';
  range: LeaderboardRange;
}

// ===== Leaderboard Service =====

export const leaderboardService = {
  // ===== Public Routes =====

  /**
   * Get level leaderboard
   */
  async getLevelLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetLevelLeaderboardResponse> {
    const response = await api.get<{ data: GetLevelLeaderboardResponse }>('/leaderboard/level', {
      params: { range, limit },
    });
    return response.data.data;
  },

  /**
   * Get gold/wealth leaderboard
   */
  async getGoldLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetGoldLeaderboardResponse> {
    const response = await api.get<{ data: GetGoldLeaderboardResponse }>('/leaderboard/gold', {
      params: { range, limit },
    });
    return response.data.data;
  },

  /**
   * Get reputation leaderboard
   */
  async getReputationLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetReputationLeaderboardResponse> {
    const response = await api.get<{ data: GetReputationLeaderboardResponse }>(
      '/leaderboard/reputation',
      {
        params: { range, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Get combat wins leaderboard
   */
  async getCombatLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetCombatLeaderboardResponse> {
    const response = await api.get<{ data: GetCombatLeaderboardResponse }>('/leaderboard/combat', {
      params: { range, limit },
    });
    return response.data.data;
  },

  /**
   * Get bounties/wanted leaderboard
   */
  async getBountiesLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetBountiesLeaderboardResponse> {
    const response = await api.get<{ data: GetBountiesLeaderboardResponse }>(
      '/leaderboard/bounties',
      {
        params: { range, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Get gangs leaderboard
   */
  async getGangsLeaderboard(
    range: LeaderboardRange = 'all',
    limit = 100
  ): Promise<GetGangsLeaderboardResponse> {
    const response = await api.get<{ data: GetGangsLeaderboardResponse }>('/leaderboard/gangs', {
      params: { range, limit },
    });
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get all leaderboards at once
   */
  async getAllLeaderboards(range: LeaderboardRange = 'all', limit = 100): Promise<{
    level: GetLevelLeaderboardResponse;
    gold: GetGoldLeaderboardResponse;
    reputation: GetReputationLeaderboardResponse;
    combat: GetCombatLeaderboardResponse;
    bounties: GetBountiesLeaderboardResponse;
    gangs: GetGangsLeaderboardResponse;
  }> {
    const [level, gold, reputation, combat, bounties, gangs] = await Promise.all([
      this.getLevelLeaderboard(range, limit),
      this.getGoldLeaderboard(range, limit),
      this.getReputationLeaderboard(range, limit),
      this.getCombatLeaderboard(range, limit),
      this.getBountiesLeaderboard(range, limit),
      this.getGangsLeaderboard(range, limit),
    ]);

    return { level, gold, reputation, combat, bounties, gangs };
  },

  /**
   * Find character's rank in leaderboard
   */
  findCharacterRank(leaderboard: LeaderboardEntry[], characterId: string): number | null {
    const entry = leaderboard.find((e) => e.characterId === characterId);
    return entry ? entry.rank : null;
  },

  /**
   * Find gang's rank in leaderboard
   */
  findGangRank(leaderboard: GangLeaderboardEntry[], gangId: string): number | null {
    const entry = leaderboard.find((e) => e.gangId === gangId);
    return entry ? entry.rank : null;
  },

  /**
   * Get top N entries from leaderboard
   */
  getTopEntries(leaderboard: LeaderboardEntry[], count: number): LeaderboardEntry[] {
    return leaderboard.slice(0, count);
  },

  /**
   * Get top N gang entries from leaderboard
   */
  getTopGangEntries(leaderboard: GangLeaderboardEntry[], count: number): GangLeaderboardEntry[] {
    return leaderboard.slice(0, count);
  },

  /**
   * Filter leaderboard by faction
   */
  filterByFaction(leaderboard: LeaderboardEntry[], faction: string): LeaderboardEntry[] {
    return leaderboard.filter((entry) => entry.faction === faction);
  },

  /**
   * Calculate leaderboard statistics
   */
  calculateStats(leaderboard: LeaderboardEntry[], characterId?: string): LeaderboardStats {
    const values = leaderboard.map((e) => e.value);
    const totalEntries = leaderboard.length;
    const topValue = totalEntries > 0 ? values[0] : 0;
    const averageValue = totalEntries > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / totalEntries) : 0;

    let myRank: number | undefined;
    let myValue = 0;

    if (characterId) {
      const entry = leaderboard.find((e) => e.characterId === characterId);
      if (entry) {
        myRank = entry.rank;
        myValue = entry.value;
      }
    }

    return {
      myRank,
      myValue,
      topValue,
      averageValue,
      totalEntries,
    };
  },

  /**
   * Get rank suffix (1st, 2nd, 3rd, etc.)
   */
  getRankSuffix(rank: number): string {
    const j = rank % 10;
    const k = rank % 100;

    if (j === 1 && k !== 11) return `${rank}st`;
    if (j === 2 && k !== 12) return `${rank}nd`;
    if (j === 3 && k !== 13) return `${rank}rd`;
    return `${rank}th`;
  },

  /**
   * Get rank tier (top 10, top 50, top 100, etc.)
   */
  getRankTier(rank: number, total: number): string {
    if (rank === 1) return 'Champion';
    if (rank <= 3) return 'Elite';
    if (rank <= 10) return 'Top 10';
    if (rank <= 50) return 'Top 50';
    if (rank <= 100) return 'Top 100';

    const percentage = Math.round((rank / total) * 100);
    return `Top ${percentage}%`;
  },

  /**
   * Get rank color based on position
   */
  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return '#4169E1'; // Royal Blue
    if (rank <= 50) return '#32CD32'; // Lime Green
    return '#808080'; // Gray
  },

  /**
   * Format leaderboard value based on type
   */
  formatValue(value: number, type: LeaderboardType): string {
    switch (type) {
      case 'level':
        return `Level ${value}`;
      case 'gold':
        return `$${value.toLocaleString()}`;
      case 'reputation':
        return `${value.toLocaleString()} Rep`;
      case 'combat':
        return `${value.toLocaleString()} Wins`;
      case 'bounties':
        return `$${value.toLocaleString()} Bounty`;
      case 'gangs':
        return `${value.toLocaleString()} Points`;
      default:
        return value.toLocaleString();
    }
  },

  /**
   * Compare two leaderboard entries for rank change
   */
  getRankChange(
    oldLeaderboard: LeaderboardEntry[],
    newLeaderboard: LeaderboardEntry[],
    characterId: string
  ): { oldRank: number | null; newRank: number | null; change: number } {
    const oldRank = this.findCharacterRank(oldLeaderboard, characterId);
    const newRank = this.findCharacterRank(newLeaderboard, characterId);

    const change = oldRank && newRank ? oldRank - newRank : 0;

    return { oldRank, newRank, change };
  },

  /**
   * Get leaderboard range display name
   */
  getRangeDisplayName(range: LeaderboardRange): string {
    const names = {
      all: 'All Time',
      monthly: 'This Month',
      weekly: 'This Week',
      daily: 'Today',
    };
    return names[range];
  },

  /**
   * Get leaderboard type display name
   */
  getTypeDisplayName(type: LeaderboardType): string {
    const names = {
      level: 'Level Rankings',
      gold: 'Wealth Rankings',
      reputation: 'Reputation Rankings',
      combat: 'Combat Rankings',
      bounties: 'Most Wanted',
      gangs: 'Gang Rankings',
    };
    return names[type];
  },
};

export default leaderboardService;
