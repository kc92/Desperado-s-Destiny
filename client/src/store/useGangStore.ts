/**
 * Gang Store
 * Manages gang state (current gang, gangs list, territories, wars) using Zustand with Socket.io integration
 */

import { create } from 'zustand';
import type {
  Gang,
  GangSearchFilters,
  GangBankTransaction,
  Territory,
  GangWar,
  GangUpgradeType,
  GangRole,
} from '@desperados/shared';
import { gangService } from '@/services/gang.service';
import { socketService } from '@/services/socket.service';
import { useEffect } from 'react';
import { logger } from '@/services/logger.service';

// =============================================================================
// SOCKET LISTENER TRACKING (Prevents memory leaks from duplicate listeners)
// Pattern from useChatStore - tracks all registered listeners for proper cleanup
// =============================================================================

interface RegisteredGangListener {
  event: string;
  handler: (...args: unknown[]) => void;
}

const registeredGangListeners: RegisteredGangListener[] = [];

/**
 * Add a socket listener and track it for cleanup
 */
const addTrackedGangListener = (event: string, handler: (...args: unknown[]) => void): void => {
  socketService.on(event as any, handler as any);
  registeredGangListeners.push({ event, handler });
};

/**
 * Remove all tracked gang socket listeners
 * Called before re-initialization and on cleanup
 */
const removeAllTrackedGangListeners = (): void => {
  registeredGangListeners.forEach(({ event, handler }) => {
    socketService.off(event as any, handler as any);
  });
  registeredGangListeners.length = 0; // Clear the array
};

interface GangStore {
  currentGang: Gang | null;
  gangs: Gang[];
  gangsPagination: { total: number; hasMore: boolean };
  territories: Territory[];
  activeWars: GangWar[];
  selectedGang: Gang | null;
  selectedWar: GangWar | null;
  bankTransactions: GangBankTransaction[];
  bankPagination: { total: number; hasMore: boolean };
  isLoading: boolean;
  isCreating: boolean;
  isDepositing: boolean;
  isWithdrawing: boolean;
  isUpgrading: boolean;
  error: string | null;

  fetchCurrentGang: () => Promise<void>;
  createGang: (name: string, tag: string, characterId: string) => Promise<Gang>;
  fetchGangs: (filters?: GangSearchFilters) => Promise<void>;
  fetchGang: (id: string) => Promise<Gang>;
  joinGang: (gangId: string) => Promise<void>;
  leaveGang: () => Promise<void>;
  kickMember: (gangId: string, characterId: string) => Promise<void>;
  promoteMember: (gangId: string, characterId: string, newRole: GangRole) => Promise<void>;
  depositToBank: (gangId: string, amount: number) => Promise<void>;
  withdrawFromBank: (gangId: string, amount: number) => Promise<void>;
  purchaseUpgrade: (gangId: string, upgradeType: GangUpgradeType) => Promise<void>;
  disbandGang: (gangId: string) => Promise<void>;
  fetchBankTransactions: (gangId: string, limit?: number, offset?: number) => Promise<void>;
  fetchTerritories: () => Promise<void>;
  fetchTerritory: (id: string) => Promise<Territory>;
  declareWar: (territoryId: string, funding: number) => Promise<GangWar>;
  contributeToWar: (warId: string, amount: number) => Promise<void>;
  fetchActiveWars: () => Promise<void>;
  fetchWar: (warId: string) => Promise<GangWar>;
  setSelectedGang: (gang: Gang | null) => void;
  setSelectedWar: (war: GangWar | null) => void;
  clearError: () => void;
  initializeSocketListeners: () => () => void;
}

export const useGangStore = create<GangStore>((set, _get) => ({
  currentGang: null,
  gangs: [],
  gangsPagination: { total: 0, hasMore: false },
  territories: [],
  activeWars: [],
  selectedGang: null,
  selectedWar: null,
  bankTransactions: [],
  bankPagination: { total: 0, hasMore: false },
  isLoading: false,
  isCreating: false,
  isDepositing: false,
  isWithdrawing: false,
  isUpgrading: false,
  error: null,

  fetchCurrentGang: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getCurrentGang();

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load gang';
      logger.error('Failed to fetch current gang', error as Error, { context: 'useGangStore.fetchCurrentGang' });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  createGang: async (name: string, tag: string, characterId: string) => {
    set({ isCreating: true, error: null });

    try {
      const response = await gangService.createGang(name, tag, characterId);

      if (response.success && response.data) {
        const gang = response.data.gang;

        set({
          currentGang: gang,
          isCreating: false,
          error: null,
        });

        return gang;
      } else {
        throw new Error(response.error || 'Failed to create gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create gang';
      logger.error('Failed to create gang', error as Error, { context: 'useGangStore.createGang', name, tag });
      set({
        isCreating: false,
        error: message,
      });
      throw error;
    }
  },

  fetchGangs: async (filters?: GangSearchFilters) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getGangs(filters);

      if (response.success && response.data) {
        set({
          gangs: response.data.gangs,
          gangsPagination: {
            total: response.data.total,
            hasMore: response.data.hasMore,
          },
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load gangs');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load gangs';
      logger.error('Failed to fetch gangs', error as Error, { context: 'useGangStore.fetchGangs', filters });
      set({
        gangs: [],
        isLoading: false,
        error: message,
      });
    }
  },

  fetchGang: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getGang(id);

      if (response.success && response.data) {
        const gang = response.data.gang;

        set({
          selectedGang: gang,
          isLoading: false,
          error: null,
        });

        return gang;
      } else {
        throw new Error(response.error || 'Failed to load gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load gang';
      logger.error('Failed to fetch gang', error as Error, { context: 'useGangStore.fetchGang', gangId: id });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  joinGang: async (gangId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.joinGang(gangId);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to join gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to join gang';
      logger.error('Failed to join gang', error as Error, { context: 'useGangStore.joinGang', gangId });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  leaveGang: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.leaveGang();

      if (response.success) {
        set({
          currentGang: null,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to leave gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to leave gang';
      logger.error('Failed to leave gang', error as Error, { context: 'useGangStore.leaveGang' });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  kickMember: async (gangId: string, characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.kickMember(gangId, characterId);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to kick member');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to kick member';
      logger.error('Failed to kick member', error as Error, { context: 'useGangStore.kickMember', gangId, characterId });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  promoteMember: async (gangId: string, characterId: string, newRole: GangRole) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.promoteMember(gangId, characterId, newRole);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to promote member');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to promote member';
      logger.error('Failed to promote member', error as Error, { context: 'useGangStore.promoteMember', gangId, characterId, newRole });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  depositToBank: async (gangId: string, amount: number) => {
    set({ isDepositing: true, error: null });

    try {
      const response = await gangService.depositToBank(gangId, amount);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isDepositing: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to deposit');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to deposit';
      logger.error('Failed to deposit', error as Error, { context: 'useGangStore.depositToBank', gangId, amount });
      set({
        isDepositing: false,
        error: message,
      });
      throw error;
    }
  },

  withdrawFromBank: async (gangId: string, amount: number) => {
    set({ isWithdrawing: true, error: null });

    try {
      const response = await gangService.withdrawFromBank(gangId, amount);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isWithdrawing: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to withdraw');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to withdraw';
      logger.error('Failed to withdraw', error as Error, { context: 'useGangStore.withdrawFromBank', gangId, amount });
      set({
        isWithdrawing: false,
        error: message,
      });
      throw error;
    }
  },

  purchaseUpgrade: async (gangId: string, upgradeType: GangUpgradeType) => {
    set({ isUpgrading: true, error: null });

    try {
      const response = await gangService.purchaseUpgrade(gangId, upgradeType);

      if (response.success && response.data) {
        set({
          currentGang: response.data.gang,
          isUpgrading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to purchase upgrade');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to purchase upgrade';
      logger.error('Failed to purchase upgrade', error as Error, { context: 'useGangStore.purchaseUpgrade', gangId, upgradeType });
      set({
        isUpgrading: false,
        error: message,
      });
      throw error;
    }
  },

  disbandGang: async (gangId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.disbandGang(gangId);

      if (response.success) {
        set({
          currentGang: null,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to disband gang');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to disband gang';
      logger.error('Failed to disband gang', error as Error, { context: 'useGangStore.disbandGang', gangId });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  fetchBankTransactions: async (gangId: string, limit: number = 50, offset: number = 0) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getBankTransactions(gangId, limit, offset);

      if (response.success && response.data) {
        set({
          bankTransactions: response.data.transactions,
          bankPagination: {
            total: response.data.total,
            hasMore: response.data.hasMore,
          },
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load transactions');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load transactions';
      logger.error('Failed to fetch transactions', error as Error, { context: 'useGangStore.fetchBankTransactions', gangId, limit, offset });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritories: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getTerritories();

      if (response.success && response.data) {
        set({
          territories: response.data.territories,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load territories');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territories';
      logger.error('Failed to fetch territories', error as Error, { context: 'useGangStore.fetchTerritories' });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritory: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getTerritory(id);

      if (response.success && response.data) {
        const territory = response.data.territory;

        set((state) => ({
          territories: state.territories.map((t) => (t._id === territory._id ? territory : t)),
          isLoading: false,
          error: null,
        }));

        return territory;
      } else {
        throw new Error(response.error || 'Failed to load territory');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territory';
      logger.error('Failed to fetch territory', error as Error, { context: 'useGangStore.fetchTerritory', territoryId: id });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  declareWar: async (territoryId: string, funding: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.declareWar(territoryId, funding);

      if (response.success && response.data) {
        const war = response.data.war;

        set((state) => ({
          activeWars: [...state.activeWars, war],
          isLoading: false,
          error: null,
        }));

        return war;
      } else {
        throw new Error(response.error || 'Failed to declare war');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to declare war';
      logger.error('Failed to declare war', error as Error, { context: 'useGangStore.declareWar', territoryId, funding });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  contributeToWar: async (warId: string, amount: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.contributeToWar(warId, amount);

      if (response.success && response.data) {
        const updatedWar = response.data.war;

        set((state) => ({
          activeWars: state.activeWars.map((w) => (w._id === warId ? updatedWar : w)),
          selectedWar: state.selectedWar?._id === warId ? updatedWar : state.selectedWar,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to contribute to war');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to contribute to war';
      logger.error('Failed to contribute to war', error as Error, { context: 'useGangStore.contributeToWar', warId, amount });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  fetchActiveWars: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getActiveWars();

      if (response.success && response.data) {
        set({
          activeWars: response.data.wars,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load active wars');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load active wars';
      logger.error('Failed to fetch active wars', error as Error, { context: 'useGangStore.fetchActiveWars' });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchWar: async (warId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await gangService.getWar(warId);

      if (response.success && response.data) {
        const war = response.data.war;

        set({
          selectedWar: war,
          isLoading: false,
          error: null,
        });

        return war;
      } else {
        throw new Error(response.error || 'Failed to load war');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load war';
      logger.error('Failed to fetch war', error as Error, { context: 'useGangStore.fetchWar', warId });
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  setSelectedGang: (gang: Gang | null) => {
    set({ selectedGang: gang });
  },

  setSelectedWar: (war: GangWar | null) => {
    set({ selectedWar: war });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeSocketListeners: () => {
    if (!socketService.isConnected()) {
      logger.warn('[GangStore] Socket not connected, skipping listener initialization', { context: 'useGangStore.initializeSocketListeners' });
      return () => {};
    }

    // MEMORY LEAK FIX: Clean up any existing listeners before registering new ones
    // This prevents duplicate listeners from accumulating on re-renders
    if (registeredGangListeners.length > 0) {
      logger.debug('[GangStore] Cleaning up existing listeners before re-initialization', {
        context: 'useGangStore.initializeSocketListeners',
        existingListenerCount: registeredGangListeners.length
      });
      removeAllTrackedGangListeners();
    }

    // Handler for member joined events
    const handleMemberJoined = (data: unknown) => {
      const typedData = data as { gangId: string; member: { characterId: string; characterName: string; level: number; role: GangRole; joinedAt: Date; contribution: number } };
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== typedData.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: [...state.currentGang.members, typedData.member],
          },
        };
      });
    };

    // Handler for member left events
    const handleMemberLeft = (data: unknown) => {
      const typedData = data as { gangId: string; characterId: string };
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== typedData.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: state.currentGang.members.filter((m) => m.characterId !== typedData.characterId),
          },
        };
      });
    };

    // Handler for member promoted events
    const handleMemberPromoted = (data: unknown) => {
      const typedData = data as { gangId: string; characterId: string; newRole: GangRole };
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== typedData.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: state.currentGang.members.map((m) =>
              m.characterId === typedData.characterId ? { ...m, role: typedData.newRole } : m
            ),
          },
        };
      });
    };

    // Handler for bank updated events
    const handleBankUpdated = (data: unknown) => {
      const typedData = data as { gangId: string; newBalance: number };
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== typedData.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            bank: typedData.newBalance,
          },
        };
      });
    };

    // Handler for upgrade purchased events
    const handleUpgradePurchased = (data: unknown) => {
      const typedData = data as { gangId: string; gang: Gang };
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== typedData.gangId) return state;

        return {
          currentGang: typedData.gang,
        };
      });
    };

    // Handler for war declared events
    const handleWarDeclared = (data: unknown) => {
      const war = data as GangWar;
      set((state) => ({
        activeWars: [...state.activeWars, war],
        territories: state.territories.map((t) =>
          war.contestedZones?.includes(t._id) ? { ...t, isUnderSiege: true, activeWarId: war._id } : t
        ),
      }));
    };

    // Handler for war contributed events
    const handleWarContributed = (data: unknown) => {
      const typedData = data as { warId: string; capturePoints: number; war: GangWar };
      set((state) => ({
        activeWars: state.activeWars.map((w) => (w._id === typedData.warId ? typedData.war : w)),
        selectedWar: state.selectedWar?._id === typedData.warId ? typedData.war : state.selectedWar,
      }));
    };

    // Handler for war resolved events
    const handleWarResolved = (data: unknown) => {
      const typedData = data as { warId: string; territoryId: string; winnerGangId: string | null };
      set((state) => ({
        activeWars: state.activeWars.filter((w) => w._id !== typedData.warId),
        territories: state.territories.map((t) =>
          t._id === typedData.territoryId
            ? { ...t, isUnderSiege: false, activeWarId: null, controllingGangId: typedData.winnerGangId }
            : t
        ),
      }));
    };

    // Handler for territory conquered events
    const handleTerritoryConquered = (data: unknown) => {
      const typedData = data as { territoryId: string; newOwnerGangId: string; newOwnerGangName: string };
      set((state) => ({
        territories: state.territories.map((t) =>
          t._id === typedData.territoryId
            ? {
                ...t,
                controllingGangId: typedData.newOwnerGangId,
                controllingGangName: typedData.newOwnerGangName,
                lastConquered: new Date(),
              }
            : t
        ),
      }));
    };

    // Register all listeners with tracking for proper cleanup
    addTrackedGangListener('gang:member_joined', handleMemberJoined);
    addTrackedGangListener('gang:member_left', handleMemberLeft);
    addTrackedGangListener('gang:member_promoted', handleMemberPromoted);
    addTrackedGangListener('gang:bank_updated', handleBankUpdated);
    addTrackedGangListener('gang:upgrade_purchased', handleUpgradePurchased);
    addTrackedGangListener('territory:war_declared', handleWarDeclared);
    addTrackedGangListener('territory:war_contributed', handleWarContributed);
    addTrackedGangListener('territory:war_resolved', handleWarResolved);
    addTrackedGangListener('territory:conquered', handleTerritoryConquered);

    logger.debug('[GangStore] Socket listeners initialized', {
      context: 'useGangStore.initializeSocketListeners',
      listenerCount: registeredGangListeners.length
    });

    // Return cleanup function that removes all tracked listeners
    return removeAllTrackedGangListeners;
  },
}));

export function useGangSocketListeners() {
  const initializeSocketListeners = useGangStore((state) => state.initializeSocketListeners);

  useEffect(() => {
    const cleanup = initializeSocketListeners();
    return cleanup;
  }, [initializeSocketListeners]);
}
