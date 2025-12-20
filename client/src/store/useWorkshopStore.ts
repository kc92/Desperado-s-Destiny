/**
 * Workshop Store
 * Manages workshops, production, and crafting recipes
 */

import { create } from 'zustand';
import { workshopService } from '@/services/workshop.service';
import { productionService } from '@/services/production.service';
import { craftingService } from '@/services/crafting.service';
import { logger } from '@/services/logger.service';
import type {
  Workshop,
  WorkshopAccess,
  WorkshopRecommendation,
  QualityTier,
} from '@/services/workshop.service';
import type {
  ProductionSlot,
  ActiveProduction,
  CompletedProduction,
} from '@/services/production.service';
import type { Recipe } from '@/services/crafting.service';

interface WorkshopStore {
  // State
  workshops: Workshop[];
  activeProduction: ProductionSlot[];
  completedProduction: CompletedProduction[];
  recipes: Recipe[];
  qualityTiers: QualityTier[];
  currentWorkshop: Workshop | null;
  currentAccess: WorkshopAccess | null;
  recommendations: WorkshopRecommendation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkshops: (locationId?: string) => Promise<void>;
  fetchWorkshopInfo: (workshopId: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchProduction: () => Promise<void>;
  fetchCompletedProduction: () => Promise<void>;
  fetchPropertySlots: (propertyId: string) => Promise<void>;
  startProduction: (
    slotId: string,
    productId: string,
    quantity: number,
    workerIds?: string[],
    rushOrder?: boolean
  ) => Promise<void>;
  cancelProduction: (slotId: string) => Promise<void>;
  collectProduction: (slotId: string, autoSell?: boolean) => Promise<void>;
  fetchRecipes: () => Promise<void>;
  fetchQualityTiers: () => Promise<void>;
  requestWorkshopAccess: (
    workshopId: string,
    duration?: 'hourly' | 'daily' | 'weekly'
  ) => Promise<void>;
  clearWorkshopState: () => void;
  setError: (error: string | null) => void;
}

export const useWorkshopStore = create<WorkshopStore>((set, get) => ({
  // Initial state
  workshops: [],
  activeProduction: [],
  completedProduction: [],
  recipes: [],
  qualityTiers: [],
  currentWorkshop: null,
  currentAccess: null,
  recommendations: [],
  isLoading: false,
  error: null,

  fetchWorkshops: async (locationId?: string) => {
    set({ isLoading: true, error: null });

    try {
      const workshops = locationId
        ? await workshopService.getLocationWorkshops(locationId)
        : [];

      set({
        workshops,
        isLoading: false,
        error: null,
      });

      logger.debug('Workshops fetched successfully', {
        count: workshops.length,
        locationId
      });
    } catch (error: any) {
      logger.error('Failed to fetch workshops', error, { locationId });
      set({
        workshops: [],
        isLoading: false,
        error: error.message || 'Failed to load workshops',
      });
    }
  },

  fetchWorkshopInfo: async (workshopId: string) => {
    set({ isLoading: true, error: null });

    try {
      const info = await workshopService.getWorkshopInfo(workshopId);

      set({
        currentWorkshop: info.workshop,
        currentAccess: info.currentAccess,
        isLoading: false,
        error: null,
      });

      logger.debug('Workshop info fetched successfully', { workshopId });
    } catch (error: any) {
      logger.error('Failed to fetch workshop info', error, { workshopId });
      set({
        isLoading: false,
        error: error.message || 'Failed to load workshop information',
      });
    }
  },

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });

    try {
      const recommendations = await workshopService.getRecommendations();

      set({
        recommendations,
        isLoading: false,
        error: null,
      });

      logger.debug('Workshop recommendations fetched successfully', {
        count: recommendations.length
      });
    } catch (error: any) {
      logger.error('Failed to fetch workshop recommendations', error);
      set({
        recommendations: [],
        isLoading: false,
        error: error.message || 'Failed to load workshop recommendations',
      });
    }
  },

  fetchProduction: async () => {
    set({ isLoading: true, error: null });

    try {
      const productions = await productionService.getActiveProductions();

      set({
        activeProduction: productions,
        isLoading: false,
        error: null,
      });

      logger.debug('Active productions fetched successfully', {
        count: productions.length
      });
    } catch (error: any) {
      logger.error('Failed to fetch active productions', error);
      set({
        activeProduction: [],
        isLoading: false,
        error: error.message || 'Failed to load active productions',
      });
    }
  },

  fetchCompletedProduction: async () => {
    set({ isLoading: true, error: null });

    try {
      const productions = await productionService.getCompletedProductions();

      set({
        completedProduction: productions,
        isLoading: false,
        error: null,
      });

      logger.debug('Completed productions fetched successfully', {
        count: productions.length
      });
    } catch (error: any) {
      logger.error('Failed to fetch completed productions', error);
      set({
        completedProduction: [],
        isLoading: false,
        error: error.message || 'Failed to load completed productions',
      });
    }
  },

  fetchPropertySlots: async (propertyId: string) => {
    set({ isLoading: true, error: null });

    try {
      const slots = await productionService.getPropertySlots(propertyId);

      // Separate active and completed productions
      const active = slots.filter(slot =>
        slot.status === 'active' || slot.status === 'idle'
      );

      set({
        activeProduction: active,
        isLoading: false,
        error: null,
      });

      logger.debug('Property slots fetched successfully', {
        propertyId,
        count: slots.length
      });
    } catch (error: any) {
      logger.error('Failed to fetch property slots', error, { propertyId });
      set({
        isLoading: false,
        error: error.message || 'Failed to load property slots',
      });
    }
  },

  startProduction: async (
    slotId: string,
    productId: string,
    quantity: number,
    workerIds?: string[],
    rushOrder?: boolean
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productionService.startProduction({
        slotId,
        productId,
        quantity,
        workerIds,
        rushOrder,
      });

      // Update the active production list
      const { activeProduction } = get();
      const updatedProduction = activeProduction.map(slot =>
        slot._id === response.slot._id ? response.slot : slot
      );

      set({
        activeProduction: updatedProduction,
        isLoading: false,
        error: null,
      });

      logger.info('Production started successfully', {
        slotId,
        productId,
        quantity
      });
    } catch (error: any) {
      logger.error('Failed to start production', error, {
        slotId,
        productId,
        quantity
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to start production',
      });
      throw error;
    }
  },

  cancelProduction: async (slotId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productionService.cancelProduction(slotId);

      // Update the active production list
      const { activeProduction } = get();
      const updatedProduction = activeProduction.map(slot =>
        slot._id === response.slot._id ? response.slot : slot
      );

      set({
        activeProduction: updatedProduction,
        isLoading: false,
        error: null,
      });

      logger.info('Production cancelled successfully', { slotId });
    } catch (error: any) {
      logger.error('Failed to cancel production', error, { slotId });
      set({
        isLoading: false,
        error: error.message || 'Failed to cancel production',
      });
      throw error;
    }
  },

  collectProduction: async (slotId: string, autoSell?: boolean) => {
    set({ isLoading: true, error: null });

    try {
      const response = await productionService.collectProduction(slotId, { autoSell });

      // Update the active production list
      const { activeProduction, completedProduction } = get();
      const updatedProduction = activeProduction.map(slot =>
        slot._id === response.slot._id ? response.slot : slot
      );

      // Remove from completed production if it was there
      const updatedCompleted = completedProduction.filter(
        prod => prod.slotId !== slotId
      );

      set({
        activeProduction: updatedProduction,
        completedProduction: updatedCompleted,
        isLoading: false,
        error: null,
      });

      logger.info('Production collected successfully', {
        slotId,
        totalValue: response.totalValue
      });
    } catch (error: any) {
      logger.error('Failed to collect production', error, { slotId });
      set({
        isLoading: false,
        error: error.message || 'Failed to collect production',
      });
      throw error;
    }
  },

  fetchRecipes: async () => {
    set({ isLoading: true, error: null });

    try {
      // Using crafting service to fetch recipes
      // In the future, this might be a dedicated production recipe endpoint
      const recipes = await craftingService.getRecipes();

      set({
        recipes,
        isLoading: false,
        error: null,
      });

      logger.debug('Recipes fetched successfully', { count: recipes.length });
    } catch (error: any) {
      logger.error('Failed to fetch recipes', error);
      set({
        recipes: [],
        isLoading: false,
        error: error.message || 'Failed to load recipes',
      });
    }
  },

  fetchQualityTiers: async () => {
    set({ isLoading: true, error: null });

    try {
      const tiers = await workshopService.getQualityTiers();

      set({
        qualityTiers: tiers,
        isLoading: false,
        error: null,
      });

      logger.debug('Quality tiers fetched successfully', { count: tiers.length });
    } catch (error: any) {
      logger.error('Failed to fetch quality tiers', error);
      set({
        qualityTiers: [],
        isLoading: false,
        error: error.message || 'Failed to load quality tiers',
      });
    }
  },

  requestWorkshopAccess: async (
    workshopId: string,
    duration?: 'hourly' | 'daily' | 'weekly'
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await workshopService.requestAccess({
        workshopId,
        duration,
      });

      set({
        currentAccess: response.access,
        currentWorkshop: response.workshop,
        isLoading: false,
        error: null,
      });

      logger.info('Workshop access granted', {
        workshopId,
        duration,
        cost: response.cost
      });
    } catch (error: any) {
      logger.error('Failed to request workshop access', error, {
        workshopId,
        duration
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to request workshop access',
      });
      throw error;
    }
  },

  clearWorkshopState: () => {
    set({
      workshops: [],
      activeProduction: [],
      completedProduction: [],
      recipes: [],
      qualityTiers: [],
      currentWorkshop: null,
      currentAccess: null,
      recommendations: [],
      isLoading: false,
      error: null,
    });
    logger.debug('Workshop state cleared');
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Default export
export default useWorkshopStore;
