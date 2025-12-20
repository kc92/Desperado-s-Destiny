/**
 * Skill Store
 * Manages skills and training
 */

import { create } from 'zustand';
import type { Skill, SkillData, TrainingStatus, SuitBonuses } from '@desperados/shared';
import { skillService } from '@/services/skill.service';
import { logger } from '@/services/logger.service';

interface SkillStore {
  // State
  skills: Skill[];
  skillData: SkillData[];
  currentTraining: TrainingStatus | null;
  skillBonuses: SuitBonuses;
  isTrainingSkill: boolean;
  skillsPollingInterval: NodeJS.Timeout | null;
  completionTimeoutId: NodeJS.Timeout | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSkills: () => Promise<void>;
  startTraining: (skillId: string) => Promise<void>;
  cancelTraining: () => Promise<void>;
  completeTraining: () => Promise<{ result: any; bonuses: SuitBonuses } | undefined>;
  startSkillsPolling: () => void;
  stopSkillsPolling: () => void;
  clearSkillState: () => void;
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  // Initial state
  skills: [],
  skillData: [],
  currentTraining: null,
  skillBonuses: { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 },
  isTrainingSkill: false,
  skillsPollingInterval: null,
  completionTimeoutId: null,
  isLoading: false,
  error: null,

  fetchSkills: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await skillService.getSkills();

      if (response.success && response.data) {
        set({
          skills: response.data.skills,
          skillData: response.data.characterSkills,
          currentTraining: response.data.currentTraining,
          skillBonuses: response.data.bonuses,
          isTrainingSkill: response.data.currentTraining !== null,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load skills');
      }
    } catch (error: any) {
      logger.error('Failed to fetch skills', error as Error, { context: 'useSkillStore.fetchSkills' });
      set({
        isLoading: false,
        error: error.message || 'Failed to load skills',
      });
    }
  },

  startTraining: async (skillId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await skillService.startTraining(skillId);

      if (response.success && response.data) {
        set({
          currentTraining: response.data.training,
          isTrainingSkill: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to start training');
      }
    } catch (error: any) {
      logger.error('Failed to start training', error as Error, { context: 'useSkillStore.startTraining', skillId });
      set({
        isLoading: false,
        error: error.message || 'Failed to start training',
      });
      throw error;
    }
  },

  cancelTraining: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await skillService.cancelTraining();

      if (response.success) {
        set({
          currentTraining: null,
          isTrainingSkill: false,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to cancel training');
      }
    } catch (error: any) {
      logger.error('Failed to cancel training', error as Error, { context: 'useSkillStore.cancelTraining' });
      set({
        isLoading: false,
        error: error.message || 'Failed to cancel training',
      });
      throw error;
    }
  },

  completeTraining: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await skillService.completeTraining();

      if (response.success && response.data) {
        const { result, bonuses } = response.data;

        set((state) => ({
          skillData: state.skillData.map((sd) =>
            sd.skillId === result.skillId ? { ...sd, ...result } as SkillData : sd
          ),
          currentTraining: null,
          isTrainingSkill: false,
          skillBonuses: bonuses,
          isLoading: false,
          error: null,
        }));

        // Return the result so callers can use the fresh data
        return { result, bonuses };
      } else {
        throw new Error(response.error || 'Failed to complete training');
      }
    } catch (error: any) {
      logger.error('Failed to complete training', error as Error, { context: 'useSkillStore.completeTraining' });
      set({
        isLoading: false,
        error: error.message || 'Failed to complete training',
      });
      throw error;
    }
  },

  startSkillsPolling: () => {
    const { skillsPollingInterval, stopSkillsPolling, currentTraining } = get();

    if (skillsPollingInterval) {
      stopSkillsPolling();
    }

    get().fetchSkills();

    // Set up polling for general updates
    const interval = setInterval(() => {
      get().fetchSkills();
    }, 10000);

    set({ skillsPollingInterval: interval });

    // If training, set precise completion timeout
    if (currentTraining?.completesAt) {
      const remainingMs = new Date(currentTraining.completesAt).getTime() - Date.now();
      if (remainingMs > 0) {
        const timeoutId = setTimeout(() => {
          get().fetchSkills(); // Fetch immediately at completion time
        }, remainingMs + 100); // Small buffer to ensure server has processed

        set({ completionTimeoutId: timeoutId });
      }
    }
  },

  stopSkillsPolling: () => {
    const { skillsPollingInterval, completionTimeoutId } = get();

    if (skillsPollingInterval) {
      clearInterval(skillsPollingInterval);
    }
    if (completionTimeoutId) {
      clearTimeout(completionTimeoutId);
    }

    set({ skillsPollingInterval: null, completionTimeoutId: null });
  },

  clearSkillState: () => {
    get().stopSkillsPolling();
    set({
      skills: [],
      skillData: [],
      currentTraining: null,
      skillBonuses: { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 },
      isTrainingSkill: false,
      skillsPollingInterval: null,
      completionTimeoutId: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useSkillStore;
