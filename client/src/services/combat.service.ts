/**
 * Combat Service
 * API client for combat-related operations
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';
import type {
  NPC,
  CombatEncounter,
  FleeResult,
  CombatResult,
  CombatStats,
  CombatRoundState,
  CombatAction,
  CombatActionResult,
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

  // ==========================================================================
  // SPRINT 2: HOLD/DISCARD COMBAT SYSTEM
  // ==========================================================================

  /**
   * Start a new turn in combat (Sprint 2)
   * Draws cards and enters hold phase
   */
  async startTurn(encounterId: string): Promise<ApiResponse<{ roundState: CombatRoundState; encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ roundState: CombatRoundState; encounter: CombatEncounter }>>(
        `/combat/${encounterId}/start-turn`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to start turn',
      };
    }
  },

  /**
   * Process a player action during combat (Sprint 2)
   * Actions: hold, confirm_hold, reroll, peek, flee
   */
  async processAction(
    encounterId: string,
    action: CombatAction
  ): Promise<ApiResponse<CombatActionResult>> {
    try {
      const response = await apiClient.post<ApiResponse<CombatActionResult>>(
        `/combat/${encounterId}/action`,
        action
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to process action',
      };
    }
  },

  /**
   * Get current round state for an encounter (Sprint 2)
   */
  async getRoundState(encounterId: string): Promise<ApiResponse<{ roundState: CombatRoundState | null; encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ roundState: CombatRoundState | null; encounter: CombatEncounter }>>(
        `/combat/${encounterId}/state`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get round state',
      };
    }
  },

  // ==========================================================================
  // END SPRINT 2: HOLD/DISCARD COMBAT SYSTEM
  // ==========================================================================
};

export default combatService;
