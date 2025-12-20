/**
 * Shop Service
 * API client for shop and inventory management
 */

import api from './api';

// ===== Types =====

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'tool' | 'mount' | 'cosmetic' | 'quest' | 'misc';

export interface ShopItem {
  _id: string;
  itemId: string;
  name: string;
  description: string;
  type: ItemType;
  price: number;
  sellPrice: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level?: number;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    energy?: number;
    speed?: number;
    luck?: number;
  };
  effects?: {
    type: string;
    value: number;
    duration?: number;
  }[];
  requirements?: {
    level?: number;
    faction?: string;
    reputation?: number;
    skill?: { name: string; level: number };
  };
  maxStack?: number;
  tradeable?: boolean;
  consumable?: boolean;
  equipSlot?: 'weapon' | 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'accessory' | 'mount';
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  equipped?: boolean;
  acquiredAt?: string;
}

export interface Equipment {
  weapon?: ShopItem;
  head?: ShopItem;
  chest?: ShopItem;
  legs?: ShopItem;
  feet?: ShopItem;
  hands?: ShopItem;
  accessory?: ShopItem;
  mount?: ShopItem;
}

// ===== Request/Response Types =====

export interface GetShopItemsResponse {
  items: ShopItem[];
}

export interface GetItemResponse {
  item: ShopItem;
}

export interface BuyItemRequest {
  itemId: string;
  quantity?: number;
}

export interface BuyItemResponse {
  message: string;
  item: ShopItem;
  quantity: number;
  totalCost: number;
  newGold: number;
  inventory: InventoryItem[];
}

export interface SellItemRequest {
  itemId: string;
  quantity?: number;
}

export interface SellItemResponse {
  message: string;
  item: ShopItem;
  quantity: number;
  totalValue: number;
  newGold: number;
  inventory: InventoryItem[];
}

export interface UseItemRequest {
  itemId: string;
}

export interface UseItemResponse {
  message: string;
  item: ShopItem;
  effect?: {
    type: string;
    value: number;
    applied: boolean;
  };
  newStats?: {
    health?: number;
    energy?: number;
    gold?: number;
  };
}

export interface GetInventoryResponse {
  inventory: InventoryItem[];
  items: ShopItem[];
  maxSlots: number;
  usedSlots: number;
}

export interface EquipItemRequest {
  itemId: string;
}

export interface EquipItemResponse {
  message: string;
  item: ShopItem;
  equipment: Equipment;
  statsChange?: {
    attack?: number;
    defense?: number;
    health?: number;
    speed?: number;
  };
}

export interface UnequipItemRequest {
  slot: string;
}

export interface UnequipItemResponse {
  message: string;
  item: ShopItem;
  equipment: Equipment;
  statsChange?: {
    attack?: number;
    defense?: number;
    health?: number;
    speed?: number;
  };
}

export interface GetEquipmentResponse {
  equipment: Equipment;
  totalStats: {
    attack: number;
    defense: number;
    health: number;
    speed: number;
    luck: number;
  };
}

// ===== Shop Service =====

export const shopService = {
  // ===== Public Routes =====

  /**
   * Get all shop items with optional type filter
   */
  async getShopItems(type?: ItemType): Promise<GetShopItemsResponse> {
    const params = type ? { type } : {};
    const response = await api.get<{ data: GetShopItemsResponse }>('/shop', { params });
    return response.data.data;
  },

  /**
   * Get details for a specific item
   */
  async getItem(itemId: string): Promise<GetItemResponse> {
    const response = await api.get<{ data: GetItemResponse }>(`/shop/items/${itemId}`);
    return response.data.data;
  },

  // ===== Authenticated Routes =====

  /**
   * Buy an item from the shop
   */
  async buyItem(itemId: string, quantity = 1): Promise<BuyItemResponse> {
    const response = await api.post<{ data: BuyItemResponse }>('/shop/buy', {
      itemId,
      quantity,
    });
    return response.data.data;
  },

  /**
   * Sell an item to the shop
   */
  async sellItem(itemId: string, quantity = 1): Promise<SellItemResponse> {
    const response = await api.post<{ data: SellItemResponse }>('/shop/sell', {
      itemId,
      quantity,
    });
    return response.data.data;
  },

  /**
   * Use a consumable item
   */
  async useItem(itemId: string): Promise<UseItemResponse> {
    const response = await api.post<{ data: UseItemResponse }>('/shop/use', { itemId });
    return response.data.data;
  },

  /**
   * Get character's inventory
   */
  async getInventory(): Promise<GetInventoryResponse> {
    const response = await api.get<{ data: GetInventoryResponse }>('/shop/inventory');
    return response.data.data;
  },

  /**
   * Equip an item from inventory
   */
  async equipItem(itemId: string): Promise<EquipItemResponse> {
    const response = await api.post<{ data: EquipItemResponse }>('/shop/equip', { itemId });
    return response.data.data;
  },

  /**
   * Unequip an item to inventory
   */
  async unequipItem(slot: string): Promise<UnequipItemResponse> {
    const response = await api.post<{ data: UnequipItemResponse }>('/shop/unequip', { slot });
    return response.data.data;
  },

  /**
   * Get currently equipped items
   */
  async getEquipment(): Promise<GetEquipmentResponse> {
    const response = await api.get<{ data: GetEquipmentResponse }>('/shop/equipment');
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Check if character can afford an item
   */
  canAfford(currentGold: number, itemPrice: number, quantity = 1): boolean {
    return currentGold >= itemPrice * quantity;
  },

  /**
   * Check if character meets item requirements
   */
  meetsRequirements(
    characterLevel: number,
    characterFaction: string,
    characterReputation: number,
    item: ShopItem
  ): { canUse: boolean; reason?: string } {
    if (!item.requirements) {
      return { canUse: true };
    }

    if (item.requirements.level && characterLevel < item.requirements.level) {
      return { canUse: false, reason: `Requires level ${item.requirements.level}` };
    }

    if (item.requirements.faction && characterFaction !== item.requirements.faction) {
      return { canUse: false, reason: `Requires faction: ${item.requirements.faction}` };
    }

    if (item.requirements.reputation && characterReputation < item.requirements.reputation) {
      return { canUse: false, reason: `Requires ${item.requirements.reputation} reputation` };
    }

    return { canUse: true };
  },

  /**
   * Calculate total value of items being sold
   */
  calculateSellValue(item: ShopItem, quantity: number): number {
    return item.sellPrice * quantity;
  },

  /**
   * Get items by type from a list
   */
  filterItemsByType(items: ShopItem[], type: ItemType): ShopItem[] {
    return items.filter((item) => item.type === type);
  },

  /**
   * Get items by rarity from a list
   */
  filterItemsByRarity(
    items: ShopItem[],
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  ): ShopItem[] {
    return items.filter((item) => item.rarity === rarity);
  },

  /**
   * Sort items by price
   */
  sortByPrice(items: ShopItem[], ascending = true): ShopItem[] {
    return [...items].sort((a, b) => (ascending ? a.price - b.price : b.price - a.price));
  },

  /**
   * Sort items by level requirement
   */
  sortByLevel(items: ShopItem[], ascending = true): ShopItem[] {
    return [...items].sort((a, b) => {
      const aLevel = a.level || 0;
      const bLevel = b.level || 0;
      return ascending ? aLevel - bLevel : bLevel - aLevel;
    });
  },
};

export default shopService;
