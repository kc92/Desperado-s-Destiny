/**
 * Quest Store
 * Manages quest state and quest-related operations
 */

import { create } from 'zustand';
import { questService, type Quest, type QuestDefinition, type QuestProgress } from '@/services/quest.service';
import { logger } from '@/services/logger.service';

interface QuestStore {
  // State
  quests: QuestDefinition[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchQuests: () => Promise<void>;
  fetchActiveQuests: () => Promise<void>;
  fetchCompletedQuests: () => Promise<void>;
  acceptQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  abandonQuest: (questId: string) => Promise<void>;
  getQuestProgress: (questId: string) => QuestProgress | null;
  clearQuestState: () => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  // Initial state
  quests: [],
  activeQuests: [],
  completedQuests: [],
  isLoading: false,
  error: null,

  fetchQuests: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await questService.getAvailableQuests();

      set({
        quests: response.quests,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch available quests', error as Error, {
        context: 'useQuestStore.fetchQuests',
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load available quests',
      });
    }
  },

  fetchActiveQuests: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await questService.getActiveQuests();

      set({
        activeQuests: response.quests,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch active quests', error as Error, {
        context: 'useQuestStore.fetchActiveQuests',
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load active quests',
      });
    }
  },

  fetchCompletedQuests: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await questService.getCompletedQuests();

      set({
        completedQuests: response.quests,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch completed quests', error as Error, {
        context: 'useQuestStore.fetchCompletedQuests',
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load completed quests',
      });
    }
  },

  acceptQuest: async (questId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await questService.acceptQuest(questId);

      // Add the accepted quest to activeQuests
      set((state) => ({
        activeQuests: [...state.activeQuests, response.quest],
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      logger.error('Failed to accept quest', error as Error, {
        context: 'useQuestStore.acceptQuest',
        questId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to accept quest',
      });
      throw error;
    }
  },

  completeQuest: async (questId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Get quest details first (validates quest exists)
      await questService.getQuestDetails(questId);

      // Move quest from activeQuests to completedQuests
      set((state) => {
        const questToComplete = state.activeQuests.find((q) => q.questId === questId);

        if (!questToComplete) {
          throw new Error('Quest not found in active quests');
        }

        const updatedQuest: Quest = {
          ...questToComplete,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };

        return {
          activeQuests: state.activeQuests.filter((q) => q.questId !== questId),
          completedQuests: [...state.completedQuests, updatedQuest],
          isLoading: false,
          error: null,
        };
      });
    } catch (error: any) {
      logger.error('Failed to complete quest', error as Error, {
        context: 'useQuestStore.completeQuest',
        questId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to complete quest',
      });
      throw error;
    }
  },

  abandonQuest: async (questId: string) => {
    set({ isLoading: true, error: null });

    try {
      await questService.abandonQuest(questId);

      // Remove the quest from activeQuests
      set((state) => ({
        activeQuests: state.activeQuests.filter((q) => q.questId !== questId),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      logger.error('Failed to abandon quest', error as Error, {
        context: 'useQuestStore.abandonQuest',
        questId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to abandon quest',
      });
      throw error;
    }
  },

  getQuestProgress: (questId: string): QuestProgress | null => {
    const quest = get().activeQuests.find((q) => q.questId === questId);

    if (!quest) {
      return null;
    }

    const progress = questService.calculateProgress(quest);
    const timeRemaining = questService.getTimeRemaining(quest);

    return {
      questId: quest.questId,
      name: quest.definition?.name || 'Unknown Quest',
      progress,
      objectives: quest.objectives,
      timeRemaining: timeRemaining ?? undefined,
    };
  },

  clearQuestState: () => {
    set({
      quests: [],
      activeQuests: [],
      completedQuests: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default useQuestStore;
