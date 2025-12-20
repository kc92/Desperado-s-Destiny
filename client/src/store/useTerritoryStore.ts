/**
 * Territory Store
 * Manages territory and faction influence state using Zustand
 * Integrates with territoryService and territoryInfluenceService
 */

import { create } from 'zustand';
import type {
  Territory,
  TerritoryStats,
  TerritoryFaction,
  TerritoryInfluence,
  TerritoryInfluenceSummary,
  FactionInfluenceGainResult,
  FactionOverview,
  AlignmentBenefits,
  InfluenceChange,
  TerritoryFactionId,
  ControlLevel,
} from '@desperados/shared';
import { territoryService } from '@/services/territory.service';
import { territoryInfluenceService } from '@/services/territoryInfluence.service';
import { logger } from '@/services/logger.service';

interface TerritoryStore {
  // State
  territories: Territory[];
  currentTerritory: Territory | null;
  territoryStats: TerritoryStats | null;

  // Influence state
  influenceSummaries: TerritoryInfluenceSummary[];
  currentInfluence: TerritoryInfluence | null;
  influenceHistory: InfluenceChange[];
  alignmentBenefits: AlignmentBenefits | null;
  factionOverview: FactionOverview | null;

  // Loading states
  isLoading: boolean;
  isLoadingInfluence: boolean;
  isLoadingHistory: boolean;
  isContributing: boolean;
  isDeclaring: boolean;

  // Error
  error: string | null;

  // Territory actions
  fetchTerritories: () => Promise<void>;
  fetchTerritoryStats: () => Promise<void>;
  fetchTerritoryDetails: (territoryId: string) => Promise<void>;
  fetchTerritoryByFaction: (faction: TerritoryFaction) => Promise<void>;
  fetchAvailableTerritories: () => Promise<void>;
  fetchTerritoriesByGang: (gangId: string) => Promise<void>;
  fetchTerritoriesUnderSiege: () => Promise<void>;
  declareWar: (territoryId: string, gangId: string) => Promise<void>;

  // Influence actions
  fetchAllTerritoryInfluence: () => Promise<void>;
  fetchTerritoryInfluence: (territoryId: string) => Promise<void>;
  fetchInfluenceHistory: (territoryId: string, limit?: number) => Promise<void>;
  fetchAlignmentBenefits: (territoryId: string, factionId: TerritoryFactionId) => Promise<void>;
  fetchFactionOverview: (factionId: TerritoryFactionId) => Promise<void>;
  contributeInfluence: (
    territoryId: string,
    factionId: TerritoryFactionId,
    amount: number,
    source: string
  ) => Promise<void>;
  donateForInfluence: (
    territoryId: string,
    factionId: TerritoryFactionId,
    donationAmount: number
  ) => Promise<void>;

  // Convenience actions
  fetchTerritoriesControlledByFaction: (factionId: TerritoryFactionId) => Promise<void>;
  fetchContestedTerritories: () => Promise<void>;
  fetchTerritoriesByControlLevel: (controlLevel: ControlLevel) => Promise<void>;

  // Utility actions
  setCurrentTerritory: (territory: Territory | null) => void;
  clearError: () => void;
}

export const useTerritoryStore = create<TerritoryStore>((set, get) => ({
  // Initial state
  territories: [],
  currentTerritory: null,
  territoryStats: null,
  influenceSummaries: [],
  currentInfluence: null,
  influenceHistory: [],
  alignmentBenefits: null,
  factionOverview: null,
  isLoading: false,
  isLoadingInfluence: false,
  isLoadingHistory: false,
  isContributing: false,
  isDeclaring: false,
  error: null,

  // Territory actions
  fetchTerritories: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await territoryService.list();

      set({
        territories: data.territories,
        territoryStats: data.stats,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territories';
      logger.error('Failed to fetch territories', error as Error, {
        context: 'useTerritoryStore.fetchTerritories',
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritoryStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const stats = await territoryService.getStats();

      set({
        territoryStats: stats,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territory stats';
      logger.error('Failed to fetch territory stats', error as Error, {
        context: 'useTerritoryStore.fetchTerritoryStats',
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritoryDetails: async (territoryId: string) => {
    set({ isLoading: true, error: null });

    try {
      const territory = await territoryService.getById(territoryId);

      set({
        currentTerritory: territory,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territory details';
      logger.error('Failed to fetch territory details', error as Error, {
        context: 'useTerritoryStore.fetchTerritoryDetails',
        territoryId,
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritoryByFaction: async (faction: TerritoryFaction) => {
    set({ isLoading: true, error: null });

    try {
      const territories = await territoryService.getByFaction(faction);

      set({
        territories,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territories by faction';
      logger.error('Failed to fetch territories by faction', error as Error, {
        context: 'useTerritoryStore.fetchTerritoryByFaction',
        faction,
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchAvailableTerritories: async () => {
    set({ isLoading: true, error: null });

    try {
      const territories = await territoryService.getAvailable();

      set({
        territories,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load available territories';
      logger.error('Failed to fetch available territories', error as Error, {
        context: 'useTerritoryStore.fetchAvailableTerritories',
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritoriesByGang: async (gangId: string) => {
    set({ isLoading: true, error: null });

    try {
      const territories = await territoryService.getByGang(gangId);

      set({
        territories,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territories by gang';
      logger.error('Failed to fetch territories by gang', error as Error, {
        context: 'useTerritoryStore.fetchTerritoriesByGang',
        gangId,
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchTerritoriesUnderSiege: async () => {
    set({ isLoading: true, error: null });

    try {
      const territories = await territoryService.getUnderSiege();

      set({
        territories,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territories under siege';
      logger.error('Failed to fetch territories under siege', error as Error, {
        context: 'useTerritoryStore.fetchTerritoriesUnderSiege',
      });
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  declareWar: async (territoryId: string, gangId: string) => {
    set({ isDeclaring: true, error: null });

    try {
      const warData = await territoryService.declareWar(territoryId, gangId);

      // Update territory in list to mark as under siege
      set((state) => ({
        territories: state.territories.map((t) =>
          t._id === territoryId ? { ...t, isUnderSiege: true } : t
        ),
        currentTerritory:
          state.currentTerritory?._id === territoryId
            ? { ...state.currentTerritory, isUnderSiege: true }
            : state.currentTerritory,
        isDeclaring: false,
        error: null,
      }));

      logger.info('War declared successfully', {
        context: 'useTerritoryStore.declareWar',
        territoryId,
        gangId,
        warId: warData.warId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to declare war';
      logger.error('Failed to declare war', error as Error, {
        context: 'useTerritoryStore.declareWar',
        territoryId,
        gangId,
      });
      set({
        isDeclaring: false,
        error: message,
      });
      throw error;
    }
  },

  // Influence actions
  fetchAllTerritoryInfluence: async () => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const summaries = await territoryInfluenceService.getAllTerritories();

      set({
        influenceSummaries: summaries,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territory influence';
      logger.error('Failed to fetch all territory influence', error as Error, {
        context: 'useTerritoryStore.fetchAllTerritoryInfluence',
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  fetchTerritoryInfluence: async (territoryId: string) => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const influence = await territoryInfluenceService.getTerritoryInfluence(territoryId);

      set({
        currentInfluence: influence,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load territory influence';
      logger.error('Failed to fetch territory influence', error as Error, {
        context: 'useTerritoryStore.fetchTerritoryInfluence',
        territoryId,
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  fetchInfluenceHistory: async (territoryId: string, limit: number = 50) => {
    set({ isLoadingHistory: true, error: null });

    try {
      const history = await territoryInfluenceService.getInfluenceHistory(territoryId, limit);

      set({
        influenceHistory: history,
        isLoadingHistory: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load influence history';
      logger.error('Failed to fetch influence history', error as Error, {
        context: 'useTerritoryStore.fetchInfluenceHistory',
        territoryId,
        limit,
      });
      set({
        isLoadingHistory: false,
        error: message,
      });
    }
  },

  fetchAlignmentBenefits: async (territoryId: string, factionId: TerritoryFactionId) => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const benefits = await territoryInfluenceService.getAlignmentBenefits(territoryId, factionId);

      set({
        alignmentBenefits: benefits,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load alignment benefits';
      logger.error('Failed to fetch alignment benefits', error as Error, {
        context: 'useTerritoryStore.fetchAlignmentBenefits',
        territoryId,
        factionId,
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  fetchFactionOverview: async (factionId: TerritoryFactionId) => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const overview = await territoryInfluenceService.getFactionOverview(factionId);

      set({
        factionOverview: overview,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load faction overview';
      logger.error('Failed to fetch faction overview', error as Error, {
        context: 'useTerritoryStore.fetchFactionOverview',
        factionId,
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  contributeInfluence: async (
    territoryId: string,
    factionId: TerritoryFactionId,
    amount: number,
    source: string
  ) => {
    set({ isContributing: true, error: null });

    try {
      const result = await territoryInfluenceService.contributeInfluence(
        territoryId,
        factionId,
        amount,
        source as any
      );

      // Refresh current influence if we're viewing this territory
      const state = get();
      if (state.currentInfluence?.territoryId === territoryId) {
        await get().fetchTerritoryInfluence(territoryId);
      }

      set({
        isContributing: false,
        error: null,
      });

      logger.info('Contributed influence successfully', {
        context: 'useTerritoryStore.contributeInfluence',
        territoryId,
        factionId,
        amount,
        result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to contribute influence';
      logger.error('Failed to contribute influence', error as Error, {
        context: 'useTerritoryStore.contributeInfluence',
        territoryId,
        factionId,
        amount,
        source,
      });
      set({
        isContributing: false,
        error: message,
      });
      throw error;
    }
  },

  donateForInfluence: async (
    territoryId: string,
    factionId: TerritoryFactionId,
    donationAmount: number
  ) => {
    set({ isContributing: true, error: null });

    try {
      const result = await territoryInfluenceService.donateForInfluence(
        territoryId,
        factionId,
        donationAmount
      );

      // Refresh current influence if we're viewing this territory
      const state = get();
      if (state.currentInfluence?.territoryId === territoryId) {
        await get().fetchTerritoryInfluence(territoryId);
      }

      set({
        isContributing: false,
        error: null,
      });

      logger.info('Donated for influence successfully', {
        context: 'useTerritoryStore.donateForInfluence',
        territoryId,
        factionId,
        donationAmount,
        result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to donate for influence';
      logger.error('Failed to donate for influence', error as Error, {
        context: 'useTerritoryStore.donateForInfluence',
        territoryId,
        factionId,
        donationAmount,
      });
      set({
        isContributing: false,
        error: message,
      });
      throw error;
    }
  },

  // Convenience actions
  fetchTerritoriesControlledByFaction: async (factionId: TerritoryFactionId) => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const summaries = await territoryInfluenceService.getTerritoriesControlledByFaction(factionId);

      set({
        influenceSummaries: summaries,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load territories controlled by faction';
      logger.error('Failed to fetch territories controlled by faction', error as Error, {
        context: 'useTerritoryStore.fetchTerritoriesControlledByFaction',
        factionId,
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  fetchContestedTerritories: async () => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const summaries = await territoryInfluenceService.getContestedTerritories();

      set({
        influenceSummaries: summaries,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load contested territories';
      logger.error('Failed to fetch contested territories', error as Error, {
        context: 'useTerritoryStore.fetchContestedTerritories',
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  fetchTerritoriesByControlLevel: async (controlLevel: ControlLevel) => {
    set({ isLoadingInfluence: true, error: null });

    try {
      const summaries = await territoryInfluenceService.getTerritoriesByControlLevel(controlLevel);

      set({
        influenceSummaries: summaries,
        isLoadingInfluence: false,
        error: null,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load territories by control level';
      logger.error('Failed to fetch territories by control level', error as Error, {
        context: 'useTerritoryStore.fetchTerritoriesByControlLevel',
        controlLevel,
      });
      set({
        isLoadingInfluence: false,
        error: message,
      });
    }
  },

  // Utility actions
  setCurrentTerritory: (territory: Territory | null) => {
    set({ currentTerritory: territory });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Named export
export { useTerritoryStore as default };
