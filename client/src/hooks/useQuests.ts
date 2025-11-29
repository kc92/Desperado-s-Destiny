/**
 * useQuests Hook
 * Manages quest system operations: viewing, accepting, abandoning, and tracking quest progress
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Quest status types
export type QuestStatus = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// Quest difficulty levels
export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';

// Quest types
export type QuestType =
  | 'MAIN'
  | 'SIDE'
  | 'DAILY'
  | 'WEEKLY'
  | 'BOUNTY'
  | 'GANG'
  | 'REPUTATION'
  | 'STORY';

export interface QuestReward {
  type: 'gold' | 'experience' | 'item' | 'reputation' | 'skill';
  amount?: number;
  itemId?: string;
  itemName?: string;
  factionId?: string;
  factionName?: string;
  skillId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: string;
  target: string | number;
  current: number;
  isComplete: boolean;
}

export interface QuestRequirement {
  type: 'level' | 'reputation' | 'quest' | 'item' | 'skill';
  value: string | number;
  description: string;
  isMet: boolean;
}

export interface Quest {
  _id: string;
  questId: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  objectives: QuestObjective[];
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  giver?: string;
  giverName?: string;
  locationId?: string;
  locationName?: string;
  expiresAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  progress: number; // 0-100
  isRepeatable: boolean;
  cooldownHours?: number;
}

export interface QuestProgress {
  questId: string;
  objectiveId: string;
  progress: number;
  isComplete: boolean;
}

interface UseQuestsReturn {
  availableQuests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  currentQuest: Quest | null;
  isLoading: boolean;
  error: string | null;
  fetchAvailableQuests: () => Promise<void>;
  fetchActiveQuests: () => Promise<void>;
  fetchCompletedQuests: () => Promise<void>;
  getQuestDetails: (questId: string) => Promise<Quest | null>;
  acceptQuest: (questId: string) => Promise<{ success: boolean; message: string; quest?: Quest }>;
  abandonQuest: (questId: string) => Promise<{ success: boolean; message: string }>;
  updateProgress: (questId: string, objectiveId: string, progress: number) => Promise<{ success: boolean; message: string; quest?: Quest }>;
  completeQuest: (questId: string) => Promise<{ success: boolean; message: string; rewards?: QuestReward[] }>;
  clearError: () => void;
}

export const useQuests = (): UseQuestsReturn => {
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch available quests
  const fetchAvailableQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { quests: Quest[] } }>('/quests/available');
      setAvailableQuests(response.data.data.quests || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch available quests';
      setError(errorMessage);
      console.error('[useQuests] Fetch available quests error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch active quests
  const fetchActiveQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { quests: Quest[] } }>('/quests/active');
      setActiveQuests(response.data.data.quests || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch active quests';
      setError(errorMessage);
      console.error('[useQuests] Fetch active quests error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch completed quests
  const fetchCompletedQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { quests: Quest[] } }>('/quests/completed');
      setCompletedQuests(response.data.data.quests || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch completed quests';
      setError(errorMessage);
      console.error('[useQuests] Fetch completed quests error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get quest details
  const getQuestDetails = useCallback(async (questId: string): Promise<Quest | null> => {
    try {
      const response = await api.get<{ data: { quest: Quest } }>(`/quests/${questId}`);
      const quest = response.data.data.quest;
      setCurrentQuest(quest);
      return quest;
    } catch (err: any) {
      console.error('[useQuests] Get quest details error:', err);
      return null;
    }
  }, []);

  // Accept a quest
  const acceptQuest = useCallback(async (questId: string): Promise<{ success: boolean; message: string; quest?: Quest }> => {
    try {
      const response = await api.post<{ data: { quest: Quest; message: string } }>('/quests/accept', { questId });
      const quest = response.data.data.quest;

      // Update local state
      setActiveQuests(prev => [...prev, quest]);
      setAvailableQuests(prev => prev.filter(q => q._id !== questId && q.questId !== questId));
      setCurrentQuest(quest);

      return { success: true, message: response.data.data.message, quest };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to accept quest';
      setError(errorMessage);
      console.error('[useQuests] Accept quest error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Abandon a quest
  const abandonQuest = useCallback(async (questId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>('/quests/abandon', { questId });

      // Update local state
      setActiveQuests(prev => prev.filter(q => q._id !== questId && q.questId !== questId));
      if (currentQuest?._id === questId || currentQuest?.questId === questId) {
        setCurrentQuest(null);
      }

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to abandon quest';
      setError(errorMessage);
      console.error('[useQuests] Abandon quest error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentQuest]);

  // Update quest progress
  const updateProgress = useCallback(async (
    questId: string,
    objectiveId: string,
    progress: number
  ): Promise<{ success: boolean; message: string; quest?: Quest }> => {
    try {
      const response = await api.post<{ data: { quest: Quest; message: string } }>(
        `/quests/${questId}/progress`,
        { objectiveId, progress }
      );
      const updatedQuest = response.data.data.quest;

      // Update local state
      setActiveQuests(prev => prev.map(q =>
        (q._id === questId || q.questId === questId) ? updatedQuest : q
      ));
      if (currentQuest?._id === questId || currentQuest?.questId === questId) {
        setCurrentQuest(updatedQuest);
      }

      return { success: true, message: response.data.data.message, quest: updatedQuest };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update quest progress';
      setError(errorMessage);
      console.error('[useQuests] Update progress error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentQuest]);

  // Complete a quest
  const completeQuest = useCallback(async (questId: string): Promise<{ success: boolean; message: string; rewards?: QuestReward[] }> => {
    try {
      const response = await api.post<{ data: { quest: Quest; message: string; rewards: QuestReward[] } }>(
        `/quests/${questId}/complete`
      );
      const { quest, rewards, message } = response.data.data;

      // Update local state
      setActiveQuests(prev => prev.filter(q => q._id !== questId && q.questId !== questId));
      setCompletedQuests(prev => [quest, ...prev]);
      if (currentQuest?._id === questId || currentQuest?.questId === questId) {
        setCurrentQuest(quest);
      }

      // Refresh character to update rewards
      await refreshCharacter();

      return { success: true, message, rewards };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete quest';
      setError(errorMessage);
      console.error('[useQuests] Complete quest error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentQuest, refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    availableQuests,
    activeQuests,
    completedQuests,
    currentQuest,
    isLoading,
    error,
    fetchAvailableQuests,
    fetchActiveQuests,
    fetchCompletedQuests,
    getQuestDetails,
    acceptQuest,
    abandonQuest,
    updateProgress,
    completeQuest,
    clearError,
  };
};

export default useQuests;
