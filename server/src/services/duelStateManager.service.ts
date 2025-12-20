/**
 * DuelStateManager Service
 *
 * Redis-backed state management for real-time duel sessions.
 * Enables horizontal scaling and crash recovery for duels.
 *
 * Features:
 * - Persistent duel state across server restarts
 * - Multi-instance support via Redis
 * - Automatic TTL-based cleanup
 * - Character-to-duel mapping for quick lookups
 */

import { RedisStateManager, RedisMapping } from './base/RedisStateManager';
import { DuelPhase, BettingAction, RoundResult, AbilityState } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Active duel state stored in Redis
 */
export interface ActiveDuelState {
  duelId: string;
  phase: DuelPhase;
  challengerId: string;
  challengedId: string;
  challengerSocketId?: string;
  challengedSocketId?: string;
  challengerReady: boolean;
  challengedReady: boolean;
  roundNumber: number;
  pot: number;
  currentBet: number;
  turnPlayerId: string;
  turnStartedAt: number;
  turnTimeLimit: number;
  roundResults: RoundResult[];
  totalRounds: number;
  // Ability state per player
  challengerAbilityState: AbilityState;
  challengedAbilityState: AbilityState;
  // Betting history for perception analysis
  challengerBettingHistory: BettingAction[];
  challengedBettingHistory: BettingAction[];
  // Metadata
  createdAt: number;
  lastActivityAt: number;
}

/**
 * Manager for active duel states
 * Stores full duel state in Redis with 2 hour TTL
 */
class DuelStateManagerImpl extends RedisStateManager<ActiveDuelState> {
  protected keyPrefix = 'duel:state:';
  protected ttlSeconds = 7200; // 2 hours max duel duration
}

/**
 * Manager for character-to-duel mapping
 * Quick lookup to find which duel a character is in
 */
const characterToDuelMapping = new RedisMapping('duel:char:', 7200);

/**
 * Singleton instance
 */
const stateManager = new DuelStateManagerImpl();

/**
 * DuelStateManager - Unified API for duel state operations
 */
export const DuelStateManager = {
  /**
   * Create or update duel state
   */
  async setState(duelId: string, state: ActiveDuelState): Promise<void> {
    state.lastActivityAt = Date.now();
    await stateManager.setState(duelId, state);
  },

  /**
   * Get duel state by ID
   */
  async getState(duelId: string): Promise<ActiveDuelState | null> {
    return stateManager.getState(duelId);
  },

  /**
   * Check if duel exists
   */
  async hasState(duelId: string): Promise<boolean> {
    return stateManager.hasState(duelId);
  },

  /**
   * Delete duel state
   */
  async deleteState(duelId: string): Promise<void> {
    await stateManager.deleteState(duelId);
  },

  /**
   * Update duel state atomically
   * Prevents race conditions when multiple events update state
   */
  async updateStateAtomic(
    duelId: string,
    updateFn: (state: ActiveDuelState) => ActiveDuelState
  ): Promise<ActiveDuelState | null> {
    return stateManager.updateStateAtomic(duelId, (state) => {
      const updated = updateFn(state);
      updated.lastActivityAt = Date.now();
      return updated;
    });
  },

  /**
   * Update a specific field in duel state
   * Convenience method for common updates
   */
  async updateField<K extends keyof ActiveDuelState>(
    duelId: string,
    field: K,
    value: ActiveDuelState[K]
  ): Promise<ActiveDuelState | null> {
    return this.updateStateAtomic(duelId, (state) => {
      state[field] = value;
      return state;
    });
  },

  /**
   * Set character's socket ID in duel
   */
  async setCharacterSocket(
    duelId: string,
    characterId: string,
    socketId: string
  ): Promise<void> {
    await this.updateStateAtomic(duelId, (state) => {
      if (characterId === state.challengerId) {
        state.challengerSocketId = socketId;
      } else if (characterId === state.challengedId) {
        state.challengedSocketId = socketId;
      }
      return state;
    });
  },

  /**
   * Clear character's socket ID (disconnect)
   */
  async clearCharacterSocket(
    duelId: string,
    characterId: string
  ): Promise<void> {
    await this.updateStateAtomic(duelId, (state) => {
      if (characterId === state.challengerId) {
        state.challengerSocketId = undefined;
      } else if (characterId === state.challengedId) {
        state.challengedSocketId = undefined;
      }
      return state;
    });
  },

  /**
   * Set character as ready
   */
  async setCharacterReady(
    duelId: string,
    characterId: string
  ): Promise<{ bothReady: boolean; state: ActiveDuelState | null }> {
    const state = await this.updateStateAtomic(duelId, (s) => {
      if (characterId === s.challengerId) {
        s.challengerReady = true;
      } else if (characterId === s.challengedId) {
        s.challengedReady = true;
      }
      return s;
    });

    return {
      bothReady: state?.challengerReady === true && state?.challengedReady === true,
      state,
    };
  },

  /**
   * Update duel phase
   */
  async setPhase(duelId: string, phase: DuelPhase): Promise<void> {
    await this.updateField(duelId, 'phase', phase);
  },

  /**
   * Set current turn player
   */
  async setTurnPlayer(
    duelId: string,
    playerId: string,
    timeLimit: number
  ): Promise<void> {
    await this.updateStateAtomic(duelId, (state) => {
      state.turnPlayerId = playerId;
      state.turnStartedAt = Date.now();
      state.turnTimeLimit = timeLimit;
      return state;
    });
  },

  /**
   * Add betting action to history
   */
  async recordBettingAction(
    duelId: string,
    characterId: string,
    action: BettingAction
  ): Promise<void> {
    await this.updateStateAtomic(duelId, (state) => {
      if (characterId === state.challengerId) {
        state.challengerBettingHistory.push(action);
      } else if (characterId === state.challengedId) {
        state.challengedBettingHistory.push(action);
      }
      return state;
    });
  },

  /**
   * Add round result
   */
  async addRoundResult(
    duelId: string,
    result: RoundResult
  ): Promise<void> {
    await this.updateStateAtomic(duelId, (state) => {
      state.roundResults.push(result);
      return state;
    });
  },

  // ========================================
  // Character-to-Duel Mapping
  // ========================================

  /**
   * Set character's active duel
   */
  async setCharacterDuel(characterId: string, duelId: string): Promise<void> {
    await characterToDuelMapping.set(characterId, duelId);
  },

  /**
   * Get character's active duel
   */
  async getCharacterDuel(characterId: string): Promise<string | null> {
    return characterToDuelMapping.get(characterId);
  },

  /**
   * Clear character's duel mapping
   */
  async clearCharacterDuel(characterId: string): Promise<void> {
    await characterToDuelMapping.delete(characterId);
  },

  /**
   * Check if character is in a duel
   */
  async isCharacterInDuel(characterId: string): Promise<boolean> {
    return characterToDuelMapping.has(characterId);
  },

  // ========================================
  // Cleanup Operations
  // ========================================

  /**
   * Clean up all state for a completed duel
   */
  async cleanupDuel(duelId: string, state: ActiveDuelState): Promise<void> {
    try {
      // Clear character mappings
      await this.clearCharacterDuel(state.challengerId);
      await this.clearCharacterDuel(state.challengedId);

      // Delete duel state
      await this.deleteState(duelId);

      logger.info(`Cleaned up duel state for ${duelId}`);
    } catch (error) {
      logger.error(`Error cleaning up duel ${duelId}:`, error);
    }
  },

  /**
   * Get all active duel IDs
   * Use sparingly - scans Redis keys
   */
  async getAllActiveDuelIds(): Promise<string[]> {
    return stateManager.getAllIds();
  },

  /**
   * Get count of active duels
   */
  async getActiveDuelCount(): Promise<number> {
    return stateManager.getCount();
  },

  /**
   * Refresh TTL for active duel (keep it alive)
   */
  async refreshDuelTTL(duelId: string): Promise<boolean> {
    return stateManager.refreshTTL(duelId);
  },
};

export default DuelStateManager;
