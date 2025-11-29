/**
 * useWorkshop Hook
 * Handles workshop operations including access, masterwork, and repair
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Quality tier levels
 */
export type QualityTier = 'poor' | 'common' | 'fine' | 'superior' | 'masterwork' | 'legendary';

/**
 * Workshop type
 */
export type WorkshopType =
  | 'blacksmith'
  | 'gunsmith'
  | 'leatherworker'
  | 'tailor'
  | 'apothecary'
  | 'jeweler'
  | 'carpenter';

/**
 * Workshop summary item
 */
export interface WorkshopSummary {
  workshopId: string;
  name: string;
  type: WorkshopType;
  locationId: string;
  locationName: string;
  tier: number;
  specialties: string[];
  hasAccess: boolean;
  accessLevel: number;
  reputation: number;
  availableRecipes: number;
}

/**
 * Quality tier information
 */
export interface QualityTierInfo {
  tier: QualityTier;
  name: string;
  minSkill: number;
  qualityRange: {
    min: number;
    max: number;
  };
  bonuses: {
    durability: number;
    effectiveness: number;
    value: number;
  };
  description: string;
}

/**
 * Workshop recommendation
 */
export interface WorkshopRecommendation {
  workshopId: string;
  workshopName: string;
  locationName: string;
  type: WorkshopType;
  reason: string;
  matchScore: number;
  benefits: string[];
  requirements?: {
    reputation?: number;
    skill?: number;
    cost?: number;
  };
}

/**
 * Workshop at a location
 */
export interface LocationWorkshop {
  workshopId: string;
  name: string;
  type: WorkshopType;
  tier: number;
  owner: string;
  hasAccess: boolean;
  accessCost: number;
  specialties: string[];
  currentQueue: number;
  maxQueue: number;
}

/**
 * Access request data
 */
export interface WorkshopAccessRequest {
  workshopId: string;
  paymentMethod?: 'cash' | 'reputation' | 'favor';
}

/**
 * Access result
 */
export interface WorkshopAccessResult {
  workshopId: string;
  accessLevel: number;
  expiresAt?: string;
  unlockedRecipes: string[];
}

/**
 * Masterwork rename data
 */
export interface MasterworkRenameData {
  itemId: string;
  newName: string;
  inscription?: string;
}

/**
 * Repair cost information
 */
export interface RepairCostInfo {
  itemId: string;
  itemName: string;
  currentDurability: number;
  maxDurability: number;
  repairCost: number;
  materialsCost: Array<{
    itemId: string;
    name: string;
    quantity: number;
    available: number;
  }>;
  timeRequired: number;
  workshopRequired: WorkshopType;
}

/**
 * Repair result
 */
export interface RepairResult {
  itemId: string;
  itemName: string;
  previousDurability: number;
  newDurability: number;
  cost: number;
  materialsUsed: Array<{
    itemId: string;
    quantity: number;
  }>;
}

/**
 * Action result type
 */
interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Hook return type
 */
interface UseWorkshopReturn {
  // State
  workshopSummary: WorkshopSummary[];
  qualityTiers: QualityTierInfo[];
  recommendations: WorkshopRecommendation[];
  locationWorkshops: LocationWorkshop[];
  repairCost: RepairCostInfo | null;
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchWorkshopSummary: () => Promise<void>;
  fetchQualityTiers: () => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchWorkshopsAtLocation: (locationId: string) => Promise<void>;
  fetchRepairCost: (itemId: string) => Promise<void>;

  // Workshop operations
  requestAccess: (data: WorkshopAccessRequest) => Promise<ActionResult & { result?: WorkshopAccessResult }>;
  renameMasterwork: (data: MasterworkRenameData) => Promise<ActionResult>;
  repairItem: (itemId: string) => Promise<ActionResult & { result?: RepairResult }>;

  // UI helpers
  clearRepairCost: () => void;
  clearError: () => void;
}

/**
 * Workshop management hook
 */
export const useWorkshop = (): UseWorkshopReturn => {
  const [workshopSummary, setWorkshopSummary] = useState<WorkshopSummary[]>([]);
  const [qualityTiers, setQualityTiers] = useState<QualityTierInfo[]>([]);
  const [recommendations, setRecommendations] = useState<WorkshopRecommendation[]>([]);
  const [locationWorkshops, setLocationWorkshops] = useState<LocationWorkshop[]>([]);
  const [repairCost, setRepairCost] = useState<RepairCostInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch workshop summary for character
   */
  const fetchWorkshopSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { workshops: WorkshopSummary[] } }>(
        '/workshops/summary'
      );
      setWorkshopSummary(response.data.data.workshops || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch workshop summary';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch quality tier information
   */
  const fetchQualityTiers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { tiers: QualityTierInfo[] } }>(
        '/workshops/quality-tiers'
      );
      setQualityTiers(response.data.data.tiers || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch quality tiers';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch workshop recommendations
   */
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { recommendations: WorkshopRecommendation[] } }>(
        '/workshops/recommendations'
      );
      setRecommendations(response.data.data.recommendations || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch workshops at a specific location
   */
  const fetchWorkshopsAtLocation = useCallback(async (locationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { workshops: LocationWorkshop[] } }>(
        `/workshops/location/${locationId}`
      );
      setLocationWorkshops(response.data.data.workshops || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch workshops at location';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch repair cost for an item
   */
  const fetchRepairCost = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { cost: RepairCostInfo } }>(
        `/workshops/repair/cost/${itemId}`
      );
      setRepairCost(response.data.data.cost);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch repair cost';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Request access to a workshop
   */
  const requestAccess = useCallback(
    async (data: WorkshopAccessRequest): Promise<ActionResult & { result?: WorkshopAccessResult }> => {
      try {
        const response = await api.post<{
          data: { message: string; result: WorkshopAccessResult };
        }>('/workshops/access', data);
        await refreshCharacter();
        await fetchWorkshopSummary();
        return {
          success: true,
          message: response.data.data.message,
          result: response.data.data.result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to request workshop access';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchWorkshopSummary]
  );

  /**
   * Rename a masterwork item
   */
  const renameMasterwork = useCallback(
    async (data: MasterworkRenameData): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          '/workshops/masterwork/rename',
          data
        );
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to rename masterwork';
        return { success: false, message: errorMessage };
      }
    },
    []
  );

  /**
   * Repair an item
   */
  const repairItem = useCallback(
    async (itemId: string): Promise<ActionResult & { result?: RepairResult }> => {
      try {
        const response = await api.post<{
          data: { message: string; result: RepairResult };
        }>(`/workshops/repair/${itemId}`);
        await refreshCharacter();
        setRepairCost(null);
        return {
          success: true,
          message: response.data.data.message,
          result: response.data.data.result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to repair item';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter]
  );

  /**
   * Clear repair cost
   */
  const clearRepairCost = useCallback(() => {
    setRepairCost(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    workshopSummary,
    qualityTiers,
    recommendations,
    locationWorkshops,
    repairCost,
    isLoading,
    error,

    // Fetch operations
    fetchWorkshopSummary,
    fetchQualityTiers,
    fetchRecommendations,
    fetchWorkshopsAtLocation,
    fetchRepairCost,

    // Workshop operations
    requestAccess,
    renameMasterwork,
    repairItem,

    // UI helpers
    clearRepairCost,
    clearError,
  };
};

export default useWorkshop;
