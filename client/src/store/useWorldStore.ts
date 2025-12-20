/**
 * World Store
 * Zustand store for world state management
 */

import { create } from 'zustand';
import { worldService, type WorldState, type GlobalEvent } from '@/services/world.service';
import { logger } from '@/services/logger.service';

// Re-export types for convenience
export type { WorldState, GlobalEvent };

// Fetch deduplication to prevent multiple simultaneous fetches
let fetchInProgress = false;

interface WorldStoreState {
  // State
  worldState: WorldState | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;

  // Actions
  fetchWorldState: () => Promise<void>;
  clearError: () => void;

  // Computed getters (for backward compatibility)
  // Note: These return GlobalEvent from the world state, not the old WorldEvent type
  // The old activeEvents/upcomingEvents/joinEvent API is not implemented on backend
  getActiveEvents: () => GlobalEvent[];
}

export const useWorldStore = create<WorldStoreState>((set, get) => ({
  // Initial state
  worldState: null,
  isLoading: false,
  error: null,
  lastUpdate: null,

  // Actions
  fetchWorldState: async () => {
    // Prevent duplicate fetches
    if (fetchInProgress) {
      return;
    }

    fetchInProgress = true;
    set({ isLoading: true, error: null });

    try {
      logger.debug('Fetching world state');
      const worldState = await worldService.getWorldState();

      set({
        worldState,
        isLoading: false,
        lastUpdate: new Date(),
      });

      logger.info('World state fetched successfully', {
        activeEvents: worldState.activeEvents?.length || 0,
        dominantFaction: worldState.dominantFaction,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch world state';
      logger.error('Failed to fetch world state', error);
      set({
        error: errorMessage,
        isLoading: false
      });
    } finally {
      fetchInProgress = false;
    }
  },

  clearError: () => set({ error: null }),

  // Computed getters
  getActiveEvents: () => {
    const { worldState } = get();
    return worldState?.activeEvents || [];
  },
}));

export default useWorldStore;
