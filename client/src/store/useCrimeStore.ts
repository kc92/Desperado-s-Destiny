/**
 * Crime Store
 * Manages crime, jail, and bounty state
 */

import { create } from 'zustand';
import { crimeService, type Bounty } from '@/services/crime.service';
import { logger } from '@/services/logger.service';

interface CrimeState {
  isJailed: boolean;
  jailedUntil: Date | null;
  wantedLevel: number;
  bountyAmount: number;
  jailTimerId: NodeJS.Timeout | null;
  bailCost: number;
  offense?: string;
  recentCrimes: Array<{ name: string; timestamp: Date }>;
  bounties: Bounty[];
}

interface CrimeStore {
  // State
  crime: CrimeState;
  isLoading: boolean;
  error: string | null;

  // Actions
  checkJailStatus: (characterId: string) => Promise<void>;
  checkWantedStatus: (characterId: string) => Promise<void>;
  payBail: (characterId: string) => Promise<{ success: boolean; newGold: number }>;
  layLow: (characterId: string, useGold: boolean) => Promise<{ success: boolean; newWantedLevel: number; newGold?: number }>;
  arrestPlayer: (characterId: string, targetId: string) => Promise<{ success: boolean; newGold: number }>;
  fetchBounties: () => Promise<void>;
  startJailTimer: () => void;
  stopJailTimer: () => void;
  loadCrimeStatus: (characterId: string) => Promise<void>;
  clearCrimeState: () => void;
}

export const useCrimeStore = create<CrimeStore>((set, get) => ({
  // Initial state
  crime: {
    isJailed: false,
    jailedUntil: null,
    wantedLevel: 0,
    bountyAmount: 0,
    jailTimerId: null,
    bailCost: 0,
    offense: undefined,
    recentCrimes: [],
    bounties: [],
  },
  isLoading: false,
  error: null,

  checkJailStatus: async (characterId: string) => {
    try {
      const jailStatus = await crimeService.getJailStatus(characterId);

      set((state) => ({
        crime: {
          ...state.crime,
          isJailed: jailStatus.isJailed,
          jailedUntil: jailStatus.jailedUntil,
          bailCost: jailStatus.bailCost,
          offense: jailStatus.offense,
        },
      }));

      if (jailStatus.isJailed) {
        get().startJailTimer();
      }
    } catch (error: any) {
      logger.error('Failed to check jail status', error as Error, { context: 'useCrimeStore.checkJailStatus' });
    }
  },

  checkWantedStatus: async (characterId: string) => {
    try {
      const wantedStatus = await crimeService.getWantedStatus(characterId);

      set((state) => ({
        crime: {
          ...state.crime,
          wantedLevel: wantedStatus.wantedLevel,
          bountyAmount: wantedStatus.bountyAmount,
          recentCrimes: wantedStatus.recentCrimes,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to check wanted status', error as Error, { context: 'useCrimeStore.checkWantedStatus' });
    }
  },

  payBail: async (characterId: string) => {
    // Validate characterId before making API call
    if (!characterId) {
      logger.error('[CrimeStore] payBail called with empty characterId');
      throw new Error('Character ID is required for bail payment');
    }
    logger.debug('[CrimeStore] payBail called with characterId:', { characterId });

    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.payBail(characterId);

      if (result.success) {
        set((state) => ({
          crime: {
            ...state.crime,
            isJailed: false,
            jailedUntil: null,
          },
          isLoading: false,
          error: null,
        }));

        get().stopJailTimer();
        return { success: true, newGold: result.newGold ?? 0 };
      } else {
        throw new Error('Failed to pay bail');
      }
    } catch (error: any) {
      logger.error('Failed to pay bail', error as Error, { context: 'useCrimeStore.payBail', characterId });
      set({
        isLoading: false,
        error: error.message || 'Failed to pay bail',
      });
      throw error;
    }
  },

  layLow: async (characterId: string, useGold: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.layLow(characterId, useGold);

      if (result.success) {
        set((state) => ({
          crime: {
            ...state.crime,
            wantedLevel: result.newWantedLevel,
          },
          isLoading: false,
          error: null,
        }));

        return { success: true, newWantedLevel: result.newWantedLevel, newGold: result.newGold };
      } else {
        throw new Error('Failed to lay low');
      }
    } catch (error: any) {
      logger.error('Failed to lay low', error as Error, { context: 'useCrimeStore.layLow', characterId, useGold });
      set({
        isLoading: false,
        error: error.message || 'Failed to lay low',
      });
      throw error;
    }
  },

  arrestPlayer: async (characterId: string, targetId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.arrestPlayer(characterId, targetId);

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        await get().fetchBounties();
        return { success: true, newGold: result.newGold ?? 0 };
      }

      throw new Error('Failed to arrest player');
    } catch (error: any) {
      logger.error('Failed to arrest player', error as Error, { context: 'useCrimeStore.arrestPlayer', characterId, targetId });
      set({
        isLoading: false,
        error: error.message || 'Failed to arrest player',
      });
      throw error;
    }
  },

  fetchBounties: async () => {
    try {
      const bounties = await crimeService.getBounties();

      set((state) => ({
        crime: {
          ...state.crime,
          bounties,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch bounties', error as Error, { context: 'useCrimeStore.fetchBounties' });
    }
  },

  startJailTimer: () => {
    const { crime, stopJailTimer } = get();

    if (crime.jailTimerId) {
      stopJailTimer();
    }

    const timer = setInterval(() => {
      const { crime } = get();

      if (!crime.jailedUntil) {
        stopJailTimer();
        return;
      }

      const now = new Date();
      if (now >= crime.jailedUntil) {
        set((state) => ({
          crime: {
            ...state.crime,
            isJailed: false,
            jailedUntil: null,
          },
        }));

        stopJailTimer();
      }
    }, 1000);

    set((state) => ({
      crime: {
        ...state.crime,
        jailTimerId: timer,
      },
    }));
  },

  stopJailTimer: () => {
    const { crime } = get();

    if (crime.jailTimerId) {
      clearInterval(crime.jailTimerId);
      set((state) => ({
        crime: {
          ...state.crime,
          jailTimerId: null,
        },
      }));
    }
  },

  loadCrimeStatus: async (characterId: string) => {
    await Promise.all([
      get().checkJailStatus(characterId),
      get().checkWantedStatus(characterId),
    ]);
  },

  clearCrimeState: () => {
    get().stopJailTimer();
    set({
      crime: {
        isJailed: false,
        jailedUntil: null,
        wantedLevel: 0,
        bountyAmount: 0,
        jailTimerId: null,
        bailCost: 0,
        offense: undefined,
        recentCrimes: [],
        bounties: [],
      },
      isLoading: false,
      error: null,
    });
  },
}));

export default useCrimeStore;
