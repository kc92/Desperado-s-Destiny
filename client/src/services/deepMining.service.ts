/**
 * Deep Mining Service
 * API client for deep mining endpoints (Phase 13)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

// ============================================
// ILLEGAL CLAIMS TYPES
// ============================================

export interface IllegalClaim {
  _id: string;
  characterId: string;
  locationId: string;
  claimName: string;
  status: 'active' | 'discovered' | 'seized' | 'abandoned';
  oreStockpile: OreStockpile;
  gangProtection?: {
    gangId: string;
    gangName: string;
    protectionLevel: number;
  };
  inspectorHeat: number;
  lastCollectedAt: Date;
  createdAt: Date;
}

export interface OreStockpile {
  copper: number;
  iron: number;
  silver: number;
  gold: number;
  gems: number;
}

export interface IllegalClaimStatus extends IllegalClaim {
  estimatedValue: number;
  inspectionRisk: number;
  nextInspectionWindow: Date;
}

// ============================================
// DEEP MINING SHAFT TYPES
// ============================================

export interface MiningShaft {
  _id: string;
  characterId: string;
  locationId: string;
  shaftName: string;
  currentLevel: number;
  maxLevel: number;
  status: 'operational' | 'collapsed' | 'flooded' | 'abandoned';
  equipment: ShaftEquipment[];
  lastMinedAt: Date;
  createdAt: Date;
}

export interface ShaftEquipment {
  equipmentType: string;
  tier: number;
  condition: number;
  installedAt: Date;
}

export interface ShaftStatus extends MiningShaft {
  miningYield: number;
  hazardLevel: number;
  availableOres: string[];
  upgradeOptions: EquipmentOption[];
}

export interface EquipmentOption {
  equipmentType: string;
  name: string;
  description: string;
  tier: number;
  cost: number;
  yieldBonus: number;
  safetyBonus: number;
}

export interface MiningResult {
  oresGained: OreStockpile;
  totalValue: number;
  hazardEvent?: string;
  equipmentDamage?: number;
  xpGained: number;
  energyCost: number;
}

// ============================================
// FENCE OPERATIONS TYPES
// ============================================

export interface FenceListing {
  fenceLocationId: string;
  fenceName: string;
  locationName: string;
  trustLevel: number;
  specialties: string[];
  priceModifier: number;
  stingRisk: number;
}

export interface FenceQuote {
  fenceLocationId: string;
  items: FenceQuoteItem[];
  totalValue: number;
  trustBonus: number;
  stingRisk: number;
  expiresAt: Date;
}

export interface FenceQuoteItem {
  itemType: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface FenceItem {
  itemType: string;
  quantity: number;
}

export interface FenceSaleResult {
  itemsSold: FenceQuoteItem[];
  totalEarned: number;
  trustGained: number;
  stingTriggered: boolean;
  stingConsequences?: string;
}

// ============================================
// INSPECTION TYPES
// ============================================

export interface InspectionInfo {
  claimId: string;
  inspectionLikelihood: number;
  factors: InspectionFactor[];
  nextInspectionWindow: Date;
  bribeOptions: BribeOption[];
}

export interface InspectionFactor {
  name: string;
  impact: number;
  description: string;
}

export interface BribeOption {
  inspectorType: string;
  baseCost: number;
  successChance: number;
  consequences: string;
}

/**
 * Deep Mining service for API calls
 */
export const deepMiningService = {
  // ============================================
  // ILLEGAL CLAIMS
  // ============================================

  /**
   * Stake a new illegal claim
   */
  stakeIllegalClaim: async (characterId: string, locationId: string, claimName?: string) => {
    const response = await apiClient.post<ApiResponse<{ claim: IllegalClaim }>>(
      '/deep-mining/illegal/stake',
      { characterId, locationId, claimName }
    );
    return response.data;
  },

  /**
   * Get all illegal claims for a character
   */
  getIllegalClaims: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ claims: IllegalClaim[] }>>(
      `/deep-mining/illegal/${characterId}`
    );
    return response.data;
  },

  /**
   * Get detailed status of a specific illegal claim
   */
  getIllegalClaimStatus: async (claimId: string) => {
    const response = await apiClient.get<ApiResponse<{ claim: IllegalClaimStatus }>>(
      `/deep-mining/illegal/status/${claimId}`
    );
    return response.data;
  },

  /**
   * Collect ore from an illegal claim
   */
  collectIllegalOre: async (characterId: string, claimId: string) => {
    const response = await apiClient.post<ApiResponse<{
      collected: OreStockpile;
      totalValue: number;
      inspectorEncounter?: string;
    }>>(
      '/deep-mining/illegal/collect',
      { characterId, claimId }
    );
    return response.data;
  },

  /**
   * Request gang protection for an illegal claim
   */
  requestGangProtection: async (characterId: string, claimId: string, gangId: string) => {
    const response = await apiClient.post<ApiResponse<{ claim: IllegalClaim; protectionCost: number }>>(
      '/deep-mining/illegal/protection',
      { characterId, claimId, gangId }
    );
    return response.data;
  },

  /**
   * Attempt to bribe an inspector
   */
  attemptBribe: async (characterId: string, claimId: string, inspectorType: string, bribeAmount: number) => {
    const response = await apiClient.post<ApiResponse<{
      success: boolean;
      newHeatLevel: number;
      message: string;
    }>>(
      '/deep-mining/illegal/bribe',
      { characterId, claimId, inspectorType, bribeAmount }
    );
    return response.data;
  },

  // ============================================
  // DEEP MINING SHAFTS
  // ============================================

  /**
   * Create a new mining shaft
   */
  createShaft: async (characterId: string, locationId: string, shaftName?: string) => {
    const response = await apiClient.post<ApiResponse<{ shaft: MiningShaft }>>(
      '/deep-mining/shaft/create',
      { characterId, locationId, shaftName }
    );
    return response.data;
  },

  /**
   * Get all shafts for a character
   */
  getShafts: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ shafts: MiningShaft[] }>>(
      `/deep-mining/shaft/${characterId}`
    );
    return response.data;
  },

  /**
   * Get detailed status of a mining shaft
   */
  getShaftStatus: async (shaftId: string) => {
    const response = await apiClient.get<ApiResponse<{ shaft: ShaftStatus }>>(
      `/deep-mining/shaft/status/${shaftId}`
    );
    return response.data;
  },

  /**
   * Descend to the next level of a shaft
   */
  descendShaft: async (characterId: string, shaftId: string) => {
    const response = await apiClient.post<ApiResponse<{
      shaft: MiningShaft;
      hazardEncountered?: string;
    }>>(
      '/deep-mining/shaft/descend',
      { characterId, shaftId }
    );
    return response.data;
  },

  /**
   * Mine at the current level of a shaft
   */
  mineAtLevel: async (characterId: string, shaftId: string) => {
    const response = await apiClient.post<ApiResponse<{ result: MiningResult }>>(
      '/deep-mining/shaft/mine',
      { characterId, shaftId }
    );
    return response.data;
  },

  /**
   * Install equipment in a shaft
   */
  installEquipment: async (characterId: string, shaftId: string, equipmentType: string, tier?: number) => {
    const response = await apiClient.post<ApiResponse<{
      shaft: MiningShaft;
      equipmentInstalled: ShaftEquipment;
      cost: number;
    }>>(
      '/deep-mining/shaft/equipment',
      { characterId, shaftId, equipmentType, tier }
    );
    return response.data;
  },

  // ============================================
  // FENCE OPERATIONS
  // ============================================

  /**
   * Get all fence locations with character's trust levels
   */
  getFenceListings: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ fences: FenceListing[] }>>(
      `/deep-mining/fence/${characterId}`
    );
    return response.data;
  },

  /**
   * Get a price quote from a fence
   */
  getFenceQuote: async (characterId: string, fenceLocationId: string, items: FenceItem[]) => {
    const response = await apiClient.post<ApiResponse<{ quote: FenceQuote }>>(
      '/deep-mining/fence/quote',
      { characterId, fenceLocationId, items }
    );
    return response.data;
  },

  /**
   * Sell items to a fence
   */
  sellToFence: async (characterId: string, fenceLocationId: string, items: FenceItem[]) => {
    const response = await apiClient.post<ApiResponse<{ result: FenceSaleResult }>>(
      '/deep-mining/fence/sell',
      { characterId, fenceLocationId, items }
    );
    return response.data;
  },

  // ============================================
  // INSPECTION INFO
  // ============================================

  /**
   * Get inspection likelihood for a claim
   */
  getInspectionInfo: async (claimId: string) => {
    const response = await apiClient.get<ApiResponse<{ info: InspectionInfo }>>(
      `/deep-mining/inspection/${claimId}`
    );
    return response.data;
  },
};

export default deepMiningService;
