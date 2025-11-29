/**
 * useMerchants Hook
 * Handles wandering merchant API operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'mount' | 'material' | 'quest';

export interface MerchantItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  rarity: ItemRarity;
  type: ItemType;
  trustRequired?: number;
  quantity?: number;
  isExclusive?: boolean;
}

export interface RouteStop {
  locationId: string;
  locationName: string;
  arrivalDay: number;
  departureDay: number;
  arrivalHour: number;
  departureHour: number;
}

export interface TrustUnlock {
  level: number;
  benefit: string;
  description: string;
}

export interface MerchantDialogue {
  greeting: string[];
  trading: string[];
  departure: string[];
  busy: string[];
  trust: {
    low: string[];
    medium: string[];
    high: string[];
  };
}

export interface WanderingMerchant {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  faction: string;
  route: RouteStop[];
  inventory: MerchantItem[];
  dialogue: MerchantDialogue;
  specialFeatures: string[];
  trustLevels: TrustUnlock[];
  barter?: boolean;
  hidden?: boolean;
  discoveryCondition?: string;
}

export interface MerchantState {
  merchantId: string;
  merchantName: string;
  currentLocationName: string;
  currentLocation: string;
  isAvailableForTrade: boolean;
  inventory: MerchantItem[];
  specialFeatures: string[];
  usesBarter: boolean;
  isHidden: boolean;
  currentStop?: RouteStop;
  nextStop?: RouteStop;
}

export interface MerchantTrustInfo {
  current: string;
  next?: TrustUnlock;
  unlocked: TrustUnlock[];
  trustLevel: number;
}

export interface UpcomingMerchant {
  merchant: WanderingMerchant;
  hoursUntilArrival: number;
  stop: RouteStop;
}

interface BuyItemResult {
  success: boolean;
  message: string;
  item?: MerchantItem;
  totalCost?: number;
  newGold?: number;
}

interface UseMerchantsReturn {
  merchants: WanderingMerchant[];
  availableMerchants: MerchantState[];
  selectedMerchant: WanderingMerchant | null;
  merchantState: MerchantState | null;
  merchantInventory: MerchantItem[];
  trustInfo: MerchantTrustInfo | null;
  upcomingMerchants: UpcomingMerchant[];
  isLoading: boolean;
  error: string | null;
  fetchAllMerchants: () => Promise<void>;
  fetchAvailableMerchants: () => Promise<void>;
  fetchMerchantsAtLocation: (locationId: string) => Promise<MerchantState[]>;
  fetchMerchantDetails: (merchantId: string) => Promise<void>;
  fetchMerchantState: (merchantId: string) => Promise<void>;
  fetchMerchantInventory: (merchantId: string) => Promise<void>;
  fetchMerchantTrust: (merchantId: string) => Promise<void>;
  fetchUpcomingMerchants: (locationId: string, hoursAhead?: number) => Promise<void>;
  discoverMerchant: (merchantId: string) => Promise<{ success: boolean; message: string }>;
  buyItem: (merchantId: string, itemId: string, quantity?: number) => Promise<BuyItemResult>;
  searchMerchants: (query: string) => Promise<WanderingMerchant[]>;
  clearSelectedMerchant: () => void;
}

export const useMerchants = (): UseMerchantsReturn => {
  const [merchants, setMerchants] = useState<WanderingMerchant[]>([]);
  const [availableMerchants, setAvailableMerchants] = useState<MerchantState[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<WanderingMerchant | null>(null);
  const [merchantState, setMerchantState] = useState<MerchantState | null>(null);
  const [merchantInventory, setMerchantInventory] = useState<MerchantItem[]>([]);
  const [trustInfo, setTrustInfo] = useState<MerchantTrustInfo | null>(null);
  const [upcomingMerchants, setUpcomingMerchants] = useState<UpcomingMerchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  const fetchAllMerchants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { merchants: WanderingMerchant[] } }>('/merchants/all');
      setMerchants(response.data.data.merchants);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableMerchants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { merchants: MerchantState[] } }>('/merchants/available');
      setAvailableMerchants(response.data.data.merchants);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch available merchants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantsAtLocation = useCallback(async (locationId: string): Promise<MerchantState[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { merchants: MerchantState[] } }>(
        `/merchants/at-location/${locationId}`
      );
      return response.data.data.merchants;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchants at location');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantDetails = useCallback(async (merchantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { merchant: WanderingMerchant } }>(
        `/merchants/${merchantId}`
      );
      setSelectedMerchant(response.data.data.merchant);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchant details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantState = useCallback(async (merchantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { state: MerchantState } }>(
        `/merchants/${merchantId}/state`
      );
      setMerchantState(response.data.data.state);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchant state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantInventory = useCallback(async (merchantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { inventory: MerchantItem[] } }>(
        `/merchants/${merchantId}/inventory`
      );
      setMerchantInventory(response.data.data.inventory);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchant inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMerchantTrust = useCallback(async (merchantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: MerchantTrustInfo }>(
        `/merchants/${merchantId}/trust`
      );
      setTrustInfo(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch merchant trust info');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUpcomingMerchants = useCallback(async (locationId: string, hoursAhead: number = 48) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { upcoming: UpcomingMerchant[] } }>(
        `/merchants/upcoming/${locationId}?hours=${hoursAhead}`
      );
      setUpcomingMerchants(response.data.data.upcoming);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch upcoming merchants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const discoverMerchant = useCallback(async (merchantId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/merchants/${merchantId}/discover`
      );
      await refreshCharacter();
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.error || 'Failed to discover merchant' };
    }
  }, [refreshCharacter]);

  const buyItem = useCallback(async (
    merchantId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<BuyItemResult> => {
    try {
      const response = await api.post<{
        data: {
          message: string;
          item: MerchantItem;
          totalCost: number;
          newGold: number;
        };
      }>(`/merchants/${merchantId}/buy`, { itemId, quantity });

      await refreshCharacter();

      return {
        success: true,
        message: response.data.data.message,
        item: response.data.data.item,
        totalCost: response.data.data.totalCost,
        newGold: response.data.data.newGold,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to purchase item',
      };
    }
  }, [refreshCharacter]);

  const searchMerchants = useCallback(async (query: string): Promise<WanderingMerchant[]> => {
    try {
      const response = await api.get<{ data: { merchants: WanderingMerchant[] } }>(
        `/merchants/search?q=${encodeURIComponent(query)}`
      );
      return response.data.data.merchants;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search merchants');
      return [];
    }
  }, []);

  const clearSelectedMerchant = useCallback(() => {
    setSelectedMerchant(null);
    setMerchantState(null);
    setMerchantInventory([]);
    setTrustInfo(null);
  }, []);

  return {
    merchants,
    availableMerchants,
    selectedMerchant,
    merchantState,
    merchantInventory,
    trustInfo,
    upcomingMerchants,
    isLoading,
    error,
    fetchAllMerchants,
    fetchAvailableMerchants,
    fetchMerchantsAtLocation,
    fetchMerchantDetails,
    fetchMerchantState,
    fetchMerchantInventory,
    fetchMerchantTrust,
    fetchUpcomingMerchants,
    discoverMerchant,
    buyItem,
    searchMerchants,
    clearSelectedMerchant,
  };
};

export default useMerchants;
