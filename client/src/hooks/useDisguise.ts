/**
 * useDisguise Hook
 * Manages disguise system for reducing wanted level visibility
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Disguise type definition
export interface DisguiseType {
  id: string;
  name: string;
  description: string;
  faction: string | null;
  wantedReduction: number;
  durationMinutes: number;
  cost: number;
  requiredItems?: string[];
  canAfford?: boolean;
}

// Disguise status
export interface DisguiseStatus {
  isDisguised: boolean;
  disguise?: DisguiseType;
  expiresAt?: string;
  remainingMinutes?: number;
  faction?: string | null;
}

// Apply disguise result
export interface DisguiseApplyResult {
  success: boolean;
  message: string;
  disguiseId?: string;
  expiresAt?: string;
  faction?: string | null;
  goldSpent?: number;
}

// Detection check result
export interface DetectionResult {
  detected: boolean;
  consequence?: string;
  wantedIncrease?: number;
}

// Available disguise with affordability
export interface AvailableDisguise extends DisguiseType {
  canAfford: boolean;
  missingItems?: string[];
}

interface UseDisguiseReturn {
  disguiseStatus: DisguiseStatus | null;
  disguiseTypes: DisguiseType[];
  availableDisguises: AvailableDisguise[];
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  fetchTypes: () => Promise<void>;
  fetchAvailable: () => Promise<void>;
  apply: (disguiseId: string) => Promise<DisguiseApplyResult>;
  remove: () => Promise<{ success: boolean; message: string }>;
  checkDetection: (dangerLevel: number) => Promise<DetectionResult>;
  clearError: () => void;
  // Computed helpers
  isDisguised: boolean;
  timeRemaining: number; // seconds
}

export const useDisguise = (): UseDisguiseReturn => {
  const [disguiseStatus, setDisguiseStatus] = useState<DisguiseStatus | null>(null);
  const [disguiseTypes, setDisguiseTypes] = useState<DisguiseType[]>([]);
  const [availableDisguises, setAvailableDisguises] = useState<AvailableDisguise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch current disguise status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { status: DisguiseStatus } }>('/disguise/status');
      setDisguiseStatus(response.data.data.status);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch disguise status';
      setError(errorMessage);
      console.error('[useDisguise] Fetch status error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all disguise types
  const fetchTypes = useCallback(async () => {
    try {
      const response = await api.get<{ data: { types: DisguiseType[] } }>('/disguise/types');
      setDisguiseTypes(response.data.data.types || []);
    } catch (err: any) {
      console.error('[useDisguise] Fetch types error:', err);
    }
  }, []);

  // Fetch available disguises with affordability info
  const fetchAvailable = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { disguises: AvailableDisguise[] } }>('/disguise/available');
      setAvailableDisguises(response.data.data.disguises || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch available disguises';
      setError(errorMessage);
      console.error('[useDisguise] Fetch available error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply a disguise
  const apply = useCallback(async (disguiseId: string): Promise<DisguiseApplyResult> => {
    try {
      const response = await api.post<{ data: DisguiseApplyResult }>(
        '/disguise/apply',
        { disguiseId }
      );
      const result = response.data.data;

      if (result.success) {
        // Update local status
        const appliedDisguise = disguiseTypes.find(d => d.id === disguiseId);
        setDisguiseStatus({
          isDisguised: true,
          disguise: appliedDisguise,
          expiresAt: result.expiresAt,
          faction: result.faction,
          remainingMinutes: appliedDisguise?.durationMinutes,
        });

        // Refresh character to update gold
        await refreshCharacter();
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to apply disguise';
      setError(errorMessage);
      console.error('[useDisguise] Apply error:', err);
      return { success: false, message: errorMessage };
    }
  }, [disguiseTypes, refreshCharacter]);

  // Remove current disguise
  const remove = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { success: boolean; message: string } }>(
        '/disguise/remove'
      );
      const result = response.data.data;

      if (result.success) {
        setDisguiseStatus({
          isDisguised: false,
        });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to remove disguise';
      setError(errorMessage);
      console.error('[useDisguise] Remove error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Check if disguise is detected
  const checkDetection = useCallback(async (dangerLevel: number): Promise<DetectionResult> => {
    try {
      const response = await api.post<{ data: DetectionResult }>(
        '/disguise/check-detection',
        { dangerLevel }
      );
      const result = response.data.data;

      if (result.detected) {
        // Disguise was blown, update status
        setDisguiseStatus({
          isDisguised: false,
        });

        // Refresh character to update wanted level
        await refreshCharacter();
      }

      return result;
    } catch (err: any) {
      console.error('[useDisguise] Check detection error:', err);
      return { detected: false };
    }
  }, [refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const isDisguised = disguiseStatus?.isDisguised ?? false;

  const timeRemaining = (() => {
    if (!disguiseStatus?.expiresAt) return 0;
    const expiresAt = new Date(disguiseStatus.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expiresAt - now) / 1000));
  })();

  return {
    disguiseStatus,
    disguiseTypes,
    availableDisguises,
    isLoading,
    error,
    fetchStatus,
    fetchTypes,
    fetchAvailable,
    apply,
    remove,
    checkDetection,
    clearError,
    isDisguised,
    timeRemaining,
  };
};

export default useDisguise;
