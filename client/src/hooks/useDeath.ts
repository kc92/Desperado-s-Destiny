/**
 * useDeath Hook
 * Manages death, respawn, and death statistics system
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Death type enumeration
export type DeathType = 'COMBAT' | 'DUEL' | 'PVP' | 'EXECUTION' | 'ENVIRONMENTAL' | 'DISEASE' | 'STARVATION';

// Killer type for jail check
export type KillerType = 'lawful_npc' | 'lawful_player' | 'outlaw';

// Death penalty interface
export interface DeathPenalty {
  goldLost: number;
  xpLost: number;
  itemsDropped: string[];
  respawnLocation: string;
  respawnDelay: number; // in seconds
  deathType: DeathType;
  respawned: boolean;
}

// Death status interface
export interface DeathStatus {
  isDead: boolean;
  deathType?: DeathType;
  deathTime?: string;
  respawnAvailableAt?: string;
  respawnLocation?: string;
  canRespawn: boolean;
  respawnCountdown?: number;
}

// Death statistics interface
export interface DeathStats {
  totalDeaths: number;
  deathsByCombat: number;
  deathsByEnvironmental: number;
  deathsByExecution: number;
  deathsByDuel: number;
  deathsByPVP: number;
  totalGoldLost: number;
  totalXPLost: number;
  totalItemsLost: number;
}

// Death history entry
export interface DeathHistoryEntry {
  deathType: DeathType;
  goldLost: number;
  xpLost: number;
  itemsLost: string[];
  location: string;
  timestamp: string;
}

// Jail check result
export interface JailCheckResult {
  shouldJail: boolean;
  jailDuration?: number; // in minutes
  reason?: string;
}

// Penalty info for UI display
export interface DeathPenaltyInfo {
  deathType: DeathType;
  goldLossPercent: number;
  xpLossPercent: number;
  itemDropChance: number;
  respawnDelay: number;
  description: string;
}

interface UseDeathReturn {
  deathStatus: DeathStatus | null;
  deathStats: DeathStats | null;
  deathHistory: DeathHistoryEntry[];
  penaltyInfo: DeathPenaltyInfo[];
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchPenalties: () => Promise<void>;
  triggerDeath: (deathType: DeathType) => Promise<{ success: boolean; message: string; penalty?: DeathPenalty }>;
  respawn: (locationId?: string) => Promise<{ success: boolean; message: string }>;
  checkJail: (killerType: KillerType) => Promise<JailCheckResult>;
  clearError: () => void;
}

export const useDeath = (): UseDeathReturn => {
  const [deathStatus, setDeathStatus] = useState<DeathStatus | null>(null);
  const [deathStats, setDeathStats] = useState<DeathStats | null>(null);
  const [deathHistory, setDeathHistory] = useState<DeathHistoryEntry[]>([]);
  const [penaltyInfo, setPenaltyInfo] = useState<DeathPenaltyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch current death/respawn status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { status: DeathStatus } }>('/death/status');
      setDeathStatus(response.data.data.status);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch death status';
      setError(errorMessage);
      console.error('[useDeath] Fetch status error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch death history and statistics
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { stats: DeathStats; history: DeathHistoryEntry[] } }>('/death/history');
      setDeathStats(response.data.data.stats);
      setDeathHistory(response.data.data.history || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch death history';
      setError(errorMessage);
      console.error('[useDeath] Fetch history error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch death penalty information
  const fetchPenalties = useCallback(async () => {
    try {
      const response = await api.get<{ data: { penalties: DeathPenaltyInfo[] } }>('/death/penalties');
      setPenaltyInfo(response.data.data.penalties || []);
    } catch (err: any) {
      console.error('[useDeath] Fetch penalties error:', err);
    }
  }, []);

  // Trigger death for character
  const triggerDeath = useCallback(async (deathType: DeathType): Promise<{ success: boolean; message: string; penalty?: DeathPenalty }> => {
    try {
      const response = await api.post<{ data: { message: string; penalty: DeathPenalty } }>(
        '/death/trigger',
        { deathType }
      );
      const { message, penalty } = response.data.data;

      // Update local status
      setDeathStatus({
        isDead: true,
        deathType,
        deathTime: new Date().toISOString(),
        respawnAvailableAt: new Date(Date.now() + penalty.respawnDelay * 1000).toISOString(),
        respawnLocation: penalty.respawnLocation,
        canRespawn: false,
        respawnCountdown: penalty.respawnDelay,
      });

      // Refresh character to update gold/inventory
      await refreshCharacter();

      return { success: true, message, penalty };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to process death';
      setError(errorMessage);
      console.error('[useDeath] Trigger death error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Respawn character
  const respawn = useCallback(async (locationId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string; character: any } }>(
        '/death/respawn',
        { locationId }
      );
      const { message } = response.data.data;

      // Update local status
      setDeathStatus({
        isDead: false,
        canRespawn: false,
      });

      // Refresh character to get updated state
      await refreshCharacter();

      return { success: true, message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to respawn';
      setError(errorMessage);
      console.error('[useDeath] Respawn error:', err);
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter]);

  // Check if death should result in jail
  const checkJail = useCallback(async (killerType: KillerType): Promise<JailCheckResult> => {
    try {
      const response = await api.post<{ data: JailCheckResult }>(
        '/death/check-jail',
        { killerType }
      );
      return response.data.data;
    } catch (err: any) {
      console.error('[useDeath] Check jail error:', err);
      return { shouldJail: false };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deathStatus,
    deathStats,
    deathHistory,
    penaltyInfo,
    isLoading,
    error,
    fetchStatus,
    fetchHistory,
    fetchPenalties,
    triggerDeath,
    respawn,
    checkJail,
    clearError,
  };
};

export default useDeath;
