/**
 * useEnergy Hook
 * Manages energy status, spending, and regeneration
 *
 * IMPORTANT: Server is authoritative for energy values.
 * This hook syncs with the server and prevents race conditions.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Energy status interface
export interface EnergyStatus {
  current: number;
  max: number;
  regenRate: number; // energy per minute
  lastUpdate: string;
  nextRegenAt: string;
  bonuses: EnergyBonus[];
  totalBonusRegen: number;
  isExhausted: boolean;
}

// Energy bonus from items/buffs
export interface EnergyBonus {
  source: string;
  type: 'max' | 'regen' | 'flat';
  amount: number;
  expiresAt?: string;
}

// Energy spend result
export interface EnergySpendResult {
  success: boolean;
  message: string;
  energySpent: number;
  currentEnergy: number;
  maxEnergy: number;
}

// Energy grant result
export interface EnergyGrantResult {
  success: boolean;
  message: string;
  energyGranted: number;
  currentEnergy: number;
  wasOverMax: boolean;
}

// Regeneration result
export interface RegenResult {
  energyGained: number;
  currentEnergy: number;
  maxEnergy: number;
  nextRegenAt: string;
}

interface UseEnergyReturn {
  energyStatus: EnergyStatus | null;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  canAfford: (cost: number) => Promise<boolean>;
  spend: (amount: number) => Promise<EnergySpendResult>;
  grant: (amount: number, allowOverMax?: boolean) => Promise<EnergyGrantResult>;
  regenerate: () => Promise<RegenResult | null>;
  clearError: () => void;
  // Computed helpers
  currentEnergy: number;
  maxEnergy: number;
  energyPercent: number;
  timeToFull: number; // seconds
}

export const useEnergy = (): UseEnergyReturn => {
  const [energyStatus, setEnergyStatus] = useState<EnergyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Request lock to prevent concurrent spend operations
  const spendingRef = useRef(false);
  const syncInProgressRef = useRef(false);

  // Ref to track energyStatus without causing interval recreation
  const energyStatusRef = useRef<EnergyStatus | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    energyStatusRef.current = energyStatus;
  }, [energyStatus]);

  // Fetch current energy status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { energy: EnergyStatus } }>('/energy/status');
      setEnergyStatus(response.data.data.energy);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch energy status';
      setError(errorMessage);
      logger.error('Fetch status error', err as Error, { context: 'useEnergy' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if character can afford an action
  const canAfford = useCallback(async (cost: number): Promise<boolean> => {
    try {
      const response = await api.get<{ data: { canAfford: boolean; current: number; required: number } }>(
        `/energy/can-afford/${cost}`
      );
      return response.data.data.canAfford;
    } catch (err: any) {
      logger.error('Can afford check error', err as Error, { context: 'useEnergy' });
      return false;
    }
  }, []);

  // Spend energy for an action (with request deduplication)
  const spend = useCallback(async (amount: number): Promise<EnergySpendResult> => {
    // Prevent concurrent spend operations
    if (spendingRef.current) {
      return {
        success: false,
        message: 'Energy operation already in progress',
        energySpent: 0,
        currentEnergy: energyStatus?.current || 0,
        maxEnergy: energyStatus?.max || 100,
      };
    }

    spendingRef.current = true;

    try {
      const response = await api.post<{ data: EnergySpendResult }>(
        '/energy/spend',
        { amount }
      );
      const result = response.data.data;

      // Update local status with server's authoritative values
      setEnergyStatus((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          current: result.currentEnergy,
          max: result.maxEnergy,
        };
      });

      // Refresh character
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to spend energy';
      setError(errorMessage);
      logger.error('Spend error', err as Error, { context: 'useEnergy' });

      // On error, fetch fresh state from server to avoid stale values
      try {
        const freshResponse = await api.get<{ data: { energy: EnergyStatus } }>('/energy/status');
        const freshEnergy = freshResponse.data.data.energy;
        setEnergyStatus(freshEnergy);

        return {
          success: false,
          message: errorMessage,
          energySpent: 0,
          currentEnergy: freshEnergy.current,
          maxEnergy: freshEnergy.max,
        };
      } catch {
        // If fetch also fails, return best known values
        return {
          success: false,
          message: errorMessage,
          energySpent: 0,
          currentEnergy: energyStatus?.current || 0,
          maxEnergy: energyStatus?.max || 100,
        };
      }
    } finally {
      spendingRef.current = false;
    }
  }, [energyStatus, refreshCharacter]);

  // Grant energy (from items, rest, etc.)
  const grant = useCallback(async (amount: number, allowOverMax: boolean = false): Promise<EnergyGrantResult> => {
    try {
      const response = await api.post<{ data: EnergyGrantResult }>(
        '/energy/grant',
        { amount, allowOverMax }
      );
      const result = response.data.data;

      // Update local status
      if (energyStatus) {
        setEnergyStatus({
          ...energyStatus,
          current: result.currentEnergy,
        });
      }

      // Refresh character
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to grant energy';
      setError(errorMessage);
      logger.error('Grant error', err as Error, { context: 'useEnergy' });
      return {
        success: false,
        message: errorMessage,
        energyGranted: 0,
        currentEnergy: energyStatus?.current || 0,
        wasOverMax: false,
      };
    }
  }, [energyStatus, refreshCharacter]);

  // Force regeneration calculation
  const regenerate = useCallback(async (): Promise<RegenResult | null> => {
    try {
      const response = await api.post<{ data: { regen: RegenResult } }>('/energy/regenerate');
      const result = response.data.data.regen;

      // Update local status
      if (energyStatus) {
        setEnergyStatus({
          ...energyStatus,
          current: result.currentEnergy,
          max: result.maxEnergy,
          nextRegenAt: result.nextRegenAt,
        });
      }

      return result;
    } catch (err: any) {
      logger.error('Regenerate error', err as Error, { context: 'useEnergy' });
      return null;
    }
  }, [energyStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values with client-side interpolation
  // FIX: Calculate current energy based on time elapsed since lastUpdate
  const computedEnergy = (() => {
    if (!energyStatus) return 0;

    const storedEnergy = energyStatus.current;
    const max = energyStatus.max;

    // If at or above max, no need to interpolate
    if (storedEnergy >= max) return max;

    // Calculate energy gained since last update
    const lastUpdateTime = new Date(energyStatus.lastUpdate).getTime();
    const elapsedMs = Date.now() - lastUpdateTime;
    const regenPerMs = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60000; // per millisecond
    const regenGained = elapsedMs * regenPerMs;

    // Return interpolated energy, capped at max
    return Math.min(storedEnergy + regenGained, max);
  })();

  const currentEnergy = energyStatus ? Math.floor(computedEnergy) : 0;
  const maxEnergy = energyStatus?.max ?? 150;
  const energyPercent = maxEnergy > 0 ? Math.round((currentEnergy / maxEnergy) * 100) : 0;

  // Calculate time to full energy (in seconds)
  const timeToFull = (() => {
    if (!energyStatus || currentEnergy >= maxEnergy) return 0;
    const missing = maxEnergy - currentEnergy;
    const regenPerSecond = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60;
    return regenPerSecond > 0 ? Math.ceil(missing / regenPerSecond) : 0;
  })();

  // Auto-refresh energy status periodically (every 30 seconds for better sync)
  // Uses refs to prevent interval recreation when energyStatus changes
  useEffect(() => {
    const interval = setInterval(async () => {
      // Skip if another sync is in progress
      if (syncInProgressRef.current) return;

      // FIX: Sync regardless of energyStatus being null - this helps recover from API errors
      syncInProgressRef.current = true;
      try {
        // Use ref to access current energyStatus without recreating interval
        const status = energyStatusRef.current;

        // If we don't have energyStatus yet, fetch it
        if (!status) {
          await fetchStatus();
        } else if (status.current < status.max) {
          // Only regenerate if not at max - call API directly to avoid dependency on regenerate
          const response = await api.post<{ data: { regen: RegenResult } }>('/energy/regenerate');
          const result = response.data.data.regen;

          // Update local status using the ref's current value
          const currentStatus = energyStatusRef.current;
          if (currentStatus) {
            setEnergyStatus({
              ...currentStatus,
              current: result.currentEnergy,
              max: result.maxEnergy,
              nextRegenAt: result.nextRegenAt,
            });
          }
        }
      } catch (err) {
        logger.error('Energy sync failed', err as Error, { context: 'useEnergy' });
      } finally {
        syncInProgressRef.current = false;
      }
    }, 30000); // Sync every 30 seconds for better accuracy

    return () => clearInterval(interval);
  }, [fetchStatus]); // Only depends on fetchStatus which is stable (empty deps)

  return {
    energyStatus,
    isLoading,
    error,
    fetchStatus,
    canAfford,
    spend,
    grant,
    regenerate,
    clearError,
    currentEnergy,
    maxEnergy,
    energyPercent,
    timeToFull,
  };
};

export default useEnergy;
