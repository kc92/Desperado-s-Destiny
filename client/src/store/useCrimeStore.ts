/**
 * Crime Store
 * Manages crime, jail, and bounty state
 */

import { create } from 'zustand';
import { crimeService, type Bounty } from '@/services/crime.service';

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
  checkJailStatus: () => Promise<void>;
  checkWantedStatus: () => Promise<void>;
  payBail: () => Promise<{ success: boolean; newGold: number }>;
  layLow: (useGold: boolean) => Promise<{ success: boolean; newWantedLevel: number; newGold?: number }>;
  arrestPlayer: (targetId: string) => Promise<{ success: boolean; newGold: number }>;
  fetchBounties: () => Promise<void>;
  startJailTimer: () => void;
  stopJailTimer: () => void;
  loadCrimeStatus: () => Promise<void>;
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

  checkJailStatus: async () => {
    try {
      const jailStatus = await crimeService.getJailStatus();

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
      console.error('Failed to check jail status:', error);
    }
  },

  checkWantedStatus: async () => {
    try {
      const wantedStatus = await crimeService.getWantedStatus();

      set((state) => ({
        crime: {
          ...state.crime,
          wantedLevel: wantedStatus.wantedLevel,
          bountyAmount: wantedStatus.bountyAmount,
          recentCrimes: wantedStatus.recentCrimes,
        },
      }));
    } catch (error: any) {
      console.error('Failed to check wanted status:', error);
    }
  },

  payBail: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.payBail();

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
        return { success: true, newGold: result.newGold };
      } else {
        throw new Error('Failed to pay bail');
      }
    } catch (error: any) {
      console.error('Failed to pay bail:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to pay bail',
      });
      throw error;
    }
  },

  layLow: async (useGold: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.layLow(useGold);

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
      console.error('Failed to lay low:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to lay low',
      });
      throw error;
    }
  },

  arrestPlayer: async (targetId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await crimeService.arrestPlayer(targetId);

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        await get().fetchBounties();
        return { success: true, newGold: result.newGold };
      }

      throw new Error('Failed to arrest player');
    } catch (error: any) {
      console.error('Failed to arrest player:', error);
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
      console.error('Failed to fetch bounties:', error);
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

  loadCrimeStatus: async () => {
    await Promise.all([
      get().checkJailStatus(),
      get().checkWantedStatus(),
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
