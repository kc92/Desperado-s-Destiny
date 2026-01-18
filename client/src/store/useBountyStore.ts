/**
 * Bounty Store
 * Manages bounty system and bounty hunter state
 */

import { create } from 'zustand';
import {
  bountyService,
  type Bounty,
  type BountyBoard,
  type WantedLevel,
  type BountyListing,
  type MostWantedEntry,
  type BountyHunterCheck,
} from '@/services/bounty.service';
import {
  bountyHunterService,
  type BountyHunter,
  type ActiveEncounter,
  type HireableHunter,
} from '@/services/bountyHunter.service';
import { logger } from '@/services/logger.service';

interface BountyState {
  // Bounty Board
  bountyBoard: BountyBoard | null;
  activeBounties: BountyListing[];

  // My Bounty Status
  myBounty: WantedLevel | null;

  // Most Wanted
  mostWanted: MostWantedEntry[];

  // Hunter Status
  hunterCheck: BountyHunterCheck | null;

  // Bounty Hunters
  allHunters: BountyHunter[];
  availableHunters: HireableHunter[];
  activeEncounters: ActiveEncounter[];
}

interface BountyStore {
  // State
  bounty: BountyState;
  isLoading: boolean;
  error: string | null;

  // Bounty Actions
  fetchBounties: (params?: { limit?: number; location?: string }) => Promise<void>;
  fetchMyBounty: () => Promise<void>;
  fetchMostWanted: (limit?: number) => Promise<void>;
  claimBounty: (bountyId: string) => Promise<{ success: boolean; reward: number; newGold: number }>;
  postBounty: (targetId: string, amount: number, reason?: string) => Promise<{ success: boolean; newGold: number }>;
  checkBountyHunter: () => Promise<void>;
  getCharacterBounties: (characterId: string) => Promise<Bounty[]>;

  // Bounty Hunter Actions
  fetchAllHunters: () => Promise<void>;
  fetchAvailableHunters: () => Promise<void>;
  fetchActiveEncounters: () => Promise<void>;
  becomeHunter: (hunterId: string, targetId: string, bountyAmount?: number) => Promise<{ success: boolean; cost: number; newGold: number }>;
  huntTarget: (encounterId: string, action: 'fight' | 'escape' | 'surrender') => Promise<{ success: boolean; result: string; newGold?: number }>;
  payOffHunter: (encounterId: string) => Promise<{ success: boolean; amountPaid: number; newGold: number }>;

  // Utility Actions
  loadBountyStatus: () => Promise<void>;
  clearBountyState: () => void;
}

export const useBountyStore = create<BountyStore>((set, get) => ({
  // Initial state
  bounty: {
    bountyBoard: null,
    activeBounties: [],
    myBounty: null,
    mostWanted: [],
    hunterCheck: null,
    allHunters: [],
    availableHunters: [],
    activeEncounters: [],
  },
  isLoading: false,
  error: null,

  // Bounty Actions

  fetchBounties: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const bountyBoard = await bountyService.getBountyBoard(params);

      set((state) => ({
        bounty: {
          ...state.bounty,
          bountyBoard,
          activeBounties: bountyBoard.bounties,
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      logger.error('Failed to fetch bounties', error as Error, { context: 'useBountyStore.fetchBounties' });
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch bounties',
      });
      throw error;
    }
  },

  fetchMyBounty: async () => {
    try {
      const myBounty = await bountyService.getWantedLevel();

      set((state) => ({
        bounty: {
          ...state.bounty,
          myBounty,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch my bounty', error as Error, { context: 'useBountyStore.fetchMyBounty' });
    }
  },

  fetchMostWanted: async (limit) => {
    try {
      const mostWanted = await bountyService.getMostWanted({ limit });

      set((state) => ({
        bounty: {
          ...state.bounty,
          mostWanted,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch most wanted', error as Error, { context: 'useBountyStore.fetchMostWanted' });
    }
  },

  claimBounty: async (bountyId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await bountyService.collectBounty({ bountyId });

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        // Refresh bounty board after claiming
        await get().fetchBounties();

        return {
          success: true,
          reward: result.reward,
          newGold: result.newCharacterGold,
        };
      } else {
        throw new Error('Failed to claim bounty');
      }
    } catch (error: any) {
      logger.error('Failed to claim bounty', error as Error, { context: 'useBountyStore.claimBounty' });
      set({
        isLoading: false,
        error: error.message || 'Failed to claim bounty',
      });
      throw error;
    }
  },

  postBounty: async (targetId: string, amount: number, reason?: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await bountyService.placeBounty({ targetId, amount, reason });

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        // Refresh bounty board after posting
        await get().fetchBounties();

        return {
          success: true,
          newGold: result.newCharacterGold,
        };
      } else {
        throw new Error('Failed to post bounty');
      }
    } catch (error: any) {
      logger.error('Failed to post bounty', error as Error, { context: 'useBountyStore.postBounty' });
      set({
        isLoading: false,
        error: error.message || 'Failed to post bounty',
      });
      throw error;
    }
  },

  checkBountyHunter: async () => {
    try {
      const hunterCheck = await bountyService.checkBountyHunter();

      set((state) => ({
        bounty: {
          ...state.bounty,
          hunterCheck,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to check bounty hunter', error as Error, { context: 'useBountyStore.checkBountyHunter' });
    }
  },

  getCharacterBounties: async (characterId: string) => {
    try {
      const bounties = await bountyService.getCharacterBounties(characterId);
      return bounties;
    } catch (error: any) {
      logger.error('Failed to get character bounties', error as Error, { context: 'useBountyStore.getCharacterBounties' });
      throw error;
    }
  },

  // Bounty Hunter Actions

  fetchAllHunters: async () => {
    try {
      const allHunters = await bountyHunterService.getAllHunters();

      set((state) => ({
        bounty: {
          ...state.bounty,
          allHunters,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch all hunters', error as Error, { context: 'useBountyStore.fetchAllHunters' });
    }
  },

  fetchAvailableHunters: async () => {
    try {
      const availableHunters = await bountyHunterService.getAvailableHunters();

      set((state) => ({
        bounty: {
          ...state.bounty,
          availableHunters,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch available hunters', error as Error, { context: 'useBountyStore.fetchAvailableHunters' });
    }
  },

  fetchActiveEncounters: async () => {
    try {
      const activeEncounters = await bountyHunterService.getActiveEncounters();

      set((state) => ({
        bounty: {
          ...state.bounty,
          activeEncounters,
        },
      }));
    } catch (error: any) {
      logger.error('Failed to fetch active encounters', error as Error, { context: 'useBountyStore.fetchActiveEncounters' });
    }
  },

  becomeHunter: async (hunterId: string, targetId: string, bountyAmount?: number) => {
    set({ isLoading: true, error: null });

    try {
      const result = await bountyHunterService.hireHunter({
        hunterId,
        targetCharacterId: targetId,
        bountyAmount,
      });

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        // Refresh active encounters after hiring
        await get().fetchActiveEncounters();

        return {
          success: true,
          cost: result.cost,
          newGold: result.newCharacterGold,
        };
      } else {
        throw new Error('Failed to hire hunter');
      }
    } catch (error: any) {
      logger.error('Failed to hire hunter', error as Error, { context: 'useBountyStore.becomeHunter' });
      set({
        isLoading: false,
        error: error.message || 'Failed to hire hunter',
      });
      throw error;
    }
  },

  huntTarget: async (encounterId: string, action: 'fight' | 'escape' | 'surrender') => {
    set({ isLoading: true, error: null });

    try {
      const result = await bountyHunterService.resolveEncounter({
        encounterId,
        action,
      });

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        // Refresh active encounters after resolving
        await get().fetchActiveEncounters();

        return {
          success: true,
          result: result.result,
          newGold: result.newCharacterGold,
        };
      } else {
        throw new Error('Failed to resolve encounter');
      }
    } catch (error: any) {
      logger.error('Failed to resolve encounter', error as Error, { context: 'useBountyStore.huntTarget' });
      set({
        isLoading: false,
        error: error.message || 'Failed to resolve encounter',
      });
      throw error;
    }
  },

  payOffHunter: async (encounterId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await bountyHunterService.payOffHunter({ encounterId });

      if (result.success) {
        set({
          isLoading: false,
          error: null,
        });

        // Refresh active encounters after paying off
        await get().fetchActiveEncounters();

        return {
          success: true,
          amountPaid: result.amountPaid,
          newGold: result.newCharacterGold,
        };
      } else {
        throw new Error('Failed to pay off hunter');
      }
    } catch (error: any) {
      logger.error('Failed to pay off hunter', error as Error, { context: 'useBountyStore.payOffHunter' });
      set({
        isLoading: false,
        error: error.message || 'Failed to pay off hunter',
      });
      throw error;
    }
  },

  // Utility Actions

  loadBountyStatus: async () => {
    // Use allSettled to handle partial failures gracefully
    // This prevents one failing endpoint from crashing the entire page
    const results = await Promise.allSettled([
      get().fetchBounties().catch(() => null),
      get().fetchMyBounty().catch(() => null),
      get().fetchMostWanted(10).catch(() => null),
      get().checkBountyHunter().catch(() => null),
      get().fetchActiveEncounters().catch(() => null),
    ]);

    // Check if all failed - only then set a global error
    const allFailed = results.every(r => r.status === 'rejected');
    if (allFailed) {
      set({ error: 'Failed to load bounty data. Please try again.' });
    }
  },

  clearBountyState: () => {
    set({
      bounty: {
        bountyBoard: null,
        activeBounties: [],
        myBounty: null,
        mostWanted: [],
        hunterCheck: null,
        allHunters: [],
        availableHunters: [],
        activeEncounters: [],
      },
      isLoading: false,
      error: null,
    });
  },
}));

export default useBountyStore;
