/**
 * useTavern Hook
 * Manages tavern activities, buffs, and energy regeneration bonuses
 *
 * Part of the Tavern Rest & Social System
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

/**
 * Tavern activity definition
 */
export interface TavernActivity {
  id: string;
  name: string;
  description: string;
  cost: number;
  energyCost: number;
  regenBonus: number; // Percentage (e.g., 10 = +10%)
  locationBonus: number; // Extra percentage from this location
  durationMinutes: number;
  cooldownMinutes: number;
  xpReward: {
    skill: string;
    amount: number;
  };
  canAfford: boolean;
  hasEnergy: boolean;
  onCooldown: boolean;
  cooldownRemainingMs: number;
  cooldownEndsAt: string | null;
}

/**
 * Active buff on character
 */
export interface ActiveBuff {
  effectId: string;
  name: string;
  magnitude: number; // Percentage (e.g., 10 = +10%)
  remainingMs: number;
  expiresAt: string;
  sourceName?: string;
}

/**
 * Result of performing an activity
 */
export interface PerformActivityResult {
  success: boolean;
  activity: {
    id: string;
    name: string;
  };
  buff: {
    effectId: string;
    magnitude: number;
    durationMinutes: number;
    expiresAt: string;
  };
  xpAwarded: {
    skill: string;
    amount: number;
  };
  locationBonus: number;
  cooldownEndsAt: string;
  message: string;
  character: {
    dollars: number;
    energy: number;
  };
}

/**
 * Tavern config from server
 */
export interface TavernConfig {
  maxRegenBuff: number;
  inTavernBonus: number;
}

interface UseTavernReturn {
  // State
  activities: TavernActivity[];
  buffs: ActiveBuff[];
  isInTavern: boolean;
  totalRegenBonus: number;
  inTavernBonusActive: boolean;
  config: TavernConfig | null;
  isLoading: boolean;
  isPerforming: boolean;
  error: string | null;

  // Actions
  fetchActivities: () => Promise<void>;
  fetchBuffs: () => Promise<void>;
  performActivity: (activityId: string) => Promise<PerformActivityResult | null>;
  clearError: () => void;

  // Helpers
  getActivityById: (id: string) => TavernActivity | undefined;
  formatCooldown: (ms: number) => string;
  formatDuration: (ms: number) => string;
}

export const useTavern = (): UseTavernReturn => {
  const [activities, setActivities] = useState<TavernActivity[]>([]);
  const [buffs, setBuffs] = useState<ActiveBuff[]>([]);
  const [isInTavern, setIsInTavern] = useState(false);
  const [totalRegenBonus, setTotalRegenBonus] = useState(0);
  const [inTavernBonusActive, setInTavernBonusActive] = useState(false);
  const [config, setConfig] = useState<TavernConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to show loading state before first fetch
  const [isPerforming, setIsPerforming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch available activities at current location
   */
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{
        success: boolean;
        data: {
          isInTavern: boolean;
          activities: TavernActivity[];
          config?: TavernConfig;
          message?: string;
        };
      }>('/tavern/activities');

      const data = response.data.data;
      setIsInTavern(data.isInTavern);
      setActivities(data.activities || []);
      if (data.config) {
        setConfig(data.config);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch tavern activities';
      setError(errorMessage);
      logger.error('Fetch tavern activities error', err as Error, { context: 'useTavern' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch active buffs
   */
  const fetchBuffs = useCallback(async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          buffs: ActiveBuff[];
          isInTavern: boolean;
          totalRegenBonus: number;
          inTavernBonusActive: boolean;
        };
      }>('/tavern/buffs');

      const data = response.data.data;
      setBuffs(data.buffs || []);
      setIsInTavern(data.isInTavern);
      setTotalRegenBonus(data.totalRegenBonus);
      setInTavernBonusActive(data.inTavernBonusActive);
    } catch (err: any) {
      logger.error('Fetch tavern buffs error', err as Error, { context: 'useTavern' });
    }
  }, []);

  /**
   * Perform a tavern activity
   */
  const performActivity = useCallback(async (activityId: string): Promise<PerformActivityResult | null> => {
    if (isPerforming) {
      return null;
    }

    setIsPerforming(true);
    setError(null);

    try {
      const response = await api.post<{
        success: boolean;
        data: PerformActivityResult;
      }>(`/tavern/activities/${activityId}`);

      const result = response.data.data;

      // Refresh activities to update cooldowns
      await fetchActivities();
      // Refresh buffs to show new buff
      await fetchBuffs();
      // Refresh character to update dollars/energy
      await refreshCharacter();

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to perform activity';
      setError(errorMessage);
      logger.error('Perform tavern activity error', err as Error, { context: 'useTavern', activityId });
      return null;
    } finally {
      setIsPerforming(false);
    }
  }, [isPerforming, fetchActivities, fetchBuffs, refreshCharacter]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get activity by ID
   */
  const getActivityById = useCallback((id: string): TavernActivity | undefined => {
    return activities.find(a => a.id === id);
  }, [activities]);

  /**
   * Format cooldown time for display
   */
  const formatCooldown = useCallback((ms: number): string => {
    if (ms <= 0) return 'Ready';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }, []);

  /**
   * Format duration for display
   */
  const formatDuration = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${hours}h`;
    }
    return `${minutes}m`;
  }, []);

  // Auto-refresh buffs to update remaining times
  useEffect(() => {
    if (buffs.length === 0) return;

    const interval = setInterval(() => {
      setBuffs(prevBuffs =>
        prevBuffs
          .map(buff => ({
            ...buff,
            remainingMs: Math.max(0, new Date(buff.expiresAt).getTime() - Date.now())
          }))
          .filter(buff => buff.remainingMs > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [buffs.length]);

  // Auto-refresh activity cooldowns
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setActivities(prevActivities =>
        prevActivities.map(activity => {
          if (!activity.cooldownEndsAt) return activity;
          const remainingMs = Math.max(0, new Date(activity.cooldownEndsAt).getTime() - Date.now());
          return {
            ...activity,
            cooldownRemainingMs: remainingMs,
            onCooldown: remainingMs > 0
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activities.length]);

  return {
    activities,
    buffs,
    isInTavern,
    totalRegenBonus,
    inTavernBonusActive,
    config,
    isLoading,
    isPerforming,
    error,
    fetchActivities,
    fetchBuffs,
    performActivity,
    clearError,
    getActivityById,
    formatCooldown,
    formatDuration
  };
};
