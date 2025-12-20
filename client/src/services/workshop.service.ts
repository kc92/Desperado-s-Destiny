/**
 * Workshop Service
 * API client for workshop access, masterwork crafting, and repair operations
 */

import api from './api';

// ===== Types =====

export interface WorkshopTier {
  id: number;
  name: string;
  description: string;
  qualityBonus: number;
  maxQuality: number;
  accessCost: number;
  durabilityBonus: number;
  features: string[];
}

export interface Workshop {
  _id: string;
  name: string;
  locationId: string;
  locationName: string;
  professionId: string;
  professionName: string;
  tier: number;
  tierInfo: WorkshopTier;
  description: string;
  owner?: string;
  ownerName?: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  qualityBonus: number;
  durabilityBonus: number;
  specialties: string[];
  facilities: string[];
  isAvailable: boolean;
  currentUsers?: number;
  maxUsers?: number;
  reputation?: number;
}

export interface WorkshopAccess {
  workshopId: string;
  workshopName: string;
  accessType: 'hourly' | 'daily' | 'weekly' | 'permanent';
  expiresAt?: string;
  accessGrantedAt: string;
  costPaid: number;
}

export interface QualityTier {
  level: number;
  name: string;
  description: string;
  minQuality: number;
  maxQuality: number;
  durabilityMultiplier: number;
  valueMultiplier: number;
  color?: string;
}

export interface RepairCost {
  itemId: string;
  itemName: string;
  currentDurability: number;
  maxDurability: number;
  targetPercentage: number;
  targetDurability: number;
  repairAmount: number;
  baseCost: number;
  workshopDiscount: number;
  totalCost: number;
  canAfford: boolean;
  characterGold: number;
}

export interface RepairCheck {
  canRepair: boolean;
  reason?: string;
  hasAccess: boolean;
  hasGold: boolean;
  needsRepair: boolean;
  currentDurability: number;
  maxDurability: number;
  estimatedCost: number;
}

export interface MasterworkItem {
  _id: string;
  name: string;
  customName?: string;
  quality: number;
  qualityTier: string;
  durability: number;
  maxDurability: number;
  workshopCreated?: string;
  craftedBy?: string;
  craftedAt?: string;
}

// ===== Request/Response Types =====

export interface WorkshopInfoResponse {
  workshop: Workshop;
  hasAccess: boolean;
  currentAccess?: WorkshopAccess;
}

export interface LocationWorkshopsResponse {
  locationId: string;
  locationName: string;
  workshops: Workshop[];
  totalWorkshops: number;
}

export interface ProfessionWorkshopsResponse {
  professionId: string;
  professionName: string;
  workshops: Workshop[];
  totalWorkshops: number;
  recommendedWorkshop?: Workshop;
}

export interface WorkshopRecommendation {
  workshop: Workshop;
  score: number;
  reasons: string[];
  distance?: number;
  matchesProfession: boolean;
}

export interface WorkshopRecommendationsResponse {
  recommendations: WorkshopRecommendation[];
  characterLocation?: string;
  characterProfessions: string[];
}

export interface BestWorkshopResponse {
  workshop: Workshop;
  reasons: string[];
  isAccessible: boolean;
  travelRequired: boolean;
  estimatedCost: number;
}

export interface RequestAccessRequest {
  workshopId: string;
  duration?: 'hourly' | 'daily' | 'weekly';
  membershipType?: 'basic' | 'premium' | 'master';
}

export interface RequestAccessResponse {
  success: true;
  access: WorkshopAccess;
  workshop: Workshop;
  cost: number;
  newGold: number;
  message: string;
}

export interface RenameMasterworkRequest {
  itemId: string;
  newName: string;
}

export interface RenameMasterworkResponse {
  success: true;
  item: MasterworkItem;
  oldName: string;
  newName: string;
  message: string;
}

export interface RepairItemRequest {
  targetPercentage?: number;
}

export interface RepairItemResponse {
  success: true;
  item: MasterworkItem;
  repairAmount: number;
  costPaid: number;
  newDurability: number;
  newGold: number;
  message: string;
}

export interface WorkshopsSummaryResponse {
  totalWorkshops: number;
  workshopsByTier: Record<number, number>;
  workshopsByProfession: Record<string, number>;
  averageQualityBonus: number;
  topWorkshops: Workshop[];
}

export interface QualityTiersResponse {
  tiers: QualityTier[];
  minQuality: number;
  maxQuality: number;
}

// ===== Workshop Service =====

export const workshopService = {
  // ===== Public/Informational Routes =====

  /**
   * Get summary of all workshops in the world
   */
  async getWorkshopsSummary(): Promise<WorkshopsSummaryResponse> {
    const response = await api.get<{ data: WorkshopsSummaryResponse }>('/workshops/summary');
    return response.data.data;
  },

  /**
   * Get quality tier information
   */
  async getQualityTiers(): Promise<QualityTier[]> {
    const response = await api.get<{ data: QualityTiersResponse }>('/workshops/quality-tiers');
    return response.data.data?.tiers || [];
  },

  // ===== Workshop Discovery Routes =====

  /**
   * Get workshops at a specific location
   */
  async getLocationWorkshops(locationId: string): Promise<Workshop[]> {
    const response = await api.get<{ data: LocationWorkshopsResponse }>(
      `/workshops/location/${locationId}`
    );
    return response.data.data?.workshops || [];
  },

  /**
   * Get workshops by profession
   * @param professionId - The profession ID to filter by
   * @param minTier - Optional minimum workshop tier
   * @param location - Optional location filter
   */
  async getWorkshopsByProfession(
    professionId: string,
    minTier?: number,
    location?: string
  ): Promise<Workshop[]> {
    const params: Record<string, string | number> = {};
    if (minTier !== undefined) params.minTier = minTier;
    if (location) params.location = location;

    const response = await api.get<{ data: ProfessionWorkshopsResponse }>(
      `/workshops/profession/${professionId}`,
      { params }
    );
    return response.data.data?.workshops || [];
  },

  /**
   * Get workshop recommendations for character
   */
  async getRecommendations(): Promise<WorkshopRecommendation[]> {
    const response = await api.get<{ data: WorkshopRecommendationsResponse }>(
      '/workshops/recommendations'
    );
    return response.data.data?.recommendations || [];
  },

  /**
   * Find the best workshop for a profession
   */
  async findBestWorkshop(professionId: string): Promise<BestWorkshopResponse> {
    const response = await api.get<{ data: BestWorkshopResponse }>(
      `/workshops/best/${professionId}`
    );
    return response.data.data;
  },

  /**
   * Get specific workshop information
   */
  async getWorkshopInfo(workshopId: string): Promise<WorkshopInfoResponse> {
    const response = await api.get<{ data: WorkshopInfoResponse }>(`/workshops/${workshopId}`);
    return response.data.data;
  },

  // ===== Workshop Access Routes =====

  /**
   * Request access to a workshop
   */
  async requestAccess(request: RequestAccessRequest): Promise<RequestAccessResponse> {
    const response = await api.post<{ data: RequestAccessResponse }>(
      '/workshops/access',
      request
    );
    return response.data.data;
  },

  // ===== Masterwork Operations =====

  /**
   * Rename a masterwork item
   */
  async renameMasterwork(itemId: string, newName: string): Promise<RenameMasterworkResponse> {
    const response = await api.post<{ data: RenameMasterworkResponse }>(
      '/workshops/masterwork/rename',
      { itemId, newName }
    );
    return response.data.data;
  },

  // ===== Repair Operations =====

  /**
   * Get repair cost for an item
   * @param itemId - The item to repair
   * @param targetPercentage - Optional target durability percentage (default 100)
   */
  async getRepairCost(itemId: string, targetPercentage?: number): Promise<RepairCost> {
    const params = targetPercentage ? { targetPercentage } : {};
    const response = await api.get<{ data: RepairCost }>(
      `/workshops/repair/cost/${itemId}`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Check if character can repair an item
   */
  async checkCanRepair(itemId: string): Promise<RepairCheck> {
    const response = await api.get<{ data: RepairCheck }>(
      `/workshops/repair/check/${itemId}`
    );
    return response.data.data;
  },

  /**
   * Repair an item
   * @param itemId - The item to repair
   * @param targetPercentage - Optional target durability percentage (default 100)
   */
  async repairItem(itemId: string, targetPercentage?: number): Promise<RepairItemResponse> {
    const body = targetPercentage ? { targetPercentage } : {};
    const response = await api.post<{ data: RepairItemResponse }>(
      `/workshops/repair/${itemId}`,
      body
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get workshops accessible at character's current location
   */
  async getLocalWorkshops(characterLocationId: string): Promise<Workshop[]> {
    return this.getLocationWorkshops(characterLocationId);
  },

  /**
   * Check if character has access to a workshop
   */
  async hasAccess(workshopId: string): Promise<boolean> {
    const info = await this.getWorkshopInfo(workshopId);
    return info.hasAccess;
  },

  /**
   * Get the cheapest access option for a workshop
   */
  getCheapestAccessCost(workshop: Workshop): {
    duration: 'hourly' | 'daily' | 'weekly';
    cost: number;
  } {
    const options = [
      { duration: 'hourly' as const, cost: workshop.hourlyRate },
      { duration: 'daily' as const, cost: workshop.dailyRate },
      { duration: 'weekly' as const, cost: workshop.weeklyRate },
    ];
    return options.reduce((cheapest, option) =>
      option.cost < cheapest.cost ? option : cheapest
    );
  },

  /**
   * Calculate hourly rate from different durations
   */
  calculateHourlyRate(workshop: Workshop, duration: 'hourly' | 'daily' | 'weekly'): number {
    switch (duration) {
      case 'hourly':
        return workshop.hourlyRate;
      case 'daily':
        return workshop.dailyRate / 24;
      case 'weekly':
        return workshop.weeklyRate / (24 * 7);
    }
  },

  /**
   * Get quality tier name from quality value
   */
  getQualityTierName(quality: number, tiers: QualityTier[]): string {
    const tier = tiers.find(
      (t) => quality >= t.minQuality && quality <= t.maxQuality
    );
    return tier?.name || 'Unknown';
  },

  /**
   * Calculate repair percentage needed
   */
  calculateRepairPercentage(currentDurability: number, maxDurability: number): number {
    return Math.round((currentDurability / maxDurability) * 100);
  },

  /**
   * Check if item needs repair (below threshold)
   */
  needsRepair(currentDurability: number, maxDurability: number, threshold = 0.75): boolean {
    return currentDurability / maxDurability < threshold;
  },

  /**
   * Get workshop tier information
   */
  getWorkshopTierInfo(tier: number): Partial<WorkshopTier> {
    const tierInfo: Record<number, Partial<WorkshopTier>> = {
      1: { name: 'Basic Workshop', qualityBonus: 5, durabilityBonus: 0 },
      2: { name: 'Improved Workshop', qualityBonus: 10, durabilityBonus: 5 },
      3: { name: 'Advanced Workshop', qualityBonus: 15, durabilityBonus: 10 },
      4: { name: 'Master Workshop', qualityBonus: 20, durabilityBonus: 15 },
      5: { name: 'Legendary Workshop', qualityBonus: 25, durabilityBonus: 20 },
    };
    return tierInfo[tier] || tierInfo[1];
  },

  /**
   * Sort workshops by quality bonus (descending)
   */
  sortByQuality(workshops: Workshop[]): Workshop[] {
    return [...workshops].sort((a, b) => b.qualityBonus - a.qualityBonus);
  },

  /**
   * Sort workshops by cost (ascending)
   */
  sortByCost(workshops: Workshop[], duration: 'hourly' | 'daily' | 'weekly' = 'hourly'): Workshop[] {
    return [...workshops].sort((a, b) => {
      const aCost = duration === 'hourly' ? a.hourlyRate :
                    duration === 'daily' ? a.dailyRate : a.weeklyRate;
      const bCost = duration === 'hourly' ? b.hourlyRate :
                    duration === 'daily' ? b.dailyRate : b.weeklyRate;
      return aCost - bCost;
    });
  },

  /**
   * Filter workshops by availability
   */
  filterAvailable(workshops: Workshop[]): Workshop[] {
    return workshops.filter((w) => w.isAvailable);
  },

  /**
   * Filter workshops by affordable cost
   */
  filterAffordable(
    workshops: Workshop[],
    characterGold: number,
    duration: 'hourly' | 'daily' | 'weekly' = 'hourly'
  ): Workshop[] {
    return workshops.filter((w) => {
      const cost = duration === 'hourly' ? w.hourlyRate :
                   duration === 'daily' ? w.dailyRate : w.weeklyRate;
      return cost <= characterGold;
    });
  },
};

export default workshopService;
