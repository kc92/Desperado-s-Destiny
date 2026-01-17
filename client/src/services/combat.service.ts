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
 * All methods support AbortSignal for request cancellation
 */
export const combatService = {
  /**
   * Get all available NPCs for combat
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getNPCs(signal?: AbortSignal): Promise<ApiResponse<{ npcs: NPC[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ npcs: NPC[] }>>('/combat/npcs', { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs',
      };
    }
  },

  /**
   * Get NPCs filtered by location
   * @param locationId - Location to filter NPCs by
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getNPCsByLocation(locationId: string, signal?: AbortSignal): Promise<ApiResponse<{ npcs: NPC[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ npcs: NPC[] }>>(
        `/combat/npcs?location=${locationId}`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs',
      };
    }
  },

  /**
   * Start a new combat encounter
   * @param npcId - NPC to fight
   * @param characterId - Character starting the combat
   * @param signal - Optional AbortSignal for request cancellation
   */
  async startCombat(
    npcId: string,
    characterId: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<{ encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ encounter: CombatEncounter }>>(
        '/combat/start',
        {
          npcId,
          characterId,
        },
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to start combat',
      };
    }
  },

  /**
   * Flee from active combat
   * @param encounterId - Encounter to flee from
   * @param signal - Optional AbortSignal for request cancellation
   */
  async fleeCombat(encounterId: string, signal?: AbortSignal): Promise<ApiResponse<{ result: FleeResult }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ result: FleeResult }>>(
        `/combat/flee/${encounterId}`,
        {},
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to flee combat',
      };
    }
  },

  /**
   * Get active combat encounter for current character
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getActiveCombat(signal?: AbortSignal): Promise<ApiResponse<{ encounter: CombatEncounter | null }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ encounter: CombatEncounter | null }>>(
        `/combat/active`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch active combat',
      };
    }
  },

  /**
   * Get combat history for current character
   * @param limit - Number of history entries to fetch
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getCombatHistory(
    limit: number = 10,
    signal?: AbortSignal
  ): Promise<ApiResponse<{ history: CombatResult[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ history: CombatResult[] }>>(
        `/combat/history?limit=${limit}`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch combat history',
      };
    }
  },

  /**
   * Get combat stats for current character
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getCombatStats(signal?: AbortSignal): Promise<ApiResponse<{ stats: CombatStats }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ stats: CombatStats }>>(
        `/combat/stats`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
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
   * @param encounterId - Encounter ID
   * @param signal - Optional AbortSignal for request cancellation
   */
  async startTurn(encounterId: string, signal?: AbortSignal): Promise<ApiResponse<{ roundState: CombatRoundState; encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ roundState: CombatRoundState; encounter: CombatEncounter }>>(
        `/combat/${encounterId}/start-turn`,
        {},
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to start turn',
      };
    }
  },

  /**
   * Process a player action during combat (Sprint 2)
   * Actions: hold, confirm_hold, reroll, peek, flee
   * @param encounterId - Encounter ID
   * @param action - Combat action to perform
   * @param signal - Optional AbortSignal for request cancellation
   */
  async processAction(
    encounterId: string,
    action: CombatAction,
    signal?: AbortSignal
  ): Promise<ApiResponse<CombatActionResult>> {
    try {
      const response = await apiClient.post<ApiResponse<CombatActionResult>>(
        `/combat/${encounterId}/action`,
        action,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      return {
        success: false,
        error: error.message || 'Failed to process action',
      };
    }
  },

  /**
   * Get current round state for an encounter (Sprint 2)
   * @param encounterId - Encounter ID
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getRoundState(encounterId: string, signal?: AbortSignal): Promise<ApiResponse<{ roundState: CombatRoundState | null; encounter: CombatEncounter }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ roundState: CombatRoundState | null; encounter: CombatEncounter }>>(
        `/combat/${encounterId}/state`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
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
