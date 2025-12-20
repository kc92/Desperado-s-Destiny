/**
 * Territory Service
 * API client for territory management operations
 */

import api from './api';
import type {
  Territory,
  TerritoryStats,
  TerritoryFaction,
  ConquestHistoryEntry,
} from '@shared/types/territory.types';

// ===== Types =====

export interface TerritoryListResponse {
  territories: Territory[];
  stats: TerritoryStats;
}

export interface TerritoryByIdResponse {
  territory: Territory;
}

export interface DeclareWarRequest {
  gangId: string;
}

export interface DeclareWarResponse {
  success: boolean;
  warId: string;
  message: string;
  war: TerritoryWar;
}

export interface TerritoryWar {
  _id: string;
  territoryId: string;
  attackerGangId: string;
  attackerGangName: string;
  defenderGangId: string | null;
  defenderGangName: string | null;
  declaredAt: string;
  startsAt: string;
  status: 'declared' | 'active' | 'completed';
  targetScore: number;
  attackerScore: number;
  defenderScore: number;
}

export interface TerritoryWarListResponse {
  wars: TerritoryWar[];
  active: number;
  total: number;
}

export interface TerritoryHistoryResponse {
  history: ConquestHistoryEntry[];
  totalConquests: number;
}

// ===== Territory Service =====

export const territoryService = {
  // ===== Authenticated Routes =====

  /**
   * Get list of all territories
   */
  async list(): Promise<TerritoryListResponse> {
    const response = await api.get<{ data: TerritoryListResponse }>('/territories');
    return response.data.data;
  },

  /**
   * Get territory statistics
   */
  async getStats(): Promise<TerritoryStats> {
    const response = await api.get<{ data: { stats: TerritoryStats } }>('/territories/stats');
    return response.data.data.stats;
  },

  /**
   * Get single territory by ID
   */
  async getById(territoryId: string): Promise<Territory> {
    const response = await api.get<{ data: TerritoryByIdResponse }>(`/territories/${territoryId}`);
    return response.data.data.territory;
  },

  /**
   * Declare war on a territory (gang leader only)
   */
  async declareWar(territoryId: string, gangId: string): Promise<DeclareWarResponse> {
    const response = await api.post<{ data: DeclareWarResponse }>(
      `/territories/${territoryId}/declare-war`,
      { gangId }
    );
    return response.data.data;
  },

  /**
   * Get war history for a territory
   */
  async getWars(territoryId: string): Promise<TerritoryWarListResponse> {
    const response = await api.get<{ data: TerritoryWarListResponse }>(
      `/territories/${territoryId}/wars`
    );
    return response.data.data;
  },

  /**
   * Get conquest history for a territory
   */
  async getHistory(territoryId: string): Promise<TerritoryHistoryResponse> {
    const response = await api.get<{ data: TerritoryHistoryResponse }>(
      `/territories/${territoryId}/history`
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get all territories by faction
   */
  async getByFaction(faction: TerritoryFaction): Promise<Territory[]> {
    const { territories } = await this.list();
    return territories.filter(t => t.faction === faction);
  },

  /**
   * Get all available territories (not controlled by any gang)
   */
  async getAvailable(): Promise<Territory[]> {
    const { territories } = await this.list();
    return territories.filter(t => !t.controllingGangId);
  },

  /**
   * Get territories controlled by a specific gang
   */
  async getByGang(gangId: string): Promise<Territory[]> {
    const { territories } = await this.list();
    return territories.filter(t => t.controllingGangId === gangId);
  },

  /**
   * Get territories under siege
   */
  async getUnderSiege(): Promise<Territory[]> {
    const { territories } = await this.list();
    return territories.filter(t => t.isUnderSiege === true);
  },

  /**
   * Check if a territory can be attacked
   */
  canAttackTerritory(
    territory: Territory,
    gangId: string,
    gangSize: number
  ): { canAttack: boolean; reason?: string } {
    // Can't attack your own territory
    if (territory.controllingGangId === gangId) {
      return { canAttack: false, reason: 'You already control this territory' };
    }

    // Can't attack territory already under siege
    if (territory.isUnderSiege) {
      return { canAttack: false, reason: 'This territory is already under siege' };
    }

    // Need minimum gang size (example: 5 members)
    if (gangSize < 5) {
      return { canAttack: false, reason: 'Your gang needs at least 5 members to declare war' };
    }

    return { canAttack: true };
  },

  /**
   * Calculate estimated defense difficulty
   */
  calculateDefenseDifficulty(territory: Territory): {
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
    score: number;
  } {
    const score = territory.difficulty * (territory.capturePoints / 100);

    if (score < 25) return { difficulty: 'easy', score };
    if (score < 50) return { difficulty: 'medium', score };
    if (score < 75) return { difficulty: 'hard', score };
    return { difficulty: 'very_hard', score };
  },

  /**
   * Get territory value rating (for prioritization)
   */
  getTerritoryValue(territory: Territory): {
    value: 'low' | 'medium' | 'high' | 'strategic';
    score: number;
  } {
    const benefitsScore =
      territory.benefits.goldBonus +
      territory.benefits.xpBonus +
      territory.benefits.energyRegen +
      (territory.benefits.energyBonus || 0);

    if (benefitsScore < 50) return { value: 'low', score: benefitsScore };
    if (benefitsScore < 100) return { value: 'medium', score: benefitsScore };
    if (benefitsScore < 150) return { value: 'high', score: benefitsScore };
    return { value: 'strategic', score: benefitsScore };
  },

  /**
   * Sort territories by strategic value
   */
  sortByValue(territories: Territory[]): Territory[] {
    return [...territories].sort((a, b) => {
      const valueA = this.getTerritoryValue(a).score;
      const valueB = this.getTerritoryValue(b).score;
      return valueB - valueA;
    });
  },

  /**
   * Filter territories by difficulty range
   */
  filterByDifficulty(
    territories: Territory[],
    minDifficulty: number,
    maxDifficulty: number
  ): Territory[] {
    return territories.filter(
      t => t.difficulty >= minDifficulty && t.difficulty <= maxDifficulty
    );
  },
};

export default territoryService;
