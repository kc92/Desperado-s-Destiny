/**
 * Energy Store
 * Manages energy state and regeneration
 */

import { create } from 'zustand';
import { characterService } from '@/services/character.service';

interface EnergyState {
  currentEnergy: number;
  maxEnergy: number;
  regenRate: number;
  lastUpdate: Date;
  isPremium: boolean;
}

interface EnergyStore {
  // State
  energy: EnergyState | null;
  energyTimerId: NodeJS.Timeout | null;

  // Actions
  initializeEnergy: (current: number, max: number, regenRate: number, isPremium?: boolean) => void;
  updateEnergy: (current: number) => void;
  deductEnergy: (cost: number) => void;
  startEnergyTimer: () => void;
  stopEnergyTimer: () => void;
  syncEnergyWithBackend: (characterId: string) => Promise<void>;
  clearEnergyState: () => void;
}

export const useEnergyStore = create<EnergyStore>((set, get) => ({
  // Initial state
  energy: null,
  energyTimerId: null,

  initializeEnergy: (current: number, max: number, regenRate: number, isPremium: boolean = false) => {
    set({
      energy: {
        currentEnergy: current,
        maxEnergy: max,
        regenRate,
        lastUpdate: new Date(),
        isPremium,
      },
    });

    get().startEnergyTimer();
  },

  updateEnergy: (current: number) => {
    set((state) => {
      if (!state.energy) return state;

      return {
        energy: {
          ...state.energy,
          currentEnergy: current,
          lastUpdate: new Date(),
        },
      };
    });
  },

  deductEnergy: (cost: number) => {
    set((state) => {
      if (!state.energy) return state;

      return {
        energy: {
          ...state.energy,
          currentEnergy: Math.max(0, state.energy.currentEnergy - cost),
          lastUpdate: new Date(),
        },
      };
    });
  },

  startEnergyTimer: () => {
    const { energyTimerId, stopEnergyTimer } = get();

    if (energyTimerId) {
      stopEnergyTimer();
    }

    const timer = setInterval(() => {
      set((state) => {
        if (!state.energy) return state;

        const { currentEnergy, maxEnergy, regenRate, lastUpdate } = state.energy;

        if (currentEnergy >= maxEnergy) return state;

        const now = new Date();
        const elapsedMs = now.getTime() - lastUpdate.getTime();
        const regenPerMs = regenRate / (60 * 60 * 1000);
        const regenAmount = elapsedMs * regenPerMs;
        const newEnergy = Math.min(currentEnergy + regenAmount, maxEnergy);

        return {
          energy: {
            ...state.energy,
            currentEnergy: newEnergy,
            lastUpdate: now,
          },
        };
      });
    }, 1000);

    set({ energyTimerId: timer });
  },

  stopEnergyTimer: () => {
    const { energyTimerId } = get();

    if (energyTimerId) {
      clearInterval(energyTimerId);
      set({ energyTimerId: null });
    }
  },

  syncEnergyWithBackend: async (characterId: string) => {
    if (!characterId) return;

    try {
      const response = await characterService.getCharacter(characterId);

      if (response.success && response.data) {
        const character = response.data.character;

        set((state) => {
          if (!state.energy) return state;

          return {
            energy: {
              ...state.energy,
              currentEnergy: character.energy,
              maxEnergy: character.maxEnergy,
              lastUpdate: new Date(),
            },
          };
        });
      }
    } catch (error) {
      console.error('Failed to sync energy with backend:', error);
    }
  },

  clearEnergyState: () => {
    get().stopEnergyTimer();
    set({
      energy: null,
      energyTimerId: null,
    });
  },
}));

export default useEnergyStore;
