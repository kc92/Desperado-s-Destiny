/**
 * useBribe Hook
 * Manages bribery system for bypassing access restrictions
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Bribe result
export interface BribeResult {
  success: boolean;
  goldSpent?: number;
  accessGranted?: boolean;
  duration?: number; // Minutes of access
  message: string;
  newCriminalRep?: number;
}

// Bribe calculation result
export interface BribeCalculation {
  recommendedAmount: number;
  minimumAmount: number;
  successChance: number;
  factors: BribeFactor[];
}

// Factors affecting bribe
export interface BribeFactor {
  name: string;
  effect: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Building bribe options
export interface BuildingBribeOptions {
  buildingId: string;
  buildingName: string;
  guardBribable: boolean;
  recommendedBribe: number;
  minimumBribe: number;
  successChance: number;
  accessDuration: number;
  requiredWantedLevel?: number;
}

// NPC bribe options
export interface NPCBribeOptions {
  npcId: string;
  npcName: string;
  isBribable: boolean;
  recommendedBribe: number;
  minimumBribe: number;
  successChance: number;
  disposition: string;
}

interface UseBribeReturn {
  isLoading: boolean;
  error: string | null;
  calculateRecommended: (npcFaction: string, requestDifficulty: number) => Promise<BribeCalculation | null>;
  getBuildingOptions: (buildingId: string) => Promise<BuildingBribeOptions | null>;
  bribeGuard: (buildingId: string, amount: number) => Promise<BribeResult>;
  bribeNPC: (npcId: string, amount: number) => Promise<BribeResult>;
  clearError: () => void;
}

export const useBribe = (): UseBribeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Calculate recommended bribe amount
  const calculateRecommended = useCallback(async (
    npcFaction: string,
    requestDifficulty: number
  ): Promise<BribeCalculation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { calculation: BribeCalculation } }>(
        '/bribe/calculate',
        { params: { npcFaction, requestDifficulty } }
      );
      return response.data.data.calculation;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to calculate bribe';
      setError(errorMessage);
      console.error('[useBribe] Calculate error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get bribe options for a building
  const getBuildingOptions = useCallback(async (buildingId: string): Promise<BuildingBribeOptions | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { options: BuildingBribeOptions } }>(
        `/bribe/options/${buildingId}`
      );
      return response.data.data.options;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to get bribe options';
      setError(errorMessage);
      console.error('[useBribe] Get building options error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bribe a guard for building access
  const bribeGuard = useCallback(async (buildingId: string, amount: number): Promise<BribeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: BribeResult }>(
        '/bribe/guard',
        { buildingId, amount }
      );
      const result = response.data.data;

      // Refresh character to update gold and criminal rep
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to bribe guard';
      setError(errorMessage);
      console.error('[useBribe] Bribe guard error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Bribe an NPC for information or services
  const bribeNPC = useCallback(async (npcId: string, amount: number): Promise<BribeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: BribeResult }>(
        '/bribe/npc',
        { npcId, amount }
      );
      const result = response.data.data;

      // Refresh character to update gold and criminal rep
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to bribe NPC';
      setError(errorMessage);
      console.error('[useBribe] Bribe NPC error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    calculateRecommended,
    getBuildingOptions,
    bribeGuard,
    bribeNPC,
    clearError,
  };
};

export default useBribe;
