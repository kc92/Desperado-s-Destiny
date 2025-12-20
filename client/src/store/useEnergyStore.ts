/**
 * Energy Store
 * Manages energy state synchronized with server
 *
 * IMPORTANT: Server is authoritative for energy values.
 * This store is for UI display and optimistic updates only.
 * All energy changes must go through the server.
 */

import { create } from 'zustand';
import { characterService } from '@/services/character.service';
import { logger } from '@/services/logger.service';

interface EnergyState {
  currentEnergy: number;
  maxEnergy: number;
  regenRate: number;
  lastUpdate: Date; // Server's last update time, not client time
  isPremium: boolean;
  isOptimistic: boolean; // True if showing optimistic update, awaiting server confirmation
}

interface EnergyStore {
  // State
  energy: EnergyState | null;

  // Actions
  initializeEnergy: (current: number, max: number, regenRate: number, lastUpdate?: Date, isPremium?: boolean) => void;
  updateEnergy: (current: number, serverTimestamp?: Date) => void;
  applyOptimisticDeduct: (cost: number) => void;
  confirmServerState: (current: number, max: number, serverTimestamp: Date) => void;
  syncEnergyWithBackend: (characterId: string) => Promise<void>;
  clearEnergyState: () => void;
}

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  // Initial state
  energy: null,

  initializeEnergy: (
    current: number,
    max: number,
    regenRate: number,
    lastUpdate?: Date,
    isPremium: boolean = false
  ) => {
    set({
      energy: {
        currentEnergy: current,
        maxEnergy: max,
        regenRate,
        lastUpdate: lastUpdate || new Date(),
        isPremium,
        isOptimistic: false,
      },
    });
  },

  updateEnergy: (current: number, serverTimestamp?: Date) => {
    set((state) => {
      if (!state.energy) return state;

      return {
        energy: {
          ...state.energy,
          currentEnergy: current,
          lastUpdate: serverTimestamp || state.energy.lastUpdate,
          isOptimistic: false,
        },
      };
    });
  },

  /**
   * Apply an optimistic deduction for immediate UI feedback.
   * This will be overwritten when server confirms the actual value.
   */
  applyOptimisticDeduct: (cost: number) => {
    set((state) => {
      if (!state.energy) return state;

      return {
        energy: {
          ...state.energy,
          currentEnergy: Math.max(0, state.energy.currentEnergy - cost),
          isOptimistic: true,
        },
      };
    });
  },

  /**
   * Confirm energy state from server response.
   * This replaces any optimistic updates with actual values.
   */
  confirmServerState: (current: number, max: number, serverTimestamp: Date) => {
    set((state) => {
      if (!state.energy) return state;

      return {
        energy: {
          ...state.energy,
          currentEnergy: current,
          maxEnergy: max,
          lastUpdate: serverTimestamp,
          isOptimistic: false,
        },
      };
    });
  },

  syncEnergyWithBackend: async (characterId: string) => {
    if (!characterId) return;

    try {
      const response = await characterService.getCharacter(characterId);

      if (response.success && response.data) {
        const character = response.data.character;

        set({
          energy: {
            currentEnergy: character.energy,
            maxEnergy: character.maxEnergy,
            regenRate: character.energyRegenRate || 1,
            // Use server's lastEnergyUpdate timestamp if available
            lastUpdate: character.lastEnergyUpdate
              ? new Date(character.lastEnergyUpdate)
              : new Date(),
            isPremium: character.isPremium || false,
            isOptimistic: false,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to sync energy with backend', error as Error, { characterId });
    }
  },

  clearEnergyState: () => {
    set({
      energy: null,
    });
  },
}));

export default useEnergyStore;
