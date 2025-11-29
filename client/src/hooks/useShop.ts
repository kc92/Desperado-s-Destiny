/**
 * useShop Hook
 * Handles shop and inventory operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'mount' | 'material' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemEffect {
  type: 'stat' | 'energy' | 'health' | 'special';
  stat?: string;
  value: number;
  description: string;
}

export interface ShopItem {
  _id: string;
  itemId: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  price: number;
  sellPrice: number;
  icon: string;
  effects: ItemEffect[];
  levelRequired: number;
  equipSlot?: string;
  isEquippable: boolean;
  isConsumable: boolean;
  isStackable: boolean;
}

export interface InventoryItemWithDetails {
  item: ShopItem;
  quantity: number;
  acquiredAt: string;
}

export interface Equipment {
  weapon: ShopItem | null;
  head: ShopItem | null;
  body: ShopItem | null;
  feet: ShopItem | null;
  mount: ShopItem | null;
  accessory: ShopItem | null;
}

interface UseShopReturn {
  items: ShopItem[];
  inventory: InventoryItemWithDetails[];
  equipment: Equipment;
  isLoading: boolean;
  error: string | null;
  fetchShopItems: (type?: ItemType) => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchEquipment: () => Promise<void>;
  buyItem: (itemId: string, quantity?: number) => Promise<{ success: boolean; message: string }>;
  sellItem: (itemId: string, quantity?: number) => Promise<{ success: boolean; message: string }>;
  useItem: (itemId: string) => Promise<{ success: boolean; message: string; effects?: string[] }>;
  equipItem: (itemId: string) => Promise<{ success: boolean; message: string }>;
  unequipItem: (slot: string) => Promise<{ success: boolean; message: string }>;
}

export const useShop = (): UseShopReturn => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItemWithDetails[]>([]);
  const [equipment, setEquipment] = useState<Equipment>({
    weapon: null,
    head: null,
    body: null,
    feet: null,
    mount: null,
    accessory: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const fetchShopItems = useCallback(async (type?: ItemType) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = type ? `/shop?type=${type}` : '/shop';
      const response = await api.get<{ data: { items: ShopItem[] } }>(url);
      setItems(response.data.data.items);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch shop items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { inventory: InventoryItemWithDetails[] } }>('/shop/inventory');
      setInventory(response.data.data.inventory);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buyItem = useCallback(async (itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>('/shop/buy', { itemId, quantity });
      await refreshCharacter();
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Purchase failed' };
    }
  }, [refreshCharacter]);

  const sellItem = useCallback(async (itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>('/shop/sell', { itemId, quantity });
      await refreshCharacter();
      await fetchInventory();
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Sale failed' };
    }
  }, [refreshCharacter, fetchInventory]);

  const useItem = useCallback(async (itemId: string): Promise<{ success: boolean; message: string; effects?: string[] }> => {
    try {
      const response = await api.post<{ data: { message: string; effects: string[] } }>('/shop/use', { itemId });
      await refreshCharacter();
      await fetchInventory();
      return {
        success: true,
        message: response.data.data.message,
        effects: response.data.data.effects
      };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Failed to use item' };
    }
  }, [refreshCharacter, fetchInventory]);

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await api.get<{ data: { equipment: Equipment } }>('/shop/equipment');
      setEquipment(response.data.data.equipment);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch equipment');
    }
  }, []);

  const equipItem = useCallback(async (itemId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>('/shop/equip', { itemId });
      await fetchEquipment();
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Failed to equip item' };
    }
  }, [fetchEquipment]);

  const unequipItem = useCallback(async (slot: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>('/shop/unequip', { slot });
      await fetchEquipment();
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Failed to unequip item' };
    }
  }, [fetchEquipment]);

  return {
    items,
    inventory,
    equipment,
    isLoading,
    error,
    fetchShopItems,
    fetchInventory,
    fetchEquipment,
    buyItem,
    sellItem,
    useItem,
    equipItem,
    unequipItem
  };
};
