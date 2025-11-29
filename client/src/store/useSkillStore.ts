/**
 * Skill Store
 * Manages skills and training
 */

import { create } from 'zustand';
import type { Skill, SkillData, TrainingStatus, SuitBonuses } from '@desperados/shared';
import { skillService } from '@/services/skill.service';

interface SkillStore {
  // State
  skills: Skill[];
  skillData: SkillData[];
  currentTraining: TrainingStatus | null;
  skillBonuses: SuitBonuses;
  isTrainingSkill: boolean;
  skillsPollingInterval: NodeJS.Timeout | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSkills: () => Promise<void>;
  startTraining: (skillId: string) => Promise<void>;
  cancelTraining: () => Promise<void>;
  completeTraining: () => Promise<void>;
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
      console.error('Failed to fetch skills:', error);
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
      console.error('Failed to start training:', error);
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
      console.error('Failed to cancel training:', error);
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
      } else {
        throw new Error(response.error || 'Failed to complete training');
      }
    } catch (error: any) {
      console.error('Failed to complete training:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to complete training',
      });
      throw error;
    }
  },

  startSkillsPolling: () => {
    const { skillsPollingInterval, stopSkillsPolling } = get();

    if (skillsPollingInterval) {
      stopSkillsPolling();
    }

    get().fetchSkills();

    const interval = setInterval(() => {
      get().fetchSkills();
    }, 10000);

    set({ skillsPollingInterval: interval });
  },

  stopSkillsPolling: () => {
    const { skillsPollingInterval } = get();

    if (skillsPollingInterval) {
      clearInterval(skillsPollingInterval);
      set({ skillsPollingInterval: null });
    }
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
      isLoading: false,
      error: null,
    });
  },
}));

export default useSkillStore;
