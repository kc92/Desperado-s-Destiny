/**
 * Profile Service
 * API client for viewing public character profiles
 */

import api from './api';

// ===== Types =====

export interface CharacterAppearance {
  gender: 'male' | 'female';
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  facialHair?: string;
  eyeColor: string;
  clothing: {
    hat?: string;
    shirt: string;
    pants: string;
    boots: string;
    accessories?: string[];
  };
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  charisma: number;
  luck: number;
}

export interface CombatRecord {
  wins: number;
  losses: number;
}

export interface GangInfo {
  id: string;
  name: string;
  tag: string;
}

export interface PublicProfile {
  // Public info
  name: string;
  faction: string;
  level: number;
  appearance: CharacterAppearance;

  // Stats
  stats: CharacterStats;

  // Combat record
  combatRecord: CombatRecord;

  // Crime status
  wantedLevel: number;
  bountyAmount: number;
  isJailed: boolean;

  // Gang
  gang: GangInfo | null;

  // Activity
  lastActive: string;
  createdAt: string;
}

export interface CharacterSearchResult {
  _id: string;
  name: string;
  faction: string;
  level: number;
}

// ===== Response Types =====

export interface GetPublicProfileResponse {
  success: boolean;
  data: {
    profile: PublicProfile;
  };
}

export interface SearchCharactersResponse {
  success: boolean;
  data: CharacterSearchResult[];
}

// ===== Query Parameters =====

export interface SearchCharactersParams {
  q: string; // Search query (minimum 2 characters)
}

// ===== Profile Service =====

export const profileService = {
  /**
   * Get public profile by character name
   */
  async getPublicProfile(characterName: string): Promise<PublicProfile> {
    const response = await api.get<GetPublicProfileResponse>(`/profiles/${characterName}`);
    return response.data.data.profile;
  },

  /**
   * Search characters by name
   */
  async searchCharacters(query: string): Promise<CharacterSearchResult[]> {
    if (query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const response = await api.get<SearchCharactersResponse>('/profiles/search', {
      params: { q: query } as SearchCharactersParams,
    });
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Calculate win rate from combat record
   */
  calculateWinRate(combatRecord: CombatRecord): number {
    const total = combatRecord.wins + combatRecord.losses;
    if (total === 0) return 0;
    return Math.round((combatRecord.wins / total) * 100);
  },

  /**
   * Check if character is wanted (has bounty)
   */
  isWanted(profile: PublicProfile): boolean {
    return profile.wantedLevel > 0 || profile.bountyAmount > 0;
  },

  /**
   * Check if character is in a gang
   */
  isInGang(profile: PublicProfile): boolean {
    return profile.gang !== null;
  },

  /**
   * Get character's total stat points
   */
  getTotalStats(stats: CharacterStats): number {
    return (
      stats.strength +
      stats.dexterity +
      stats.constitution +
      stats.intelligence +
      stats.charisma +
      stats.luck
    );
  },

  /**
   * Get highest stat
   */
  getHighestStat(stats: CharacterStats): { name: string; value: number } {
    const statEntries = Object.entries(stats) as [keyof CharacterStats, number][];
    const [name, value] = statEntries.reduce((highest, current) =>
      current[1] > highest[1] ? current : highest
    );
    return { name, value };
  },

  /**
   * Format last active time as relative time
   */
  getLastActiveDisplay(lastActive: string): string {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastActiveDate.toLocaleDateString();
  },

  /**
   * Check if character is online (active within last 5 minutes)
   */
  isOnline(lastActive: string): boolean {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes < 5;
  },
};

export default profileService;
