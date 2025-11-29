/**
 * useCosmic Hook
 * Handles cosmic questline operations including quests, corruption, lore, visions, and endings
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';

// Types
export type EndingType = 'transcendence' | 'corruption' | 'sacrifice' | 'resistance' | 'nihilism';

export interface CosmicObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface CosmicChoice {
  id: string;
  text: string;
  consequence?: string;
  corruptionChange?: number;
  sanityChange?: number;
}

export interface CosmicQuest {
  _id: string;
  questId: string;
  title: string;
  description: string;
  chapter: number;
  objectives: CosmicObjective[];
  choices: CosmicChoice[];
  rewards: {
    experience?: number;
    gold?: number;
    items?: string[];
    loreUnlocks?: string[];
  };
  prerequisites?: string[];
  isCompleted: boolean;
  isActive: boolean;
}

export interface CosmicProgress {
  characterId: string;
  questlineStarted: boolean;
  startedAt?: string;
  currentChapter: number;
  completedQuests: string[];
  activeQuests: string[];
  choicesMade: {
    questId: string;
    choiceId: string;
    madeAt: string;
  }[];
  totalCorruptionGained: number;
  totalSanityLost: number;
}

export interface CorruptionState {
  level: number;
  percentage: number;
  stage: 'pure' | 'tainted' | 'corrupted' | 'consumed';
  effects: string[];
  visualChanges: string[];
  resistanceModifier: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  discoveredAt: string;
  chapter: number;
}

export interface Vision {
  id: string;
  title: string;
  description: string;
  type: 'prophecy' | 'memory' | 'nightmare' | 'revelation';
  triggeredAt: string;
  effects?: string[];
}

export interface EndingPrediction {
  predictedEnding: EndingType;
  probability: number;
  factors: {
    factor: string;
    weight: number;
    contribution: 'positive' | 'negative';
  }[];
  alternativeEndings: {
    ending: EndingType;
    probability: number;
    requirements: string[];
  }[];
}

export interface EndingResult {
  ending: EndingType;
  title: string;
  description: string;
  epilogue: string;
  rewards: {
    experience?: number;
    gold?: number;
    items?: string[];
    achievements?: string[];
  };
  consequences: string[];
}

interface UseCosmicReturn {
  // State
  progress: CosmicProgress | null;
  quests: CosmicQuest[];
  corruption: CorruptionState | null;
  lore: LoreEntry[];
  visions: Vision[];
  isLoading: boolean;
  error: string | null;

  // Actions
  startQuestline: () => Promise<{ success: boolean; message: string }>;
  fetchProgress: () => Promise<void>;
  fetchQuests: () => Promise<void>;
  completeObjective: (questId: string, objectiveId: string) => Promise<{ success: boolean; message: string; rewards?: object }>;
  makeChoice: (questId: string, choiceId: string) => Promise<{ success: boolean; message: string; consequences?: string[] }>;
  fetchCorruption: () => Promise<void>;
  fetchLore: () => Promise<void>;
  fetchVisions: () => Promise<void>;
  predictEnding: () => Promise<EndingPrediction | null>;
  triggerEnding: (endingType: EndingType) => Promise<EndingResult | null>;
}

export const useCosmic = (): UseCosmicReturn => {
  const [progress, setProgress] = useState<CosmicProgress | null>(null);
  const [quests, setQuests] = useState<CosmicQuest[]>([]);
  const [corruption, setCorruption] = useState<CorruptionState | null>(null);
  const [lore, setLore] = useState<LoreEntry[]>([]);
  const [visions, setVisions] = useState<Vision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuestline = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { progress: CosmicProgress; message: string } }>('/cosmic/start');
      setProgress(response.data.data.progress);
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to start cosmic questline';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { progress: CosmicProgress } }>('/cosmic/progress');
      setProgress(response.data.data.progress);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch cosmic progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { quests: CosmicQuest[] } }>('/cosmic/quests');
      setQuests(response.data.data.quests);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch cosmic quests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeObjective = useCallback(async (
    questId: string,
    objectiveId: string
  ): Promise<{ success: boolean; message: string; rewards?: object }> => {
    try {
      const response = await api.post<{ data: { message: string; rewards?: object; quest: CosmicQuest } }>(
        `/cosmic/quests/${questId}/objectives/${objectiveId}/complete`
      );
      // Update quests with the updated quest
      setQuests(prev => prev.map(q => q._id === questId || q.questId === questId ? response.data.data.quest : q));
      return {
        success: true,
        message: response.data.data.message,
        rewards: response.data.data.rewards
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to complete objective'
      };
    }
  }, []);

  const makeChoice = useCallback(async (
    questId: string,
    choiceId: string
  ): Promise<{ success: boolean; message: string; consequences?: string[] }> => {
    try {
      const response = await api.post<{ data: { message: string; consequences?: string[]; quest: CosmicQuest } }>(
        `/cosmic/quests/${questId}/choices/${choiceId}`
      );
      // Update quests with the updated quest
      setQuests(prev => prev.map(q => q._id === questId || q.questId === questId ? response.data.data.quest : q));
      return {
        success: true,
        message: response.data.data.message,
        consequences: response.data.data.consequences
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to make choice'
      };
    }
  }, []);

  const fetchCorruption = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { corruption: CorruptionState } }>('/cosmic/corruption');
      setCorruption(response.data.data.corruption);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch corruption state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { lore: LoreEntry[] } }>('/cosmic/lore');
      setLore(response.data.data.lore);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch lore entries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVisions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { visions: Vision[] } }>('/cosmic/visions');
      setVisions(response.data.data.visions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch visions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictEnding = useCallback(async (): Promise<EndingPrediction | null> => {
    try {
      const response = await api.get<{ data: { prediction: EndingPrediction } }>('/cosmic/ending/predict');
      return response.data.data.prediction;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to predict ending');
      return null;
    }
  }, []);

  const triggerEnding = useCallback(async (endingType: EndingType): Promise<EndingResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { result: EndingResult } }>(`/cosmic/ending/trigger/${endingType}`);
      return response.data.data.result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to trigger ending');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    progress,
    quests,
    corruption,
    lore,
    visions,
    isLoading,
    error,
    startQuestline,
    fetchProgress,
    fetchQuests,
    completeObjective,
    makeChoice,
    fetchCorruption,
    fetchLore,
    fetchVisions,
    predictEnding,
    triggerEnding,
  };
};

export default useCosmic;
