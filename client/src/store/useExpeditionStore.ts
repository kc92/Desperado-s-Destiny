/**
 * Expedition Store
 * Zustand state management for expedition system
 */

import { create } from 'zustand';
import {
  expeditionService,
  ExpeditionType,
  ExpeditionDurationTier,
  IExpeditionDTO,
  IExpeditionAvailability,
  ExpeditionTypesResponse,
} from '@/services/expedition.service';
import { logger } from '@/services/logger.service';

interface ExpeditionStore {
  // Data state
  expeditionTypes: ExpeditionTypesResponse[];
  availability: IExpeditionAvailability[];
  activeExpedition: IExpeditionDTO | null;
  history: IExpeditionDTO[];
  currentLocationId: string | null;

  // UI state
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Selected state for starting new expedition
  selectedType: ExpeditionType | null;
  selectedDuration: ExpeditionDurationTier;

  // Progress tracking (for active expedition)
  progressPercent: number;
  remainingTime: string;

  // Actions - Data fetching
  fetchTypes: () => Promise<void>;
  fetchAvailability: () => Promise<void>;
  fetchActive: () => Promise<void>;
  fetchHistory: (limit?: number) => Promise<void>;
  fetchAll: () => Promise<void>;

  // Actions - Expedition operations
  startExpedition: (
    type: ExpeditionType,
    durationTier: ExpeditionDurationTier,
    options?: {
      mountId?: string;
      suppliesItemIds?: string[];
      gangMemberIds?: string[];
    }
  ) => Promise<boolean>;
  cancelExpedition: () => Promise<boolean>;

  // Actions - UI state
  setSelectedType: (type: ExpeditionType | null) => void;
  setSelectedDuration: (tier: ExpeditionDurationTier) => void;
  updateProgress: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useExpeditionStore = create<ExpeditionStore>((set, get) => ({
  // Initial state
  expeditionTypes: [],
  availability: [],
  activeExpedition: null,
  history: [],
  currentLocationId: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  selectedType: null,
  selectedDuration: ExpeditionDurationTier.QUICK,
  progressPercent: 0,
  remainingTime: '',

  // Fetch expedition types
  fetchTypes: async () => {
    try {
      const types = await expeditionService.getTypes();
      set({ expeditionTypes: types });
    } catch (err) {
      logger.error('Failed to fetch expedition types', err as Error, {
        context: 'useExpeditionStore.fetchTypes'
      });
    }
  },

  // Fetch availability at current location
  fetchAvailability: async () => {
    try {
      const response = await expeditionService.getAvailability();
      set({
        availability: response.expeditions,
        currentLocationId: response.locationId,
      });
    } catch (err) {
      logger.error('Failed to fetch expedition availability', err as Error, {
        context: 'useExpeditionStore.fetchAvailability'
      });
    }
  },

  // Fetch active expedition
  fetchActive: async () => {
    try {
      const response = await expeditionService.getActive();
      const activeExpedition = response.expedition;

      if (activeExpedition) {
        // Calculate initial progress
        const progressPercent = expeditionService.calculateProgress(
          activeExpedition.startedAt,
          activeExpedition.estimatedCompletionAt
        );
        const remainingTime = expeditionService.formatRemainingTime(
          activeExpedition.estimatedCompletionAt
        );

        set({ activeExpedition, progressPercent, remainingTime });
      } else {
        set({ activeExpedition: null, progressPercent: 0, remainingTime: '' });
      }
    } catch (err) {
      logger.error('Failed to fetch active expedition', err as Error, {
        context: 'useExpeditionStore.fetchActive'
      });
    }
  },

  // Fetch expedition history
  fetchHistory: async (limit = 10) => {
    try {
      const history = await expeditionService.getHistory(limit);
      set({ history });
    } catch (err) {
      logger.error('Failed to fetch expedition history', err as Error, {
        context: 'useExpeditionStore.fetchHistory'
      });
    }
  },

  // Fetch all data
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchTypes(),
        get().fetchAvailability(),
        get().fetchActive(),
        get().fetchHistory(),
      ]);
    } catch (err) {
      set({ error: 'Failed to load expedition data' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Start a new expedition
  startExpedition: async (type, durationTier, options) => {
    set({ isSubmitting: true, error: null });
    try {
      const expedition = await expeditionService.start({
        type,
        durationTier,
        ...options,
      });

      // Calculate initial progress
      const progressPercent = expeditionService.calculateProgress(
        expedition.startedAt,
        expedition.estimatedCompletionAt
      );
      const remainingTime = expeditionService.formatRemainingTime(
        expedition.estimatedCompletionAt
      );

      set({
        activeExpedition: expedition,
        progressPercent,
        remainingTime,
        selectedType: null,
        isSubmitting: false,
      });

      // Refresh availability
      get().fetchAvailability();

      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to start expedition';
      logger.error('Failed to start expedition', err as Error, {
        context: 'useExpeditionStore.startExpedition'
      });
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  // Cancel active expedition
  cancelExpedition: async () => {
    const { activeExpedition } = get();
    if (!activeExpedition) return false;

    set({ isSubmitting: true, error: null });
    try {
      await expeditionService.cancel(activeExpedition.expeditionId);

      set({
        activeExpedition: null,
        progressPercent: 0,
        remainingTime: '',
        isSubmitting: false,
      });

      // Refresh data
      get().fetchAvailability();
      get().fetchHistory();

      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to cancel expedition';
      logger.error('Failed to cancel expedition', err as Error, {
        context: 'useExpeditionStore.cancelExpedition'
      });
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  // Set selected expedition type
  setSelectedType: (type) => set({ selectedType: type }),

  // Set selected duration tier
  setSelectedDuration: (tier) => set({ selectedDuration: tier }),

  // Update progress for active expedition
  updateProgress: () => {
    const { activeExpedition } = get();
    if (!activeExpedition) return;

    const progressPercent = expeditionService.calculateProgress(
      activeExpedition.startedAt,
      activeExpedition.estimatedCompletionAt
    );
    const remainingTime = expeditionService.formatRemainingTime(
      activeExpedition.estimatedCompletionAt
    );

    // If complete, refresh to get results
    if (progressPercent >= 100) {
      get().fetchActive();
      get().fetchHistory();
    }

    set({ progressPercent, remainingTime });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    expeditionTypes: [],
    availability: [],
    activeExpedition: null,
    history: [],
    currentLocationId: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    selectedType: null,
    selectedDuration: ExpeditionDurationTier.QUICK,
    progressPercent: 0,
    remainingTime: '',
  }),
}));

export default useExpeditionStore;
