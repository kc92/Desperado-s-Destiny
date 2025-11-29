/**
 * useRituals Hook
 * Handles ritual system operations including starting, completing, and canceling rituals
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';

// Types
export type RitualType = 'summoning' | 'banishment' | 'divination' | 'protection' | 'transformation' | 'communion';
export type RitualStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface RitualRequirement {
  type: 'item' | 'location' | 'time' | 'sanity' | 'corruption' | 'skill';
  name: string;
  value: string | number;
  isMet: boolean;
}

export interface RitualStep {
  order: number;
  description: string;
  action: string;
  completed: boolean;
  requiredTime?: number;
}

export interface RitualReward {
  type: 'experience' | 'gold' | 'item' | 'lore' | 'ability' | 'corruption' | 'sanity';
  name?: string;
  value: number | string;
  description?: string;
}

export interface RitualConsequence {
  type: 'corruption' | 'sanity' | 'reputation' | 'combat' | 'vision';
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  chance: number;
}

export interface Ritual {
  _id: string;
  ritualId: string;
  name: string;
  description: string;
  type: RitualType;
  difficulty: number;
  requirements: RitualRequirement[];
  steps: RitualStep[];
  rewards: RitualReward[];
  possibleConsequences: RitualConsequence[];
  duration: number;
  corruptionRisk: number;
  sanityRisk: number;
  isRepeatable: boolean;
  cooldown?: number;
  status: RitualStatus;
}

export interface ActiveRitual {
  ritual: Ritual;
  startedAt: string;
  currentStep: number;
  progress: number;
  timeRemaining: number;
  completionPercentage: number;
  stepsCompleted: number[];
}

export interface RitualStartResult {
  success: boolean;
  message: string;
  activeRitual?: ActiveRitual;
  consumedItems?: string[];
}

export interface RitualCompleteResult {
  success: boolean;
  message: string;
  rewards: RitualReward[];
  consequences: {
    type: string;
    description: string;
    applied: boolean;
  }[];
  corruptionGained?: number;
  sanityLost?: number;
  loreUnlocked?: string[];
}

export interface RitualCancelResult {
  success: boolean;
  message: string;
  penalty?: {
    type: string;
    value: number;
    description: string;
  };
}

interface UseRitualsReturn {
  // State
  rituals: Ritual[];
  activeRitual: ActiveRitual | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRituals: () => Promise<void>;
  fetchActiveRitual: () => Promise<void>;
  startRitual: (ritualId: string) => Promise<RitualStartResult>;
  completeRitual: () => Promise<RitualCompleteResult | null>;
  cancelRitual: () => Promise<RitualCancelResult>;
  getRitualById: (ritualId: string) => Ritual | undefined;
  canStartRitual: (ritual: Ritual) => boolean;
}

export const useRituals = (): UseRitualsReturn => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [activeRitual, setActiveRitual] = useState<ActiveRitual | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRituals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { rituals: Ritual[] } }>('/rituals');
      setRituals(response.data.data.rituals);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch rituals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveRitual = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { activeRitual: ActiveRitual | null } }>('/rituals/active');
      setActiveRitual(response.data.data.activeRitual);
    } catch (err: any) {
      // If no active ritual, that's not an error - just set to null
      if (err.response?.status === 404) {
        setActiveRitual(null);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch active ritual');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startRitual = useCallback(async (ritualId: string): Promise<RitualStartResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: RitualStartResult }>(`/rituals/${ritualId}/start`);
      if (response.data.data.activeRitual) {
        setActiveRitual(response.data.data.activeRitual);
      }
      return {
        success: true,
        message: response.data.data.message,
        activeRitual: response.data.data.activeRitual,
        consumedItems: response.data.data.consumedItems
      };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to start ritual';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeRitual = useCallback(async (): Promise<RitualCompleteResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: RitualCompleteResult }>('/rituals/complete');
      setActiveRitual(null);
      // Refresh rituals to update statuses
      await fetchRituals();
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete ritual');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRituals]);

  const cancelRitual = useCallback(async (): Promise<RitualCancelResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: RitualCancelResult }>('/rituals/cancel');
      setActiveRitual(null);
      return {
        success: true,
        message: response.data.data.message,
        penalty: response.data.data.penalty
      };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to cancel ritual';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRitualById = useCallback((ritualId: string): Ritual | undefined => {
    return rituals.find(r => r._id === ritualId || r.ritualId === ritualId);
  }, [rituals]);

  const canStartRitual = useCallback((ritual: Ritual): boolean => {
    // Can't start if there's already an active ritual
    if (activeRitual) return false;

    // Check if all requirements are met
    return ritual.requirements.every(req => req.isMet);
  }, [activeRitual]);

  return {
    rituals,
    activeRitual,
    isLoading,
    error,
    fetchRituals,
    fetchActiveRitual,
    startRitual,
    completeRitual,
    cancelRitual,
    getRitualById,
    canStartRitual,
  };
};

export default useRituals;
