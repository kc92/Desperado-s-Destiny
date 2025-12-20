/**
 * Karma Store
 * Manages karma/deity system state using Zustand
 *
 * DEITY SYSTEM - Phase 4
 */

import { create } from 'zustand';
import {
  karmaService,
  KarmaSummary,
  KarmaEffects,
  DivineManifestation,
  Blessing,
  Curse,
  DeityName,
} from '@/services/karma.service';
import { logger } from '@/services/logger.service';

// ============================================================================
// TOAST TYPES
// ============================================================================

export interface KarmaToast {
  id: string;
  type: 'karma_change' | 'blessing' | 'curse' | 'divine_message' | 'effect_expired';
  data: {
    dimension?: string;
    delta?: number;
    newValue?: number;
    blessing?: Blessing;
    curse?: Curse;
    message?: string;
    deity?: DeityName;
    effectType?: 'blessing' | 'curse';
    effectName?: string;
  };
  timestamp: number;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface KarmaStore {
  // State
  karma: KarmaSummary | null;
  effects: KarmaEffects | null;
  manifestations: DivineManifestation[];
  unacknowledgedCount: number;
  isLoading: boolean;
  error: string | null;
  toasts: KarmaToast[];
  pendingManifestation: DivineManifestation | null;

  // Actions - API calls
  fetchKarma: (characterId: string) => Promise<void>;
  fetchEffects: (characterId: string) => Promise<void>;
  fetchManifestations: (characterId: string, unacknowledged?: boolean) => Promise<void>;
  acknowledgeManifestation: (id: string, response?: string) => Promise<void>;
  markDelivered: (id: string) => Promise<void>;

  // Actions - Socket event handlers
  handleKarmaUpdate: (data: { characterId: string; dimension: string; delta: number; newValue: number }) => void;
  handleBlessingGranted: (data: { characterId: string; type: string; description: string; source: DeityName; duration?: number }) => void;
  handleCurseInflicted: (data: { characterId: string; type: string; description: string; source: DeityName; removalCondition?: string }) => void;
  handleBlessingExpired: (data: { characterId: string; type: string; source: DeityName; message: string }) => void;
  handleCurseExpired: (data: { characterId: string; type: string; source: DeityName; message: string }) => void;
  handleDivineMessage: (manifestation: DivineManifestation) => void;
  handleAffinityChange: (data: { characterId: string; deity: DeityName; delta: number; newValue: number }) => void;

  // Actions - Toast management
  addToast: (toast: Omit<KarmaToast, 'id' | 'timestamp'>) => void;
  removeToast: (toastId: string) => void;
  clearToasts: () => void;

  // Actions - Pending manifestation (for popup)
  setPendingManifestation: (manifestation: DivineManifestation | null) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useKarmaStore = create<KarmaStore>((set, get) => ({
  // Initial state
  karma: null,
  effects: null,
  manifestations: [],
  unacknowledgedCount: 0,
  isLoading: false,
  error: null,
  toasts: [],
  pendingManifestation: null,

  // =========================================================================
  // API Actions
  // =========================================================================

  fetchKarma: async (characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      const karma = await karmaService.getKarma(characterId);
      set({ karma, isLoading: false });
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error('Failed to fetch karma', error as Error, {
        context: 'useKarmaStore.fetchKarma',
        characterId,
      });
      set({
        isLoading: false,
        error: err.message || 'Failed to fetch karma',
      });
    }
  },

  fetchEffects: async (characterId: string) => {
    try {
      const effects = await karmaService.getActiveEffects(characterId);
      set({ effects });
    } catch (error) {
      logger.error('Failed to fetch karma effects', error as Error, {
        context: 'useKarmaStore.fetchEffects',
        characterId,
      });
    }
  },

  fetchManifestations: async (characterId: string, unacknowledged = false) => {
    try {
      const response = await karmaService.getManifestations(characterId, {
        unacknowledged,
        limit: 50,
      });

      const unacknowledgedCount = response.manifestations.filter(
        (m) => !m.acknowledged
      ).length;

      set({
        manifestations: response.manifestations,
        unacknowledgedCount,
      });
    } catch (error) {
      logger.error('Failed to fetch manifestations', error as Error, {
        context: 'useKarmaStore.fetchManifestations',
        characterId,
      });
    }
  },

  acknowledgeManifestation: async (id: string, response?: string) => {
    try {
      await karmaService.acknowledgeManifestation(id, response);

      // Update local state
      const manifestations = get().manifestations.map((m) =>
        m.id === id ? { ...m, acknowledged: true, playerResponse: response } : m
      );

      const unacknowledgedCount = manifestations.filter(
        (m) => !m.acknowledged
      ).length;

      set({ manifestations, unacknowledgedCount, pendingManifestation: null });
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error('Failed to acknowledge manifestation', error as Error, {
        context: 'useKarmaStore.acknowledgeManifestation',
        manifestationId: id,
      });
      set({ error: err.message || 'Failed to acknowledge message' });
    }
  },

  markDelivered: async (id: string) => {
    try {
      await karmaService.markDelivered(id);

      // Update local state
      const manifestations = get().manifestations.map((m) =>
        m.id === id ? { ...m, delivered: true } : m
      );

      set({ manifestations });
    } catch (error) {
      logger.error('Failed to mark manifestation delivered', error as Error, {
        context: 'useKarmaStore.markDelivered',
        manifestationId: id,
      });
    }
  },

  // =========================================================================
  // Socket Event Handlers
  // =========================================================================

  handleKarmaUpdate: (data) => {
    const { karma } = get();
    if (!karma) return;

    // Update the specific dimension
    const dimensionKey = data.dimension.toLowerCase() as keyof typeof karma.karma;
    if (dimensionKey in karma.karma) {
      const updatedKarma = {
        ...karma,
        karma: {
          ...karma.karma,
          [dimensionKey]: data.newValue,
        },
      };

      set({ karma: updatedKarma });

      // Show toast for karma change
      get().addToast({
        type: 'karma_change',
        data: {
          dimension: data.dimension,
          delta: data.delta,
          newValue: data.newValue,
        },
      });
    }
  },

  handleBlessingGranted: (data) => {
    const { karma } = get();

    const newBlessing: Blessing = {
      source: data.source,
      type: data.type,
      power: 1,
      description: data.description,
      expiresAt: data.duration
        ? new Date(Date.now() + data.duration * 1000).toISOString()
        : null,
      grantedAt: new Date().toISOString(),
    };

    if (karma) {
      set({
        karma: {
          ...karma,
          activeBlessings: [...karma.activeBlessings, newBlessing],
        },
      });
    }

    // Show toast
    get().addToast({
      type: 'blessing',
      data: {
        blessing: newBlessing,
        deity: data.source,
      },
    });
  },

  handleCurseInflicted: (data) => {
    const { karma } = get();

    const newCurse: Curse = {
      source: data.source,
      type: data.type,
      severity: 1,
      description: data.description,
      removalCondition: data.removalCondition || 'Unknown',
      expiresAt: null,
      inflictedAt: new Date().toISOString(),
    };

    if (karma) {
      set({
        karma: {
          ...karma,
          activeCurses: [...karma.activeCurses, newCurse],
        },
      });
    }

    // Show toast
    get().addToast({
      type: 'curse',
      data: {
        curse: newCurse,
        deity: data.source,
      },
    });
  },

  handleBlessingExpired: (data) => {
    const { karma } = get();

    if (karma) {
      set({
        karma: {
          ...karma,
          activeBlessings: karma.activeBlessings.filter(
            (b) => !(b.type === data.type && b.source === data.source)
          ),
        },
      });
    }

    // Show toast
    get().addToast({
      type: 'effect_expired',
      data: {
        effectType: 'blessing',
        effectName: data.type,
        deity: data.source,
        message: data.message,
      },
    });
  },

  handleCurseExpired: (data) => {
    const { karma } = get();

    if (karma) {
      set({
        karma: {
          ...karma,
          activeCurses: karma.activeCurses.filter(
            (c) => !(c.type === data.type && c.source === data.source)
          ),
        },
      });
    }

    // Show toast
    get().addToast({
      type: 'effect_expired',
      data: {
        effectType: 'curse',
        effectName: data.type,
        deity: data.source,
        message: data.message,
      },
    });
  },

  handleDivineMessage: (manifestation) => {
    // Add to manifestations list
    set({
      manifestations: [manifestation, ...get().manifestations],
      unacknowledgedCount: get().unacknowledgedCount + 1,
      pendingManifestation: manifestation, // Show popup
    });

    // Show toast notification
    get().addToast({
      type: 'divine_message',
      data: {
        message: manifestation.message,
        deity: manifestation.deityName,
      },
    });
  },

  handleAffinityChange: (data) => {
    const { karma } = get();
    if (!karma) return;

    const deityKey = data.deity === 'GAMBLER' ? 'gambler' : 'outlawKing';

    set({
      karma: {
        ...karma,
        deityRelationships: {
          ...karma.deityRelationships,
          [deityKey]: {
            ...karma.deityRelationships[deityKey],
            affinity: data.newValue,
            relationship: karmaService.getAffinityDescription(data.newValue),
          },
        },
      },
    });
  },

  // =========================================================================
  // Toast Management
  // =========================================================================

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({
      toasts: [...get().toasts, { ...toast, id, timestamp: Date.now() }],
    });
  },

  removeToast: (toastId: string) => {
    set({
      toasts: get().toasts.filter((t) => t.id !== toastId),
    });
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // =========================================================================
  // Pending Manifestation
  // =========================================================================

  setPendingManifestation: (manifestation) => {
    set({ pendingManifestation: manifestation });
  },

  // =========================================================================
  // Utility
  // =========================================================================

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      karma: null,
      effects: null,
      manifestations: [],
      unacknowledgedCount: 0,
      isLoading: false,
      error: null,
      toasts: [],
      pendingManifestation: null,
    }),
}));

export default useKarmaStore;
