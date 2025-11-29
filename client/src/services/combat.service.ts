/**
 * Combat Service
 * API client for combat-related operations
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';
import type {
  NPC,
  CombatEncounter,
  TurnResult,
  FleeResult,
  CombatResult,
  CombatStats,
} from '@desperados/shared';

/**
 * Combat Service
 * Handles all combat-related API calls
 */
export const combatService = {
  /**
   * Get all available NPCs for combat
   */
  async getNPCs(): Promise<ApiResponse<{ npcs: NPC[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ npcs: NPC[] }>>('/combat/npcs');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs',
      };
    }
  },

  /**
   * Get NPCs filtered by location
   */
  async getNPCsByLocation(locationId: string): Promise<ApiResponse<{ npcs: NPC[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ npcs: NPC[] }>>(
        `/combat/npcs?location=${locationId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs',
      };
    }
  },

  /**
   * Start a new combat encounter
   */
  async startCombat(
    npcId: string,
    characterId: string
  ): Promise<ApiResponse<{ encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ encounter: CombatEncounter }>>(
        '/combat/start',
        {
          npcId,
          characterId,
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to start combat',
      };
    }
  },

  /**
   * Play a turn in active combat
   */
  async playTurn(encounterId: string): Promise<ApiResponse<{ result: TurnResult }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ result: TurnResult }>>(
        `/combat/turn/${encounterId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to play turn',
      };
    }
  },

  /**
   * Flee from active combat
   */
  async fleeCombat(encounterId: string): Promise<ApiResponse<{ result: FleeResult }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ result: FleeResult }>>(
        `/combat/${encounterId}/flee`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to flee combat',
      };
    }
  },

  /**
   * Get active combat encounter for current character
   */
  async getActiveCombat(): Promise<ApiResponse<{ encounter: CombatEncounter | null }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ encounter: CombatEncounter | null }>>(
        `/combat/active`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch active combat',
      };
    }
  },

  /**
   * Get combat history for current character
   */
  async getCombatHistory(
    limit: number = 10
  ): Promise<ApiResponse<{ history: CombatResult[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ history: CombatResult[] }>>(
        `/combat/history?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch combat history',
      };
    }
  },

  /**
   * Get combat stats for current character
   */
  async getCombatStats(): Promise<ApiResponse<{ stats: CombatStats }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ stats: CombatStats }>>(
        `/combat/stats`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch combat stats',
      };
    }
  },
};

export default combatService;
