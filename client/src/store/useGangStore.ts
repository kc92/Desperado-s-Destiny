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

// Type assertion helper for socket events not in ServerToClientEvents
type AnyEventHandler = (...args: any[]) => void;

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
  createGang: (name: string, tag: string) => Promise<Gang>;
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
      console.error('Failed to fetch current gang:', error);
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  createGang: async (name: string, tag: string) => {
    set({ isCreating: true, error: null });

    try {
      const response = await gangService.createGang(name, tag);

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
      console.error('Failed to create gang:', error);
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
      console.error('Failed to fetch gangs:', error);
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
      console.error('Failed to fetch gang:', error);
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
      console.error('Failed to join gang:', error);
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
      console.error('Failed to leave gang:', error);
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
      console.error('Failed to kick member:', error);
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
      console.error('Failed to promote member:', error);
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
      console.error('Failed to deposit:', error);
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
      console.error('Failed to withdraw:', error);
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
      console.error('Failed to purchase upgrade:', error);
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
      console.error('Failed to disband gang:', error);
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
      console.error('Failed to fetch transactions:', error);
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
      console.error('Failed to fetch territories:', error);
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
      console.error('Failed to fetch territory:', error);
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
      console.error('Failed to declare war:', error);
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
      console.error('Failed to contribute to war:', error);
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
      console.error('Failed to fetch active wars:', error);
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
      console.error('Failed to fetch war:', error);
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
      console.warn('[GangStore] Socket not connected, skipping listener initialization');
      return () => {};
    }

    const handleMemberJoined = (data: { gangId: string; member: { characterId: string; characterName: string; level: number; role: GangRole; joinedAt: Date; contribution: number } }) => {
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== data.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: [...state.currentGang.members, data.member],
          },
        };
      });
    };

    const handleMemberLeft = (data: { gangId: string; characterId: string }) => {
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== data.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: state.currentGang.members.filter((m) => m.characterId !== data.characterId),
          },
        };
      });
    };

    const handleMemberPromoted = (data: { gangId: string; characterId: string; newRole: GangRole }) => {
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== data.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            members: state.currentGang.members.map((m) =>
              m.characterId === data.characterId ? { ...m, role: data.newRole } : m
            ),
          },
        };
      });
    };

    const handleBankUpdated = (data: { gangId: string; newBalance: number }) => {
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== data.gangId) return state;

        return {
          currentGang: {
            ...state.currentGang,
            bank: data.newBalance,
          },
        };
      });
    };

    const handleUpgradePurchased = (data: { gangId: string; gang: Gang }) => {
      set((state) => {
        if (!state.currentGang || state.currentGang._id !== data.gangId) return state;

        return {
          currentGang: data.gang,
        };
      });
    };

    const handleWarDeclared = (war: GangWar) => {
      set((state) => ({
        activeWars: [...state.activeWars, war],
        territories: state.territories.map((t) =>
          t._id === war.territoryId ? { ...t, isUnderSiege: true, activeWarId: war._id } : t
        ),
      }));
    };

    const handleWarContributed = (data: { warId: string; capturePoints: number; war: GangWar }) => {
      set((state) => ({
        activeWars: state.activeWars.map((w) => (w._id === data.warId ? data.war : w)),
        selectedWar: state.selectedWar?._id === data.warId ? data.war : state.selectedWar,
      }));
    };

    const handleWarResolved = (data: { warId: string; territoryId: string; winnerGangId: string | null }) => {
      set((state) => ({
        activeWars: state.activeWars.filter((w) => w._id !== data.warId),
        territories: state.territories.map((t) =>
          t._id === data.territoryId
            ? { ...t, isUnderSiege: false, activeWarId: null, controllingGangId: data.winnerGangId }
            : t
        ),
      }));
    };

    const handleTerritoryConquered = (data: { territoryId: string; newOwnerGangId: string; newOwnerGangName: string }) => {
      set((state) => ({
        territories: state.territories.map((t) =>
          t._id === data.territoryId
            ? {
                ...t,
                controllingGangId: data.newOwnerGangId,
                controllingGangName: data.newOwnerGangName,
                lastConquered: new Date(),
              }
            : t
        ),
      }));
    };

    socketService.on('gang:member_joined' as any, handleMemberJoined as AnyEventHandler);
    socketService.on('gang:member_left' as any, handleMemberLeft as AnyEventHandler);
    socketService.on('gang:member_promoted' as any, handleMemberPromoted as AnyEventHandler);
    socketService.on('gang:bank_updated' as any, handleBankUpdated as AnyEventHandler);
    socketService.on('gang:upgrade_purchased' as any, handleUpgradePurchased as AnyEventHandler);
    socketService.on('territory:war_declared' as any, handleWarDeclared as AnyEventHandler);
    socketService.on('territory:war_contributed' as any, handleWarContributed as AnyEventHandler);
    socketService.on('territory:war_resolved' as any, handleWarResolved as AnyEventHandler);
    socketService.on('territory:conquered' as any, handleTerritoryConquered as AnyEventHandler);

    return () => {
      socketService.off('gang:member_joined' as any, handleMemberJoined as AnyEventHandler);
      socketService.off('gang:member_left' as any, handleMemberLeft as AnyEventHandler);
      socketService.off('gang:member_promoted' as any, handleMemberPromoted as AnyEventHandler);
      socketService.off('gang:bank_updated' as any, handleBankUpdated as AnyEventHandler);
      socketService.off('gang:upgrade_purchased' as any, handleUpgradePurchased as AnyEventHandler);
      socketService.off('territory:war_declared' as any, handleWarDeclared as AnyEventHandler);
      socketService.off('territory:war_contributed' as any, handleWarContributed as AnyEventHandler);
      socketService.off('territory:war_resolved' as any, handleWarResolved as AnyEventHandler);
      socketService.off('territory:conquered' as any, handleTerritoryConquered as AnyEventHandler);
    };
  },
}));

export function useGangSocketListeners() {
  const initializeSocketListeners = useGangStore((state) => state.initializeSocketListeners);

  useEffect(() => {
    const cleanup = initializeSocketListeners();
    return cleanup;
  }, [initializeSocketListeners]);
}
