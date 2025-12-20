/**
 * Production Service
 * API client for property production system operations
 */

import api from './api';

// ===== Types =====

export interface ProductionSlot {
  _id: string;
  propertyId: string;
  propertyName: string;
  slotNumber: number;
  status: 'idle' | 'active' | 'completed' | 'cancelled';
  currentProduction?: ActiveProduction;
  capacity: number;
  efficiency: number;
  upgradeLevel: number;
  isLocked: boolean;
  unlockCost?: number;
  unlockRequirements?: {
    tier?: number;
    upgrade?: string;
  };
}

export interface ActiveProduction {
  _id: string;
  productId: string;
  productName: string;
  productType: string;
  quantity: number;
  progress: number; // 0-100
  startTime: string;
  estimatedCompletion: string;
  actualCompletion?: string;
  workerIds: string[];
  workerNames: string[];
  isRushOrder: boolean;
  rushMultiplier?: number;
  qualityBonus: number;
  efficiencyBonus: number;
  baseTime: number;
  modifiedTime: number;
  baseValue: number;
  estimatedValue: number;
}

export interface ProductionRecipe {
  _id: string;
  productId: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'material' | 'luxury';
  tier: number;
  baseTime: number; // minutes
  baseValue: number;
  ingredients: ProductionIngredient[];
  requirements?: {
    propertyType?: string;
    propertyTier?: number;
    workerRole?: string;
    upgrade?: string;
  };
  skillBonuses?: {
    skill: string;
    effect: string;
  }[];
  image?: string;
}

export interface ProductionIngredient {
  itemId: string;
  itemName: string;
  quantity: number;
  isOptional?: boolean;
}

export interface CompletedProduction {
  _id: string;
  slotId: string;
  propertyName: string;
  productName: string;
  quantity: number;
  quality: 'poor' | 'common' | 'good' | 'excellent' | 'masterwork';
  value: number;
  completedAt: string;
  canCollect: boolean;
}

export interface ProductionStats {
  totalProductions: number;
  activeProductions: number;
  completedProductions: number;
  totalValue: number;
  averageQuality: number;
  favoriteProduct?: string;
  mostProfitableProduct?: string;
  efficiencyRating: number;
}

// ===== Request/Response Types =====

export interface StartProductionRequest {
  slotId: string;
  productId: string;
  quantity: number;
  workerIds?: string[];
  rushOrder?: boolean;
}

export interface StartProductionResponse {
  success: boolean;
  slot: ProductionSlot;
  production: ActiveProduction;
  ingredientsConsumed: { itemId: string; quantity: number }[];
  estimatedCompletion: string;
  message: string;
}

export interface CollectProductionRequest {
  autoSell?: boolean;
}

export interface CollectProductionResponse {
  success: boolean;
  slot: ProductionSlot;
  products: {
    itemId: string;
    name: string;
    quantity: number;
    quality: string;
    value: number;
  }[];
  totalValue: number;
  soldValue?: number;
  newCharacterGold?: number;
  message: string;
}

export interface CancelProductionResponse {
  success: boolean;
  slot: ProductionSlot;
  refundedIngredients?: { itemId: string; quantity: number }[];
  refundedGold?: number;
  message: string;
}

// ===== Production Service =====

export const productionService = {
  // ===== Authenticated Routes =====

  /**
   * Start a new production order
   */
  async startProduction(request: StartProductionRequest): Promise<StartProductionResponse> {
    const response = await api.post<{ data: StartProductionResponse }>(
      '/production/start',
      request
    );
    return response.data.data;
  },

  /**
   * Collect completed production
   */
  async collectProduction(
    slotId: string,
    request?: CollectProductionRequest
  ): Promise<CollectProductionResponse> {
    const response = await api.post<{ data: CollectProductionResponse }>(
      `/production/collect/${slotId}`,
      request || {}
    );
    return response.data.data;
  },

  /**
   * Cancel active production
   */
  async cancelProduction(slotId: string): Promise<CancelProductionResponse> {
    const response = await api.post<{ data: CancelProductionResponse }>(
      `/production/cancel/${slotId}`
    );
    return response.data.data;
  },

  /**
   * Get slot details
   */
  async getSlotDetails(slotId: string): Promise<ProductionSlot> {
    const response = await api.get<{ data: ProductionSlot }>(`/production/slot/${slotId}`);
    return response.data.data;
  },

  /**
   * Get all slots for a property
   */
  async getPropertySlots(propertyId: string): Promise<ProductionSlot[]> {
    const response = await api.get<{ data: { slots: ProductionSlot[] } }>(
      `/production/property/${propertyId}`
    );
    return response.data.data?.slots || [];
  },

  /**
   * Get active productions for character
   */
  async getActiveProductions(): Promise<ProductionSlot[]> {
    const response = await api.get<{ data: { productions: ProductionSlot[] } }>(
      '/production/active'
    );
    return response.data.data?.productions || [];
  },

  /**
   * Get completed productions ready for collection
   */
  async getCompletedProductions(): Promise<CompletedProduction[]> {
    const response = await api.get<{ data: { productions: CompletedProduction[] } }>(
      '/production/completed'
    );
    return response.data.data?.productions || [];
  },

  /**
   * Admin: Update production statuses
   */
  async updateProductionStatuses(): Promise<{ updated: number; completed: number }> {
    const response = await api.post<{
      data: { updated: number; completed: number };
    }>('/production/update-statuses');
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Calculate production progress percentage
   */
  calculateProgress(startTime: string, estimatedCompletion: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(estimatedCompletion).getTime();
    const now = Date.now();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  },

  /**
   * Calculate time remaining
   */
  calculateTimeRemaining(estimatedCompletion: string): number {
    const end = new Date(estimatedCompletion).getTime();
    const now = Date.now();
    return Math.max(0, end - now);
  },

  /**
   * Format time remaining as string
   */
  formatTimeRemaining(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  },

  /**
   * Check if production is complete
   */
  isProductionComplete(estimatedCompletion: string): boolean {
    return Date.now() >= new Date(estimatedCompletion).getTime();
  },

  /**
   * Filter slots by status
   */
  filterSlotsByStatus(
    slots: ProductionSlot[],
    status: 'idle' | 'active' | 'completed' | 'cancelled'
  ): ProductionSlot[] {
    return slots.filter(slot => slot.status === status);
  },

  /**
   * Get available (idle) slots
   */
  getAvailableSlots(slots: ProductionSlot[]): ProductionSlot[] {
    return slots.filter(slot => slot.status === 'idle' && !slot.isLocked);
  },

  /**
   * Get locked slots
   */
  getLockedSlots(slots: ProductionSlot[]): ProductionSlot[] {
    return slots.filter(slot => slot.isLocked);
  },

  /**
   * Calculate rush order cost
   */
  calculateRushOrderCost(baseTime: number, baseValue: number): number {
    // Rush order costs 50% of product value + time-based fee
    const baseCost = baseValue * 0.5;
    const timeFee = Math.floor(baseTime / 10); // 1 gold per 10 minutes
    return Math.floor(baseCost + timeFee);
  },

  /**
   * Calculate rush order time reduction
   */
  calculateRushOrderTime(baseTime: number): number {
    // Rush order reduces time by 50%
    return Math.floor(baseTime * 0.5);
  },

  /**
   * Calculate worker efficiency bonus
   */
  calculateWorkerBonus(workerCount: number, baseEfficiency: number = 1): number {
    // Each worker adds 10% efficiency, diminishing returns
    let bonus = 0;
    for (let i = 0; i < workerCount; i++) {
      bonus += baseEfficiency * 0.1 * Math.pow(0.9, i);
    }
    return bonus;
  },

  /**
   * Calculate quality multiplier
   */
  getQualityMultiplier(quality: 'poor' | 'common' | 'good' | 'excellent' | 'masterwork'): number {
    const multipliers = {
      poor: 0.5,
      common: 1.0,
      good: 1.5,
      excellent: 2.0,
      masterwork: 3.0,
    };
    return multipliers[quality];
  },

  /**
   * Get quality color for UI
   */
  getQualityColor(quality: 'poor' | 'common' | 'good' | 'excellent' | 'masterwork'): string {
    const colors = {
      poor: '#808080',
      common: '#ffffff',
      good: '#1eff00',
      excellent: '#0070dd',
      masterwork: '#a335ee',
    };
    return colors[quality];
  },

  /**
   * Filter recipes by type
   */
  filterRecipesByType(
    recipes: ProductionRecipe[],
    type: 'consumable' | 'equipment' | 'material' | 'luxury'
  ): ProductionRecipe[] {
    return recipes.filter(recipe => recipe.type === type);
  },

  /**
   * Filter recipes by tier
   */
  filterRecipesByTier(recipes: ProductionRecipe[], tier: number): ProductionRecipe[] {
    return recipes.filter(recipe => recipe.tier === tier);
  },

  /**
   * Sort recipes by time
   */
  sortRecipesByTime(recipes: ProductionRecipe[], descending: boolean = false): ProductionRecipe[] {
    return [...recipes].sort((a, b) =>
      descending ? b.baseTime - a.baseTime : a.baseTime - b.baseTime
    );
  },

  /**
   * Sort recipes by value
   */
  sortRecipesByValue(
    recipes: ProductionRecipe[],
    descending: boolean = true
  ): ProductionRecipe[] {
    return [...recipes].sort((a, b) =>
      descending ? b.baseValue - a.baseValue : a.baseValue - b.baseValue
    );
  },

  /**
   * Calculate production efficiency (value per minute)
   */
  calculateEfficiency(baseValue: number, baseTime: number): number {
    if (baseTime === 0) return 0;
    return baseValue / baseTime;
  },

  /**
   * Check if recipe requirements are met
   */
  meetsRecipeRequirements(
    recipe: ProductionRecipe,
    property: {
      type: string;
      tier: number;
      upgrades: { _id: string }[];
    },
    workers: { role: string }[]
  ): boolean {
    if (!recipe.requirements) return true;

    const { propertyType, propertyTier, workerRole, upgrade } = recipe.requirements;

    if (propertyType && property.type !== propertyType) return false;
    if (propertyTier && property.tier < propertyTier) return false;
    if (workerRole && !workers.some(w => w.role === workerRole)) return false;
    if (upgrade && !property.upgrades.some(u => u._id === upgrade)) return false;

    return true;
  },

  /**
   * Check if have required ingredients
   */
  hasRequiredIngredients(
    recipe: ProductionRecipe,
    inventory: { itemId: string; quantity: number }[],
    productionQuantity: number = 1
  ): boolean {
    for (const ingredient of recipe.ingredients) {
      if (ingredient.isOptional) continue;

      const inventoryItem = inventory.find(item => item.itemId === ingredient.itemId);
      const requiredQuantity = ingredient.quantity * productionQuantity;

      if (!inventoryItem || inventoryItem.quantity < requiredQuantity) {
        return false;
      }
    }
    return true;
  },

  /**
   * Calculate missing ingredients
   */
  getMissingIngredients(
    recipe: ProductionRecipe,
    inventory: { itemId: string; quantity: number }[],
    productionQuantity: number = 1
  ): { itemId: string; itemName: string; have: number; need: number }[] {
    const missing: { itemId: string; itemName: string; have: number; need: number }[] = [];

    for (const ingredient of recipe.ingredients) {
      if (ingredient.isOptional) continue;

      const inventoryItem = inventory.find(item => item.itemId === ingredient.itemId);
      const requiredQuantity = ingredient.quantity * productionQuantity;
      const haveQuantity = inventoryItem?.quantity || 0;

      if (haveQuantity < requiredQuantity) {
        missing.push({
          itemId: ingredient.itemId,
          itemName: ingredient.itemName,
          have: haveQuantity,
          need: requiredQuantity - haveQuantity,
        });
      }
    }

    return missing;
  },

  /**
   * Estimate total production value
   */
  estimateProductionValue(
    baseValue: number,
    quantity: number,
    qualityBonus: number = 0,
    efficiencyBonus: number = 0
  ): number {
    const totalBonus = 1 + qualityBonus + efficiencyBonus;
    return Math.floor(baseValue * quantity * totalBonus);
  },
};

export default productionService;
