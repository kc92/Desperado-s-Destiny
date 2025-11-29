/**
 * Building Service
 * API calls for building system
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';

export interface Building {
  id: string;
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: string;
  region: string;
  parentId?: string;
  tier?: number;
  dominantFaction?: string;
  operatingHours?: {
    open: number;
    close: number;
    peakStart?: number;
    peakEnd?: number;
  };
  icon?: string;
  imageUrl?: string;
  atmosphere?: string;
  requirements?: BuildingRequirements;
  availableActions: string[];
  availableCrimes: string[];
  jobs: BuildingJob[];
  shops: BuildingShop[];
  npcs: BuildingNPC[];
  dangerLevel: number;
  factionInfluence: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  isUnlocked: boolean;
  isHidden: boolean;
}

export interface BuildingRequirements {
  minLevel?: number;
  minReputation?: number;
  maxWanted?: number;
  minCriminalRep?: number;
  requiredSkills?: { skillId: string; level: number }[];
  requiredItems?: string[];
  requiredQuests?: string[];
  faction?: string;
  factionStanding?: string;
  gangMember?: boolean;
}

export interface BuildingJob {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldownMinutes: number;
  rewards: {
    goldMin: number;
    goldMax: number;
    xp: number;
    items?: string[];
  };
  requirements?: {
    minLevel?: number;
    requiredSkill?: string;
    skillLevel?: number;
  };
}

export interface BuildingShop {
  id: string;
  name: string;
  description: string;
  shopType: string;
  items: ShopItem[];
  buyMultiplier?: number;
}

export interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  requiredLevel?: number;
}

export interface BuildingNPC {
  id: string;
  name: string;
  title?: string;
  description: string;
  personality?: string;
  faction?: string;
  dialogue?: string[];
  quests?: string[];
  isVendor?: boolean;
  shopId?: string;
}

export interface BuildingWithStatus extends Building {
  isOpen: boolean;
  currentHour?: number;
}

export const buildingService = {
  /**
   * Get all buildings in a town
   */
  async getBuildingsInTown(townId: string): Promise<ApiResponse<{ buildings: BuildingWithStatus[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ buildings: BuildingWithStatus[] }>>(
        `/locations/${townId}/buildings`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch buildings' };
    }
  },

  /**
   * Get building details
   */
  async getBuildingDetails(buildingId: string): Promise<ApiResponse<{ building: Building }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ building: Building }>>(
        `/locations/buildings/${buildingId}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch building details' };
    }
  },

  /**
   * Enter a building
   */
  async enterBuilding(buildingId: string): Promise<ApiResponse<{
    building: Building;
    message: string;
    character: { currentLocation: string };
  }>> {
    try {
      const response = await apiClient.post<ApiResponse<{
        building: Building;
        message: string;
        character: { currentLocation: string };
      }>>(
        `/locations/buildings/${buildingId}/enter`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to enter building' };
    }
  },

  /**
   * Exit current building
   */
  async exitBuilding(): Promise<ApiResponse<{
    location: any;
    message: string;
    character: { currentLocation: string };
  }>> {
    try {
      const response = await apiClient.post<ApiResponse<{
        location: any;
        message: string;
        character: { currentLocation: string };
      }>>(
        '/locations/buildings/exit'
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to exit building' };
    }
  },

  /**
   * Perform a job at current building
   */
  async performJob(jobId: string): Promise<ApiResponse<{
    success: boolean;
    rewards: { gold: number; xp: number; items?: string[] };
    message: string;
  }>> {
    try {
      const response = await apiClient.post<ApiResponse<{
        success: boolean;
        rewards: { gold: number; xp: number; items?: string[] };
        message: string;
      }>>(
        `/locations/current/jobs/${jobId}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to perform job' };
    }
  },

  /**
   * Purchase item from shop
   */
  async purchaseItem(shopId: string, itemId: string, quantity: number = 1): Promise<ApiResponse<{
    success: boolean;
    item: ShopItem;
    totalCost: number;
    message: string;
  }>> {
    try {
      const response = await apiClient.post<ApiResponse<{
        success: boolean;
        item: ShopItem;
        totalCost: number;
        message: string;
      }>>(
        `/locations/current/shops/${shopId}/purchase`,
        { itemId, quantity }
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to purchase item' };
    }
  },
};

export default buildingService;
