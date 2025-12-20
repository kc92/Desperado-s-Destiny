/**
 * useTerritoryInfluence Hook
 * Manages faction influence and territory control
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Faction type
export type FactionId = 'settler' | 'nahi' | 'frontera' | 'outlaw' | 'neutral';

// Control level
export type ControlLevel = 'DOMINANT' | 'STRONG' | 'CONTESTED' | 'WEAK' | 'MINIMAL';

// Influence source
export type InfluenceSource = 'ACTION' | 'QUEST' | 'DONATION' | 'GANG_ALIGNMENT' | 'CRIME' | 'EVENT' | 'DECAY';

// Trend direction
export type TrendDirection = 'rising' | 'stable' | 'falling';

// Faction influence data
export interface FactionInfluenceData {
  factionId: FactionId;
  factionName: string;
  influence: number;
  percentage: number;
  trend: TrendDirection;
  lastChange: number;
  lastUpdated: string;
}

// Territory influence summary
export interface TerritoryInfluenceSummary {
  territoryId: string;
  territoryName: string;
  territoryType: string;
  controllingFaction: FactionId | null;
  controlLevel: ControlLevel;
  factionInfluence: FactionInfluenceData[];
  stability: number;
  lawLevel: number;
  economicHealth: number;
  activeBuffs: TerritoryBuff[];
  activeDebuffs: TerritoryDebuff[];
  contestedSince?: string;
  controlChangedAt?: string;
}

// Territory buff
export interface TerritoryBuff {
  id: string;
  name: string;
  description: string;
  effect: string;
  expiresAt?: string;
}

// Territory debuff
export interface TerritoryDebuff {
  id: string;
  name: string;
  description: string;
  effect: string;
  expiresAt?: string;
}

// Influence history entry
export interface InfluenceHistoryEntry {
  _id: string;
  territoryId: string;
  factionId: FactionId;
  changeAmount: number;
  source: InfluenceSource;
  characterId?: string;
  characterName?: string;
  gangId?: string;
  gangName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Faction overview
export interface FactionOverview {
  factionId: FactionId;
  factionName: string;
  totalInfluence: number;
  territoriesControlled: number;
  territoriesContested: number;
  strongholds: string[];
  weakPoints: string[];
  recentGains: TerritoryGain[];
  recentLosses: TerritoryLoss[];
}

// Territory gain/loss
export interface TerritoryGain {
  territoryId: string;
  territoryName: string;
  gainedAt: string;
}

export interface TerritoryLoss {
  territoryId: string;
  territoryName: string;
  lostAt: string;
  newController: FactionId;
}

// Alignment benefits
export interface AlignmentBenefits {
  factionId: FactionId;
  controlLevel: ControlLevel;
  taxReduction: number;
  shopDiscount: number;
  xpBonus: number;
  safePassage: boolean;
  factionServices: string[];
  specialPerks: string[];
}

// Character influence contribution
export interface CharacterInfluenceContribution {
  territoryId: string;
  territoryName: string;
  factionId: FactionId;
  totalContribution: number;
  recentContributions: InfluenceHistoryEntry[];
  rank: number;
  title?: string;
}

// Influence gain result
export interface InfluenceGainResult {
  success: boolean;
  message: string;
  influenceGained: number;
  previousInfluence: number;
  newInfluence: number;
  controlChanged: boolean;
  newControlLevel?: ControlLevel;
  newController?: FactionId;
}

// Contribute influence request
export interface ContributeInfluenceRequest {
  factionId: FactionId;
  amount: number;
  source: InfluenceSource;
  metadata?: Record<string, unknown>;
}

// Donate for influence request
export interface DonateInfluenceRequest {
  factionId: FactionId;
  donationAmount: number;
}

interface UseTerritoryInfluenceReturn {
  territories: TerritoryInfluenceSummary[];
  currentTerritory: TerritoryInfluenceSummary | null;
  isLoading: boolean;
  error: string | null;

  // Territory queries
  fetchAllTerritories: () => Promise<void>;
  fetchTerritoryInfluence: (territoryId: string) => Promise<TerritoryInfluenceSummary | null>;
  fetchInfluenceHistory: (territoryId: string, limit?: number) => Promise<InfluenceHistoryEntry[]>;
  fetchAlignmentBenefits: (territoryId: string, factionId: FactionId) => Promise<AlignmentBenefits | null>;

  // Faction queries
  fetchFactionOverview: (factionId: FactionId) => Promise<FactionOverview | null>;

  // Character queries
  fetchCharacterContributions: (characterId: string, limit?: number) => Promise<CharacterInfluenceContribution[]>;

  // Influence modification
  contributeInfluence: (territoryId: string, request: ContributeInfluenceRequest) => Promise<InfluenceGainResult>;
  donateForInfluence: (territoryId: string, request: DonateInfluenceRequest) => Promise<InfluenceGainResult>;
  applyQuestInfluence: (territoryId: string, factionId: FactionId, questId: string, amount: number) => Promise<InfluenceGainResult>;
  applyCrimeInfluence: (territoryId: string, crimeType: string) => Promise<InfluenceGainResult>;

  // System operations (admin)
  initializeTerritories: () => Promise<{ success: boolean; message: string }>;
  applyDailyDecay: () => Promise<{ success: boolean; message: string; decayed: number }>;

  clearError: () => void;
}

export const useTerritoryInfluence = (): UseTerritoryInfluenceReturn => {
  const [territories, setTerritories] = useState<TerritoryInfluenceSummary[]>([]);
  const [currentTerritory, setCurrentTerritory] = useState<TerritoryInfluenceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all territory influence summaries
  const fetchAllTerritories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { territories: TerritoryInfluenceSummary[] } }>(
        '/territory-influence'
      );
      setTerritories(response.data.data.territories || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch territories';
      setError(errorMessage);
      logger.error('Fetch all territories error', err as Error, { context: 'useTerritoryInfluence' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specific territory influence
  const fetchTerritoryInfluence = useCallback(async (
    territoryId: string
  ): Promise<TerritoryInfluenceSummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { territory: TerritoryInfluenceSummary } }>(
        `/territory-influence/${territoryId}`
      );
      const territory = response.data.data.territory;
      setCurrentTerritory(territory);
      return territory;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch territory';
      setError(errorMessage);
      logger.error('Fetch territory error', err as Error, { context: 'useTerritoryInfluence' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch influence history for a territory
  const fetchInfluenceHistory = useCallback(async (
    territoryId: string,
    limit: number = 50
  ): Promise<InfluenceHistoryEntry[]> => {
    try {
      const response = await api.get<{ data: { history: InfluenceHistoryEntry[] } }>(
        `/territory-influence/${territoryId}/history`,
        { params: { limit } }
      );
      return response.data.data.history || [];
    } catch (err: any) {
      logger.error('Fetch history error', err as Error, { context: 'useTerritoryInfluence' });
      return [];
    }
  }, []);

  // Fetch alignment benefits
  const fetchAlignmentBenefits = useCallback(async (
    territoryId: string,
    factionId: FactionId
  ): Promise<AlignmentBenefits | null> => {
    try {
      const response = await api.get<{ data: { benefits: AlignmentBenefits } }>(
        `/territory-influence/${territoryId}/benefits`,
        { params: { factionId } }
      );
      return response.data.data.benefits;
    } catch (err: any) {
      logger.error('Fetch benefits error', err as Error, { context: 'useTerritoryInfluence' });
      return null;
    }
  }, []);

  // Fetch faction overview
  const fetchFactionOverview = useCallback(async (factionId: FactionId): Promise<FactionOverview | null> => {
    try {
      const response = await api.get<{ data: { overview: FactionOverview } }>(
        `/territory-influence/factions/${factionId}/overview`
      );
      return response.data.data.overview;
    } catch (err: any) {
      logger.error('Fetch faction overview error', err as Error, { context: 'useTerritoryInfluence' });
      return null;
    }
  }, []);

  // Fetch character's influence contributions
  const fetchCharacterContributions = useCallback(async (
    characterId: string,
    limit: number = 50
  ): Promise<CharacterInfluenceContribution[]> => {
    try {
      const response = await api.get<{ data: { contributions: CharacterInfluenceContribution[] } }>(
        `/territory-influence/characters/${characterId}/contributions`,
        { params: { limit } }
      );
      return response.data.data.contributions || [];
    } catch (err: any) {
      logger.error('Fetch character contributions error', err as Error, { context: 'useTerritoryInfluence' });
      return [];
    }
  }, []);

  // Contribute influence to a territory
  const contributeInfluence = useCallback(async (
    territoryId: string,
    request: ContributeInfluenceRequest
  ): Promise<InfluenceGainResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: InfluenceGainResult }>(
        `/territory-influence/${territoryId}/contribute`,
        request
      );
      const result = response.data.data;

      // Refresh territory data
      await fetchTerritoryInfluence(territoryId);

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to contribute influence';
      setError(errorMessage);
      logger.error('Contribute influence error', err as Error, { context: 'useTerritoryInfluence' });
      return { success: false, message: errorMessage, influenceGained: 0, previousInfluence: 0, newInfluence: 0, controlChanged: false };
    } finally {
      setIsLoading(false);
    }
  }, [fetchTerritoryInfluence]);

  // Donate gold for influence
  const donateForInfluence = useCallback(async (
    territoryId: string,
    request: DonateInfluenceRequest
  ): Promise<InfluenceGainResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<{ data: InfluenceGainResult }>(
        `/territory-influence/${territoryId}/donate`,
        request
      );
      const result = response.data.data;

      await refreshCharacter();
      await fetchTerritoryInfluence(territoryId);

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to donate for influence';
      setError(errorMessage);
      logger.error('Donate for influence error', err as Error, { context: 'useTerritoryInfluence' });
      return { success: false, message: errorMessage, influenceGained: 0, previousInfluence: 0, newInfluence: 0, controlChanged: false };
    } finally {
      setIsLoading(false);
    }
  }, [fetchTerritoryInfluence, refreshCharacter]);

  // Apply quest completion influence
  const applyQuestInfluence = useCallback(async (
    territoryId: string,
    factionId: FactionId,
    questId: string,
    influenceAmount: number
  ): Promise<InfluenceGainResult> => {
    try {
      const response = await api.post<{ data: InfluenceGainResult }>(
        `/territory-influence/${territoryId}/quest`,
        { factionId, questId, influenceAmount }
      );
      return response.data.data;
    } catch (err: any) {
      logger.error('Apply quest influence error', err as Error, { context: 'useTerritoryInfluence' });
      return { success: false, message: err.message, influenceGained: 0, previousInfluence: 0, newInfluence: 0, controlChanged: false };
    }
  }, []);

  // Apply crime influence
  const applyCrimeInfluence = useCallback(async (
    territoryId: string,
    crimeType: string
  ): Promise<InfluenceGainResult> => {
    try {
      const response = await api.post<{ data: InfluenceGainResult }>(
        `/territory-influence/${territoryId}/crime`,
        { crimeType }
      );
      return response.data.data;
    } catch (err: any) {
      logger.error('Apply crime influence error', err as Error, { context: 'useTerritoryInfluence' });
      return { success: false, message: err.message, influenceGained: 0, previousInfluence: 0, newInfluence: 0, controlChanged: false };
    }
  }, []);

  // Initialize all territories (admin)
  const initializeTerritories = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        '/territory-influence/initialize'
      );
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initialize territories';
      return { success: false, message: errorMessage };
    }
  }, []);

  // Apply daily influence decay (admin/cron)
  const applyDailyDecay = useCallback(async (): Promise<{ success: boolean; message: string; decayed: number }> => {
    try {
      const response = await api.post<{ data: { message: string; decayed: number } }>(
        '/territory-influence/apply-daily-decay'
      );
      return { success: true, ...response.data.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to apply decay';
      return { success: false, message: errorMessage, decayed: 0 };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    territories,
    currentTerritory,
    isLoading,
    error,
    fetchAllTerritories,
    fetchTerritoryInfluence,
    fetchInfluenceHistory,
    fetchAlignmentBenefits,
    fetchFactionOverview,
    fetchCharacterContributions,
    contributeInfluence,
    donateForInfluence,
    applyQuestInfluence,
    applyCrimeInfluence,
    initializeTerritories,
    applyDailyDecay,
    clearError,
  };
};

export default useTerritoryInfluence;
