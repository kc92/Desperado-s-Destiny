/**
 * Combat Store
 * Manages combat encounters and history
 */

import { create } from 'zustand';
import type {
  NPC,
  CombatEncounter,
  CombatResult,
  CombatStats,
  CombatRoundState,
  CombatAction,
  LootAwarded,
} from '@desperados/shared';
import { combatService } from '@/services/combat.service';
import { logger } from '@/services/logger.service';
import { dispatchCombatStarted } from '@/utils/tutorialEvents';

interface CombatStore {
  // State
  npcs: NPC[];
  activeCombat: CombatEncounter | null;
  inCombat: boolean;
  combatHistory: CombatResult[];
  combatStats: CombatStats | null;
  isProcessingCombat: boolean;
  isLoading: boolean;
  error: string | null;

  // Sprint 2: Hold/Discard state
  roundState: CombatRoundState | null;
  heldCardIndices: number[];
  combatEnded: boolean;
  lootAwarded: LootAwarded | null;
  deathPenalty: { goldLost: number; respawned: boolean } | null;

  // Actions
  fetchNPCs: (locationId?: string) => Promise<void>;
  startCombat: (npcId: string, characterId: string) => Promise<void>;
  fleeCombat: () => Promise<void>;
  endCombat: () => void;
  fetchCombatHistory: () => Promise<void>;
  fetchCombatStats: () => Promise<void>;
  checkActiveCombat: () => Promise<void>;
  clearCombatState: () => void;
  // PRODUCTION FIX: Error recovery methods
  resetProcessingState: () => void;
  forceEndCombat: () => void;

  // Sprint 2: Hold/Discard actions
  startTurn: () => Promise<void>;
  setHeldCards: (indices: number[]) => void;
  toggleHeldCard: (index: number) => void;
  confirmHold: () => Promise<void>;
  rerollCard: (cardIndex: number) => Promise<void>;
  peekNextCard: () => Promise<void>;
  processAction: (action: CombatAction) => Promise<void>;
  clearRoundState: () => void;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  // Initial state
  npcs: [],
  activeCombat: null,
  inCombat: false,
  combatHistory: [],
  combatStats: null,
  isProcessingCombat: false,
  isLoading: false,
  error: null,

  // Sprint 2: Hold/Discard initial state
  roundState: null,
  heldCardIndices: [],
  combatEnded: false,
  lootAwarded: null,
  deathPenalty: null,

  fetchNPCs: async (locationId?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = locationId
        ? await combatService.getNPCsByLocation(locationId)
        : await combatService.getNPCs();

      if (response.success && response.data) {
        set({
          npcs: response.data.npcs,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load NPCs');
      }
    } catch (error: any) {
      logger.error('Failed to fetch NPCs', error, { locationId });
      set({
        npcs: [],
        isLoading: false,
        error: error.message || 'Failed to load NPCs',
      });
    }
  },

  startCombat: async (npcId: string, characterId: string) => {
    if (!characterId) {
      set({ error: 'No character selected' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      const response = await combatService.startCombat(npcId, characterId);

      logger.debug('Combat API Response', { response, npcId, characterId });

      if (response.success && response.data) {
        set({
          activeCombat: response.data.encounter,
          inCombat: true,
          isProcessingCombat: false,
          error: null,
        });
        // Dispatch tutorial event for combat initiation
        dispatchCombatStarted(npcId);
      } else {
        const errorMsg = response.error || 'Failed to start combat';
        logger.error('Combat start failed', new Error(errorMsg), { response, npcId, characterId });
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      logger.error('Failed to start combat', error, { npcId, characterId });
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to start combat',
      });
      throw error;
    }
  },

  fleeCombat: async () => {
    const { activeCombat } = get();

    if (!activeCombat) {
      set({ error: 'No active combat' });
      return;
    }

    if (!activeCombat._id) {
      set({ error: 'Combat session has no ID' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      const response = await combatService.fleeCombat(activeCombat._id);

      if (response.success && response.data) {
        set({
          activeCombat: null,
          inCombat: false,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to flee combat');
      }
    } catch (error: any) {
      logger.error('Failed to flee combat', error, { combatId: activeCombat._id });
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to flee combat',
      });
      throw error;
    }
  },

  endCombat: () => {
    set({
      activeCombat: null,
      inCombat: false,
      isProcessingCombat: false,
      // Also reset combat end state
      combatEnded: false,
      lootAwarded: null,
      deathPenalty: null,
    });
  },

  fetchCombatHistory: async () => {
    try {
      const response = await combatService.getCombatHistory();

      if (response.success && response.data) {
        set({
          combatHistory: response.data.history,
        });
      }
    } catch (error: any) {
      logger.error('Failed to fetch combat history', error);
    }
  },

  fetchCombatStats: async () => {
    try {
      const response = await combatService.getCombatStats();

      if (response.success && response.data) {
        set({
          combatStats: response.data.stats,
        });
      }
    } catch (error: any) {
      logger.error('Failed to fetch combat stats', error);
    }
  },

  checkActiveCombat: async () => {
    try {
      const response = await combatService.getActiveCombat();

      if (response.success && response.data && response.data.encounter) {
        set({
          activeCombat: response.data.encounter,
          inCombat: true,
        });
      }
    } catch (error: any) {
      logger.error('Failed to check active combat', error);
    }
  },

  clearCombatState: () => {
    set({
      npcs: [],
      activeCombat: null,
      inCombat: false,
      combatHistory: [],
      combatStats: null,
      isProcessingCombat: false,
      isLoading: false,
      error: null,
      // Sprint 2 state
      roundState: null,
      heldCardIndices: [],
      combatEnded: false,
      lootAwarded: null,
      deathPenalty: null,
    });
  },

  /**
   * PRODUCTION FIX: Reset processing state without clearing combat
   * Use when an operation times out or fails but combat might still be active
   */
  resetProcessingState: () => {
    logger.info('[CombatStore] Resetting processing state');
    set({
      isProcessingCombat: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * PRODUCTION FIX: Force end combat state
   * Use when combat is stuck or in an inconsistent state
   * This is a client-side only reset - server state may differ
   */
  forceEndCombat: () => {
    logger.warn('[CombatStore] Force ending combat - state may be inconsistent with server');
    set({
      activeCombat: null,
      inCombat: false,
      isProcessingCombat: false,
      isLoading: false,
      error: null,
      roundState: null,
      heldCardIndices: [],
      combatEnded: true,
      lootAwarded: null,
      deathPenalty: null,
    });
  },

  // ==========================================================================
  // SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ACTIONS
  // ==========================================================================

  startTurn: async () => {
    const { activeCombat } = get();

    if (!activeCombat?._id) {
      set({ error: 'No active combat' });
      return;
    }

    set({ isProcessingCombat: true, error: null, combatEnded: false, lootAwarded: null, deathPenalty: null });

    try {
      const response = await combatService.startTurn(activeCombat._id);

      if (response.success && response.data) {
        set({
          roundState: response.data.roundState,
          heldCardIndices: response.data.roundState?.heldCardIndices || [],
          activeCombat: response.data.encounter,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to start turn');
      }
    } catch (error: any) {
      logger.error('Failed to start turn', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to start turn',
      });
    }
  },

  setHeldCards: (indices: number[]) => {
    set({ heldCardIndices: indices });
  },

  toggleHeldCard: (index: number) => {
    const { heldCardIndices } = get();
    const newIndices = heldCardIndices.includes(index)
      ? heldCardIndices.filter(i => i !== index)
      : [...heldCardIndices, index];
    set({ heldCardIndices: newIndices });
  },

  confirmHold: async () => {
    const { activeCombat, heldCardIndices } = get();

    if (!activeCombat?._id) {
      set({ error: 'No active combat' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      // First send the hold action to set held cards
      const holdResponse = await combatService.processAction(activeCombat._id, {
        type: 'hold',
        cardIndices: heldCardIndices,
      });

      if (!holdResponse.success) {
        throw new Error(holdResponse.error || 'Failed to set held cards');
      }

      // Then confirm the hold
      const confirmResponse = await combatService.processAction(activeCombat._id, {
        type: 'confirm_hold',
      });

      if (confirmResponse.success && confirmResponse.data) {
        const result = confirmResponse.data;
        set({
          roundState: result.roundState as CombatRoundState | null,
          activeCombat: result.encounter as CombatEncounter | null,
          combatEnded: result.combatEnded || false,
          lootAwarded: result.lootAwarded || null,
          deathPenalty: result.deathPenalty || null,
          heldCardIndices: [],
          isProcessingCombat: false,
          error: null,
          inCombat: !result.combatEnded,
        });
      } else {
        throw new Error(confirmResponse.error || 'Failed to confirm hold');
      }
    } catch (error: any) {
      logger.error('Failed to confirm hold', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to confirm hold',
      });
    }
  },

  rerollCard: async (cardIndex: number) => {
    const { activeCombat } = get();

    if (!activeCombat?._id) {
      set({ error: 'No active combat' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      const response = await combatService.processAction(activeCombat._id, {
        type: 'reroll',
        cardIndex,
      });

      if (response.success && response.data) {
        set({
          roundState: response.data.roundState as CombatRoundState | null,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to reroll card');
      }
    } catch (error: any) {
      logger.error('Failed to reroll card', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to reroll card',
      });
    }
  },

  peekNextCard: async () => {
    const { activeCombat } = get();

    if (!activeCombat?._id) {
      set({ error: 'No active combat' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      const response = await combatService.processAction(activeCombat._id, {
        type: 'peek',
      });

      if (response.success && response.data) {
        set({
          roundState: response.data.roundState as CombatRoundState | null,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to peek');
      }
    } catch (error: any) {
      logger.error('Failed to peek', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to peek',
      });
    }
  },

  processAction: async (action: CombatAction) => {
    const { activeCombat } = get();

    if (!activeCombat?._id) {
      set({ error: 'No active combat' });
      return;
    }

    set({ isProcessingCombat: true, error: null });

    try {
      const response = await combatService.processAction(activeCombat._id, action);

      if (response.success && response.data) {
        const result = response.data;
        set({
          roundState: result.roundState as CombatRoundState | null,
          activeCombat: result.encounter as CombatEncounter | null,
          combatEnded: result.combatEnded || false,
          lootAwarded: result.lootAwarded || null,
          deathPenalty: result.deathPenalty || null,
          isProcessingCombat: false,
          error: null,
          inCombat: !result.combatEnded,
        });
      } else {
        throw new Error(response.error || 'Failed to process action');
      }
    } catch (error: any) {
      logger.error('Failed to process action', error, { action });
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to process action',
      });
    }
  },

  clearRoundState: () => {
    set({
      roundState: null,
      heldCardIndices: [],
      combatEnded: false,
      lootAwarded: null,
      deathPenalty: null,
    });
  },

  // ==========================================================================
  // END SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ACTIONS
  // ==========================================================================
}));

export default useCombatStore;
