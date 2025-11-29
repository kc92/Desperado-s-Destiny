/**
 * useHeist Hook
 * Manages heist planning, execution, and role assignment operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';

// Heist status types
export type HeistStatus = 'PLANNING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Heist role types
export type HeistRole =
  | 'LEADER'
  | 'LOOKOUT'
  | 'SAFE_CRACKER'
  | 'MUSCLE'
  | 'DRIVER'
  | 'INSIDE_MAN'
  | 'DISTRACTION';

// Heist target difficulty
export type HeistDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';

export interface HeistReward {
  type: 'gold' | 'item' | 'reputation' | 'experience';
  amount?: number;
  itemId?: string;
  itemName?: string;
  factionId?: string;
}

export interface HeistRequirement {
  minMembers: number;
  maxMembers: number;
  requiredRoles: HeistRole[];
  minGangLevel?: number;
  requiredItems?: string[];
  requiredSkills?: { skillId: string; minLevel: number }[];
}

export interface HeistTarget {
  _id: string;
  name: string;
  description: string;
  locationId: string;
  locationName: string;
  difficulty: HeistDifficulty;
  basePayout: number;
  requirements: HeistRequirement;
  potentialRewards: HeistReward[];
  riskLevel: number;
  estimatedDuration: number; // in minutes
  cooldownHours: number;
  isAvailable: boolean;
  availableUntil?: string;
}

export interface HeistParticipant {
  characterId: string;
  characterName: string;
  role: HeistRole;
  joinedAt: string;
  isReady: boolean;
}

export interface HeistLogEntry {
  timestamp: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'FAILURE';
}

export interface Heist {
  _id: string;
  gangId: string;
  gangName: string;
  targetId: string;
  targetName: string;
  status: HeistStatus;
  planningProgress: number; // 0-100
  participants: HeistParticipant[];
  plannedAt: string;
  executeAt?: string;
  completedAt?: string;
  rewards?: HeistReward[];
  heistLog: HeistLogEntry[];
  successChance: number;
}

export interface RoleAssignment {
  characterId: string;
  role: HeistRole;
}

export interface HeistResult {
  success: boolean;
  message: string;
  rewards?: HeistReward[];
  casualties?: string[];
  escapeSuccess?: boolean;
  heatGained?: number;
}

interface UseHeistReturn {
  availableTargets: HeistTarget[];
  heists: Heist[];
  currentHeist: Heist | null;
  isLoading: boolean;
  error: string | null;
  fetchAvailableTargets: () => Promise<void>;
  fetchHeists: () => Promise<void>;
  getHeist: (heistId: string) => Promise<Heist | null>;
  planHeist: (targetId: string) => Promise<{ success: boolean; message: string; heist?: Heist }>;
  increaseProgress: (heistId: string, hours?: number) => Promise<{ success: boolean; message: string; progress?: number }>;
  executeHeist: (heistId: string) => Promise<HeistResult>;
  cancelHeist: (heistId: string) => Promise<{ success: boolean; message: string }>;
  assignRole: (heistId: string, assignment: RoleAssignment) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useHeist = (): UseHeistReturn => {
  const [availableTargets, setAvailableTargets] = useState<HeistTarget[]>([]);
  const [heists, setHeists] = useState<Heist[]>([]);
  const [currentHeist, setCurrentHeist] = useState<Heist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available heist targets
  const fetchAvailableTargets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { targets: HeistTarget[] } }>('/heists/available');
      setAvailableTargets(response.data.data.targets || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch available heist targets';
      setError(errorMessage);
      console.error('[useHeist] Fetch available targets error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all heists for the gang
  const fetchHeists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { heists: Heist[] } }>('/heists');
      setHeists(response.data.data.heists || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch heists';
      setError(errorMessage);
      console.error('[useHeist] Fetch heists error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a specific heist
  const getHeist = useCallback(async (heistId: string): Promise<Heist | null> => {
    try {
      const response = await api.get<{ data: { heist: Heist } }>(`/heists/${heistId}`);
      const heist = response.data.data.heist;
      setCurrentHeist(heist);
      return heist;
    } catch (err: any) {
      console.error('[useHeist] Get heist error:', err);
      return null;
    }
  }, []);

  // Start planning a heist
  const planHeist = useCallback(async (targetId: string): Promise<{ success: boolean; message: string; heist?: Heist }> => {
    try {
      const response = await api.post<{ data: { heist: Heist; message: string } }>('/heists/plan', { targetId });
      const newHeist = response.data.data.heist;
      setHeists(prev => [...prev, newHeist]);
      setCurrentHeist(newHeist);
      return { success: true, message: response.data.data.message, heist: newHeist };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to plan heist';
      setError(errorMessage);
      console.error('[useHeist] Plan heist error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Increase planning progress
  const increaseProgress = useCallback(async (heistId: string, hours: number = 1): Promise<{ success: boolean; message: string; progress?: number }> => {
    try {
      const response = await api.post<{ data: { heist: Heist; message: string; progress: number } }>(
        `/heists/${heistId}/progress`,
        { hours }
      );
      const updatedHeist = response.data.data.heist;
      setHeists(prev => prev.map(h => h._id === heistId ? updatedHeist : h));
      if (currentHeist?._id === heistId) {
        setCurrentHeist(updatedHeist);
      }
      return { success: true, message: response.data.data.message, progress: response.data.data.progress };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to increase planning progress';
      setError(errorMessage);
      console.error('[useHeist] Increase progress error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentHeist]);

  // Execute the heist
  const executeHeist = useCallback(async (heistId: string): Promise<HeistResult> => {
    try {
      const response = await api.post<{ data: HeistResult & { heist: Heist } }>(`/heists/${heistId}/execute`);
      const { heist, ...result } = response.data.data;
      setHeists(prev => prev.map(h => h._id === heistId ? heist : h));
      if (currentHeist?._id === heistId) {
        setCurrentHeist(heist);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to execute heist';
      setError(errorMessage);
      console.error('[useHeist] Execute heist error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentHeist]);

  // Cancel a heist
  const cancelHeist = useCallback(async (heistId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(`/heists/${heistId}/cancel`);
      setHeists(prev => prev.filter(h => h._id !== heistId));
      if (currentHeist?._id === heistId) {
        setCurrentHeist(null);
      }
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel heist';
      setError(errorMessage);
      console.error('[useHeist] Cancel heist error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentHeist]);

  // Assign a role to a participant
  const assignRole = useCallback(async (heistId: string, assignment: RoleAssignment): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { heist: Heist; message: string } }>(
        `/heists/${heistId}/roles`,
        assignment
      );
      const updatedHeist = response.data.data.heist;
      setHeists(prev => prev.map(h => h._id === heistId ? updatedHeist : h));
      if (currentHeist?._id === heistId) {
        setCurrentHeist(updatedHeist);
      }
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to assign role';
      setError(errorMessage);
      console.error('[useHeist] Assign role error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentHeist]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    availableTargets,
    heists,
    currentHeist,
    isLoading,
    error,
    fetchAvailableTargets,
    fetchHeists,
    getHeist,
    planHeist,
    increaseProgress,
    executeHeist,
    cancelHeist,
    assignRole,
    clearError,
  };
};

export default useHeist;
