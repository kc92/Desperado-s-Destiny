/**
 * useProduction Hook
 * Handles production slot operations for property-based crafting
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { dispatchItemCrafted } from '@/utils/tutorialEvents';

/**
 * Production status enum
 */
export type ProductionStatus = 'idle' | 'producing' | 'completed' | 'cancelled';

/**
 * Resource requirement for production
 */
export interface ProductionResource {
  itemId: string;
  name: string;
  quantity: number;
  available: number;
}

/**
 * Production slot details
 */
export interface ProductionSlot {
  _id: string;
  slotId: string;
  propertyId: string;
  propertyName: string;
  recipeId: string;
  recipeName: string;
  status: ProductionStatus;
  startedAt: string;
  completesAt: string;
  quantity: number;
  quality: number;
  workerId?: string;
  workerName?: string;
  bonuses: {
    speed: number;
    quality: number;
    quantity: number;
  };
  progress: number;
  timeRemaining: number;
}

/**
 * Active production summary
 */
export interface ActiveProduction {
  slotId: string;
  propertyId: string;
  propertyName: string;
  recipeName: string;
  status: ProductionStatus;
  progress: number;
  timeRemaining: number;
  completesAt: string;
}

/**
 * Completed production entry
 */
export interface CompletedProduction {
  slotId: string;
  propertyId: string;
  propertyName: string;
  recipeName: string;
  quantity: number;
  quality: number;
  completedAt: string;
  collected: boolean;
}

/**
 * Production order request
 */
export interface StartProductionData {
  propertyId: string;
  recipeId: string;
  quantity?: number;
  workerId?: string;
}

/**
 * Production result
 */
export interface ProductionResult {
  slotId: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    quality: number;
  }>;
  experience: number;
  bonuses?: string[];
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
interface UseProductionReturn {
  // State
  activeProductions: ActiveProduction[];
  completedProductions: CompletedProduction[];
  selectedSlot: ProductionSlot | null;
  propertySlots: ProductionSlot[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchActiveProductions: () => Promise<void>;
  fetchCompletedProductions: () => Promise<void>;
  fetchSlotDetails: (slotId: string) => Promise<void>;
  fetchPropertySlots: (propertyId: string) => Promise<void>;

  // Production operations
  startProduction: (data: StartProductionData) => Promise<ActionResult>;
  collectProduction: (slotId: string) => Promise<ActionResult & { result?: ProductionResult }>;
  cancelProduction: (slotId: string) => Promise<ActionResult>;

  // UI helpers
  clearSelectedSlot: () => void;
  clearError: () => void;
}

/**
 * Production management hook
 */
export const useProduction = (): UseProductionReturn => {
  const [activeProductions, setActiveProductions] = useState<ActiveProduction[]>([]);
  const [completedProductions, setCompletedProductions] = useState<CompletedProduction[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ProductionSlot | null>(null);
  const [propertySlots, setPropertySlots] = useState<ProductionSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch all active productions
   */
  const fetchActiveProductions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { productions: ActiveProduction[] } }>(
        '/production/active'
      );
      setActiveProductions(response.data.data.productions || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch active productions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch completed productions
   */
  const fetchCompletedProductions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { productions: CompletedProduction[] } }>(
        '/production/completed'
      );
      setCompletedProductions(response.data.data.productions || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch completed productions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch slot details
   */
  const fetchSlotDetails = useCallback(async (slotId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { slot: ProductionSlot } }>(
        `/production/slot/${slotId}`
      );
      setSelectedSlot(response.data.data.slot);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch slot details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all slots for a property
   */
  const fetchPropertySlots = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { slots: ProductionSlot[] } }>(
        `/production/property/${propertyId}`
      );
      setPropertySlots(response.data.data.slots || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch property slots';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start a new production order
   */
  const startProduction = useCallback(
    async (data: StartProductionData): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string; slotId: string } }>(
          '/production/start',
          data
        );
        await refreshCharacter();
        await fetchActiveProductions();
        if (data.propertyId) {
          await fetchPropertySlots(data.propertyId);
        }
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to start production';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchActiveProductions, fetchPropertySlots]
  );

  /**
   * Collect completed production
   */
  const collectProduction = useCallback(
    async (slotId: string): Promise<ActionResult & { result?: ProductionResult }> => {
      try {
        const response = await api.post<{
          data: { message: string; result: ProductionResult };
        }>(`/production/collect/${slotId}`);
        await refreshCharacter();
        await fetchActiveProductions();
        await fetchCompletedProductions();

        // Dispatch tutorial event for crafting
        const result = response.data.data.result;
        if (result?.items?.length > 0) {
          dispatchItemCrafted(result.items[0].itemId);
        }

        return {
          success: true,
          message: response.data.data.message,
          result: result,
        };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to collect production';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchActiveProductions, fetchCompletedProductions]
  );

  /**
   * Cancel production in progress
   */
  const cancelProduction = useCallback(
    async (slotId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/production/cancel/${slotId}`
        );
        await fetchActiveProductions();
        if (selectedSlot?.propertyId) {
          await fetchPropertySlots(selectedSlot.propertyId);
        }
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to cancel production';
        return { success: false, message: errorMessage };
      }
    },
    [fetchActiveProductions, fetchPropertySlots, selectedSlot?.propertyId]
  );

  /**
   * Clear selected slot
   */
  const clearSelectedSlot = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    activeProductions,
    completedProductions,
    selectedSlot,
    propertySlots,
    isLoading,
    error,

    // Fetch operations
    fetchActiveProductions,
    fetchCompletedProductions,
    fetchSlotDetails,
    fetchPropertySlots,

    // Production operations
    startProduction,
    collectProduction,
    cancelProduction,

    // UI helpers
    clearSelectedSlot,
    clearError,
  };
};

export default useProduction;
