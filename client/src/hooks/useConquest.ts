/**
 * useConquest Hook
 * Manages territory siege and conquest mechanics
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Faction type
export type FactionId = 'settler' | 'nahi' | 'frontera' | 'outlaw' | 'neutral';

// Conquest stage
export type ConquestStage = 'PEACEFUL' | 'BUILDING_TENSION' | 'WARNING' | 'ASSAULT' | 'OCCUPATION' | 'STABILIZATION';

// Conquest attempt status
export type ConquestAttemptStatus = 'PENDING' | 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

// Occupation status
export type OccupationStatus = 'NONE' | 'CONTESTED' | 'OCCUPIED' | 'CONSOLIDATED';

// Resource commitment for siege
export interface ConquestResources {
  gold: number;
  supplies: number;
  troops: number;
}

// Siege requirement
export interface SiegeRequirement {
  type: 'influence' | 'resources' | 'cooldown' | 'faction' | 'custom';
  met: boolean;
  current: number;
  required: number;
  description: string;
}

// Siege eligibility check result
export interface SiegeEligibility {
  canDeclare: boolean;
  territoryId: string;
  attackingFaction: FactionId;
  requirements: SiegeRequirement[];
  estimatedCost: ConquestResources;
  estimatedDuration: number; // in hours
  warnings: string[];
}

// Conquest attempt
export interface ConquestAttempt {
  _id: string;
  territoryId: string;
  territoryName: string;
  attackingFaction: FactionId;
  defendingFaction: FactionId;
  stage: ConquestStage;
  status: ConquestAttemptStatus;
  attackerResources: ConquestResources;
  defenderResources: ConquestResources;
  attackerScore: number;
  defenderScore: number;
  startedAt: string;
  warEventId?: string;
  estimatedEndAt: string;
  participants: SiegeParticipant[];
}

// Siege participant
export interface SiegeParticipant {
  characterId: string;
  characterName: string;
  faction: FactionId;
  contribution: number;
  joinedAt: string;
}

// Conquest history entry
export interface ConquestHistoryEntry {
  attemptId: string;
  territoryId: string;
  territoryName: string;
  attackingFaction: FactionId;
  defendingFaction: FactionId;
  winner: FactionId;
  startedAt: string;
  completedAt: string;
  attackerScore: number;
  defenderScore: number;
}

// Faction conquest statistics
export interface FactionConquestStats {
  factionId: FactionId;
  territoriesControlled: number;
  totalConquests: number;
  totalDefenses: number;
  successfulConquests: number;
  successfulDefenses: number;
  currentSieges: number;
  recentHistory: ConquestHistoryEntry[];
}

// Territory conquest state
export interface TerritoryConquestState {
  territoryId: string;
  territoryName: string;
  controllingFaction: FactionId | null;
  occupationStatus: OccupationStatus;
  underSiege: boolean;
  currentAttempt?: ConquestAttempt;
  totalDefenseBonus: number;
  conquestCooldownUntil?: string;
}

// Declare siege request
export interface DeclareSiegeRequest {
  attackingFaction: FactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: FactionId[];
  warDuration?: number;
}

// Rally defense request
export interface RallyDefenseRequest {
  defendingFaction: FactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: FactionId[];
}

interface UseConquestReturn {
  activeSieges: ConquestAttempt[];
  currentSiege: ConquestAttempt | null;
  isLoading: boolean;
  error: string | null;

  // Eligibility checking
  checkEligibility: (territoryId: string, attackingFaction: FactionId, currentInfluence?: number) => Promise<SiegeEligibility | null>;

  // Siege lifecycle
  declareSiege: (territoryId: string, request: DeclareSiegeRequest) => Promise<{ success: boolean; message: string; attempt?: ConquestAttempt }>;
  rallyDefense: (siegeAttemptId: string, request: RallyDefenseRequest) => Promise<{ success: boolean; message: string }>;
  startAssault: (siegeAttemptId: string, warEventId?: string) => Promise<{ success: boolean; message: string }>;
  completeConquest: (siegeAttemptId: string, attackerScore: number, defenderScore: number) => Promise<{ success: boolean; message: string; winner?: FactionId }>;
  cancelSiege: (siegeAttemptId: string) => Promise<{ success: boolean; message: string }>;

  // Queries
  fetchActiveSieges: () => Promise<void>;
  fetchConquestHistory: (territoryId: string) => Promise<ConquestHistoryEntry[]>;
  fetchFactionStatistics: (factionId: FactionId) => Promise<FactionConquestStats | null>;

  // Admin/System
  initializeTerritoryState: (territoryId: string, territoryName: string, initialController: FactionId) => Promise<{ success: boolean; message: string }>;
  updateOccupationStatuses: () => Promise<{ success: boolean; message: string; updated: number }>;

  clearError: () => void;
}

export const useConquest = (): UseConquestReturn => {
  const [activeSieges, setActiveSieges] = useState<ConquestAttempt[]>([]);
  const [currentSiege, setCurrentSiege] = useState<ConquestAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Check siege eligibility
  const checkEligibility = useCallback(async (
    territoryId: string,
    attackingFaction: FactionId,
    currentInfluence?: number
  ): Promise<SiegeEligibility | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { eligibility: SiegeEligibility } }>(
        `/conquest/territories/${territoryId}/eligibility`,
        { params: { attackingFaction, currentInfluence } }
      );
      return response.data.data.eligibility;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to check eligibility';
      setError(errorMessage);
      console.error('[useConquest] Check eligibility error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Declare siege on territory
  const declareSiege = useCallback(async (
    territoryId: string,
    request: DeclareSiegeRequest
  ): Promise<{ success: boolean; message: string; attempt?: ConquestAttempt }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: { message: string; attempt: ConquestAttempt } }>(
        `/conquest/territories/${territoryId}/declare-siege`,
        request
      );
      const { message, attempt } = response.data.data;

      setCurrentSiege(attempt);
      setActiveSieges(prev => [...prev, attempt]);

      await refreshCharacter();

      return { success: true, message, attempt };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to declare siege';
      setError(errorMessage);
      console.error('[useConquest] Declare siege error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Rally defense for a siege
  const rallyDefense = useCallback(async (
    siegeAttemptId: string,
    request: RallyDefenseRequest
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: { message: string } }>(
        `/conquest/sieges/${siegeAttemptId}/rally-defense`,
        request
      );

      await refreshCharacter();

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to rally defense';
      setError(errorMessage);
      console.error('[useConquest] Rally defense error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  // Start assault phase
  const startAssault = useCallback(async (
    siegeAttemptId: string,
    warEventId?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/conquest/sieges/${siegeAttemptId}/start-assault`,
        { warEventId }
      );
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to start assault';
      setError(errorMessage);
      console.error('[useConquest] Start assault error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Complete conquest attempt
  const completeConquest = useCallback(async (
    siegeAttemptId: string,
    attackerScore: number,
    defenderScore: number
  ): Promise<{ success: boolean; message: string; winner?: FactionId }> => {
    try {
      const response = await api.post<{ data: { message: string; winner: FactionId } }>(
        `/conquest/sieges/${siegeAttemptId}/complete`,
        { attackerScore, defenderScore }
      );
      const { message, winner } = response.data.data;

      // Remove from active sieges
      setActiveSieges(prev => prev.filter(s => s._id !== siegeAttemptId));
      if (currentSiege?._id === siegeAttemptId) {
        setCurrentSiege(null);
      }

      return { success: true, message, winner };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to complete conquest';
      setError(errorMessage);
      console.error('[useConquest] Complete conquest error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentSiege]);

  // Cancel a pending siege
  const cancelSiege = useCallback(async (siegeAttemptId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/conquest/sieges/${siegeAttemptId}/cancel`
      );

      // Remove from active sieges
      setActiveSieges(prev => prev.filter(s => s._id !== siegeAttemptId));
      if (currentSiege?._id === siegeAttemptId) {
        setCurrentSiege(null);
      }

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel siege';
      setError(errorMessage);
      console.error('[useConquest] Cancel siege error:', err);
      return { success: false, message: errorMessage };
    }
  }, [currentSiege]);

  // Fetch all active sieges
  const fetchActiveSieges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { sieges: ConquestAttempt[] } }>('/conquest/sieges/active');
      setActiveSieges(response.data.data.sieges || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch active sieges';
      setError(errorMessage);
      console.error('[useConquest] Fetch active sieges error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch conquest history for territory
  const fetchConquestHistory = useCallback(async (territoryId: string): Promise<ConquestHistoryEntry[]> => {
    try {
      const response = await api.get<{ data: { history: ConquestHistoryEntry[] } }>(
        `/conquest/territories/${territoryId}/history`
      );
      return response.data.data.history || [];
    } catch (err: any) {
      console.error('[useConquest] Fetch history error:', err);
      return [];
    }
  }, []);

  // Fetch faction conquest statistics
  const fetchFactionStatistics = useCallback(async (factionId: FactionId): Promise<FactionConquestStats | null> => {
    try {
      const response = await api.get<{ data: { statistics: FactionConquestStats } }>(
        `/conquest/factions/${factionId}/statistics`
      );
      return response.data.data.statistics;
    } catch (err: any) {
      console.error('[useConquest] Fetch faction stats error:', err);
      return null;
    }
  }, []);

  // Initialize territory conquest state (admin)
  const initializeTerritoryState = useCallback(async (
    territoryId: string,
    territoryName: string,
    initialController: FactionId
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/conquest/territories/${territoryId}/initialize`,
        { territoryName, initialController }
      );
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initialize territory';
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update occupation statuses (admin/cron)
  const updateOccupationStatuses = useCallback(async (): Promise<{ success: boolean; message: string; updated: number }> => {
    try {
      const response = await api.post<{ data: { message: string; updated: number } }>(
        '/conquest/update-occupation-statuses'
      );
      return { success: true, ...response.data.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update statuses';
      return { success: false, message: errorMessage, updated: 0 };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    activeSieges,
    currentSiege,
    isLoading,
    error,
    checkEligibility,
    declareSiege,
    rallyDefense,
    startAssault,
    completeConquest,
    cancelSiege,
    fetchActiveSieges,
    fetchConquestHistory,
    fetchFactionStatistics,
    initializeTerritoryState,
    updateOccupationStatuses,
    clearError,
  };
};

export default useConquest;
