/**
 * useEnergy Hook
 * Manages energy status, spending, and regeneration
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

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
      console.error('[useEnergy] Fetch status error:', err);
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
      console.error('[useEnergy] Can afford check error:', err);
      return false;
    }
  }, []);

  // Spend energy for an action
  const spend = useCallback(async (amount: number): Promise<EnergySpendResult> => {
    try {
      const response = await api.post<{ data: EnergySpendResult }>(
        '/energy/spend',
        { amount }
      );
      const result = response.data.data;

      // Update local status
      if (energyStatus) {
        setEnergyStatus({
          ...energyStatus,
          current: result.currentEnergy,
          max: result.maxEnergy,
        });
      }

      // Refresh character
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to spend energy';
      setError(errorMessage);
      console.error('[useEnergy] Spend error:', err);
      return {
        success: false,
        message: errorMessage,
        energySpent: 0,
        currentEnergy: energyStatus?.current || 0,
        maxEnergy: energyStatus?.max || 100,
      };
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
      console.error('[useEnergy] Grant error:', err);
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
      console.error('[useEnergy] Regenerate error:', err);
      return null;
    }
  }, [energyStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const currentEnergy = energyStatus?.current ?? 0;
  const maxEnergy = energyStatus?.max ?? 100;
  const energyPercent = maxEnergy > 0 ? Math.round((currentEnergy / maxEnergy) * 100) : 0;

  // Calculate time to full energy (in seconds)
  const timeToFull = (() => {
    if (!energyStatus || currentEnergy >= maxEnergy) return 0;
    const missing = maxEnergy - currentEnergy;
    const regenPerSecond = (energyStatus.regenRate + energyStatus.totalBonusRegen) / 60;
    return regenPerSecond > 0 ? Math.ceil(missing / regenPerSecond) : 0;
  })();

  // Auto-refresh energy status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (energyStatus && energyStatus.current < energyStatus.max) {
        regenerate();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [energyStatus, regenerate]);

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
