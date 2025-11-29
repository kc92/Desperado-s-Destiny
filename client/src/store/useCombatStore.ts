/**
 * Combat Store
 * Manages combat encounters and history
 */

import { create } from 'zustand';
import type { NPC, CombatEncounter, CombatResult, CombatStats } from '@desperados/shared';
import { combatService } from '@/services/combat.service';

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

  // Actions
  fetchNPCs: (locationId?: string) => Promise<void>;
  startCombat: (npcId: string, characterId: string) => Promise<void>;
  playTurn: () => Promise<void>;
  fleeCombat: () => Promise<void>;
  endCombat: () => void;
  fetchCombatHistory: () => Promise<void>;
  fetchCombatStats: () => Promise<void>;
  checkActiveCombat: () => Promise<void>;
  clearCombatState: () => void;
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
      console.error('Failed to fetch NPCs:', error);
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

      if (response.success && response.data) {
        set({
          activeCombat: response.data.encounter,
          inCombat: true,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to start combat');
      }
    } catch (error: any) {
      console.error('Failed to start combat:', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to start combat',
      });
      throw error;
    }
  },

  playTurn: async () => {
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
      const response = await combatService.playTurn(activeCombat._id);

      if (response.success && response.data) {
        const { result } = response.data;

        set({
          activeCombat: result.encounter,
          isProcessingCombat: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to play turn');
      }
    } catch (error: any) {
      console.error('Failed to play turn:', error);
      set({
        isProcessingCombat: false,
        error: error.message || 'Failed to play turn',
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
      console.error('Failed to flee combat:', error);
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
      console.error('Failed to fetch combat history:', error);
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
      console.error('Failed to fetch combat stats:', error);
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
      console.error('Failed to check active combat:', error);
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
    });
  },
}));

export default useCombatStore;
