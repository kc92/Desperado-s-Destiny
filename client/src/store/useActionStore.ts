/**
 * Action Store
 * Manages game actions and challenges
 */

import { create } from 'zustand';
import type { Action, ActionResult } from '@desperados/shared';
import { actionService } from '@/services/action.service';
import { logger } from '@/services/logger.service';

interface ActionStore {
  // State
  actions: Action[];
  currentChallenge: ActionResult | null;
  isChallengingAction: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActions: (locationId?: string) => Promise<void>;
  attemptAction: (actionId: string, characterId: string) => Promise<ActionResult | null>;
  clearChallenge: () => void;
  clearActionState: () => void;
}

export const useActionStore = create<ActionStore>((set) => ({
  // Initial state
  actions: [],
  currentChallenge: null,
  isChallengingAction: false,
  isLoading: false,
  error: null,

  fetchActions: async (locationId?: string) => {
    set({ isLoading: true, error: null });

    try {
      const filters = locationId ? { locationId } : undefined;
      const response = await actionService.getActions(filters);

      if (response.success && response.data) {
        const groupedActions = response.data.actions as unknown as Record<string, Action[]>;
        const flatActions: Action[] = [];

        if (groupedActions && typeof groupedActions === 'object') {
          Object.values(groupedActions).forEach((actionArray) => {
            if (Array.isArray(actionArray)) {
              flatActions.push(...actionArray);
            }
          });
        }

        set({
          actions: flatActions,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load actions');
      }
    } catch (error: any) {
      logger.error('Failed to fetch actions', error as Error, { context: 'useActionStore.fetchActions', locationId });
      set({
        actions: [],
        isLoading: false,
        error: error.message || 'Failed to load actions',
      });
    }
  },

  attemptAction: async (actionId: string, characterId: string) => {
    if (!characterId) {
      set({ error: 'No character selected' });
      return null;
    }

    set({ isChallengingAction: true, error: null, currentChallenge: null });

    try {
      const response = await actionService.attemptChallenge(actionId, characterId);

      if (response.success && response.data) {
        const result = response.data.result;

        // Dispatch game-event-item-crafted for successful crafting actions
        if (result.action.type === 'CRAFT' && result.success) {
            window.dispatchEvent(new CustomEvent('game-event-item-crafted', { detail: { recipeId: result.action.id } }));
        }

        set({
          currentChallenge: result,
          isChallengingAction: false,
        });

        return result;
      } else {
        throw new Error(response.error || 'Failed to attempt action');
      }
    } catch (error: any) {
      logger.error('Failed to attempt action', error as Error, { context: 'useActionStore.attemptAction', actionId, characterId });
      set({
        isChallengingAction: false,
        error: error.message || 'Failed to attempt action',
      });
      return null;
    }
  },

  clearChallenge: () => {
    set({ currentChallenge: null });
  },

  clearActionState: () => {
    set({
      actions: [],
      currentChallenge: null,
      isChallengingAction: false,
      isLoading: false,
      error: null,
    });
  },
}));

export default useActionStore;
