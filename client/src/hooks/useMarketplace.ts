/**
 * useMarketplace Hook
 * Handles marketplace/auction house operations for the Frontier Exchange
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

// Listing types
export type ListingType = 'auction' | 'buyout' | 'both';
export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled';
export type ListingDuration = '12h' | '24h' | '48h' | '7d';

// Item categories
export type MarketCategory =
  | 'weapons'
  | 'armor'
  | 'horses'
  | 'materials'
  | 'consumables'
  | 'recipes'
  | 'cosmetics';

// Item rarity for color coding
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Sort options
export type SortOption = 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'bids_desc';

// Item effect interface
export interface ItemEffect {
  type: 'stat' | 'energy' | 'health' | 'special';
  stat?: string;
  value: number;
  description: string;
}

// Market item interface
export interface MarketItem {
  _id: string;
  itemId: string;
  name: string;
  description: string;
  category: MarketCategory;
  rarity: ItemRarity;
  icon: string;
  effects: ItemEffect[];
  levelRequired: number;
  equipSlot?: string;
  isEquippable: boolean;
  isConsumable: boolean;
  isStackable: boolean;
  quantity?: number;
}

// Bid interface
export interface Bid {
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

// Market listing interface
export interface MarketListing {
  _id: string;
  sellerId: string;
  sellerName: string;
  item: MarketItem;
  listingType: ListingType;
  startingPrice: number;
  buyoutPrice?: number;
  currentBid?: number;
  currentBidderId?: string;
  currentBidderName?: string;
  bidCount: number;
  bidHistory: Bid[];
  duration: ListingDuration;
  expiresAt: string;
  createdAt: string;
  status: ListingStatus;
  fee: number;
}

// Category interface
export interface Category {
  id: MarketCategory;
  name: string;
  icon: string;
  count: number;
}

// Price history data point
export interface PriceDataPoint {
  date: string;
  price: number;
  volume: number;
}

// Price history interface
export interface PriceHistory {
  itemId: string;
  itemName: string;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  totalSold: number;
  priceData: PriceDataPoint[];
}

// Transaction interface
export interface Transaction {
  _id: string;
  type: 'purchase' | 'sale';
  item: MarketItem;
  price: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  timestamp: string;
  fee: number;
}

// Filter interface
export interface MarketFilters {
  category?: MarketCategory;
  rarity?: ItemRarity;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  search?: string;
  page?: number;
  limit?: number;
}

// Create listing data
export interface CreateListingData {
  itemId: string;
  quantity?: number;
  listingType: ListingType;
  startingPrice: number;
  buyoutPrice?: number;
  duration: ListingDuration;
}

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

// Hook return interface
export interface UseMarketplace {
  // State
  listings: MarketListing[];
  myListings: MarketListing[];
  myBids: MarketListing[];
  transactions: Transaction[];
  categories: Category[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchListings: (filters?: MarketFilters) => Promise<void>;
  fetchListing: (listingId: string) => Promise<MarketListing | null>;
  fetchMyListings: () => Promise<void>;
  fetchMyBids: () => Promise<void>;
  fetchTransactions: (type?: 'purchase' | 'sale') => Promise<void>;
  fetchCategories: () => Promise<void>;
  createListing: (data: CreateListingData) => Promise<{ success: boolean; message: string; listing?: MarketListing }>;
  placeBid: (listingId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  buyNow: (listingId: string) => Promise<{ success: boolean; message: string }>;
  cancelListing: (listingId: string) => Promise<{ success: boolean; message: string }>;
  updateListingPrice: (listingId: string, newPrice: number) => Promise<{ success: boolean; message: string }>;
  getPriceHistory: (itemId: string) => Promise<PriceHistory | null>;
  calculateFee: (price: number) => number;
  clearError: () => void;
}

// Tax rate constant
export const MARKETPLACE_TAX_RATE = 0.05; // 5%

// Duration to hours mapping
export const DURATION_HOURS: Record<ListingDuration, number> = {
  '12h': 12,
  '24h': 24,
  '48h': 48,
  '7d': 168,
};

export const useMarketplace = (): UseMarketplace => {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [myListings, setMyListings] = useState<MarketListing[]>([]);
  const [myBids, setMyBids] = useState<MarketListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Calculate marketplace fee
  const calculateFee = useCallback((price: number): number => {
    return Math.ceil(price * MARKETPLACE_TAX_RATE);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch listings with filters
  const fetchListings = useCallback(async (filters?: MarketFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.rarity) params.append('rarity', filters.rarity);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const url = `/market/listings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<{
        data: {
          listings: MarketListing[];
          pagination: PaginationInfo;
        };
      }>(url);

      setListings(response.data.data.listings);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch marketplace listings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch single listing
  const fetchListing = useCallback(async (listingId: string): Promise<MarketListing | null> => {
    try {
      const response = await api.get<{ data: { listing: MarketListing } }>(
        `/market/listings/${listingId}`
      );
      return response.data.data.listing;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch listing details');
      return null;
    }
  }, []);

  // Fetch my listings
  const fetchMyListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { listings: MarketListing[] } }>('/market/my/listings');
      setMyListings(response.data.data.listings);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch your listings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch my bids
  const fetchMyBids = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: { listings: MarketListing[] } }>('/market/my/bids');
      setMyBids(response.data.data.listings);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch your bids');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async (type?: 'purchase' | 'sale') => {
    setIsLoading(true);
    setError(null);
    try {
      const url = type ? `/market/transactions?type=${type}` : '/market/transactions';
      const response = await api.get<{ data: { transactions: Transaction[] } }>(url);
      setTransactions(response.data.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transaction history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get<{ data: { categories: Category[] } }>('/market/categories');
      setCategories(response.data.data.categories);
    } catch (err: any) {
      // Set default categories if fetch fails
      setCategories([
        { id: 'weapons', name: 'Weapons', icon: '🔫', count: 0 },
        { id: 'armor', name: 'Armor', icon: '🛡️', count: 0 },
        { id: 'horses', name: 'Horses', icon: '🐎', count: 0 },
        { id: 'materials', name: 'Materials', icon: '📦', count: 0 },
        { id: 'consumables', name: 'Consumables', icon: '🧪', count: 0 },
        { id: 'recipes', name: 'Recipes', icon: '📜', count: 0 },
        { id: 'cosmetics', name: 'Cosmetics', icon: '🎭', count: 0 },
      ]);
    }
  }, []);

  // Create a new listing
  const createListing = useCallback(
    async (
      data: CreateListingData
    ): Promise<{ success: boolean; message: string; listing?: MarketListing }> => {
      try {
        const response = await api.post<{ data: { message: string; listing: MarketListing } }>(
          '/market/listings',
          data
        );
        await refreshCharacter();
        return {
          success: true,
          message: response.data.data.message,
          listing: response.data.data.listing,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Failed to create listing',
        };
      }
    },
    [refreshCharacter]
  );

  // Place a bid
  const placeBid = useCallback(
    async (listingId: string, amount: number): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/market/listings/${listingId}/bid`,
          { amount }
        );
        await refreshCharacter();
        return { success: true, message: response.data.data.message };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Failed to place bid',
        };
      }
    },
    [refreshCharacter]
  );

  // Buy now
  const buyNow = useCallback(
    async (listingId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/market/listings/${listingId}/buy`
        );
        await refreshCharacter();
        return { success: true, message: response.data.data.message };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Failed to complete purchase',
        };
      }
    },
    [refreshCharacter]
  );

  // Cancel listing
  const cancelListing = useCallback(
    async (listingId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await api.delete<{ data: { message: string } }>(
          `/market/listings/${listingId}`
        );
        return { success: true, message: response.data.data.message };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Failed to cancel listing',
        };
      }
    },
    []
  );

  // Update listing price (for buyout only listings)
  const updateListingPrice = useCallback(
    async (listingId: string, newPrice: number): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await api.patch<{ data: { message: string } }>(
          `/market/listings/${listingId}`,
          { buyoutPrice: newPrice }
        );
        return { success: true, message: response.data.data.message };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || 'Failed to update price',
        };
      }
    },
    []
  );

  // Get price history for an item
  const getPriceHistory = useCallback(async (itemId: string): Promise<PriceHistory | null> => {
    try {
      const response = await api.get<{ data: { priceHistory: PriceHistory } }>(
        `/market/prices/${itemId}`
      );
      return response.data.data.priceHistory;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch price history');
      return null;
    }
  }, []);

  return {
    // State
    listings,
    myListings,
    myBids,
    transactions,
    categories,
    pagination,
    isLoading,
    error,

    // Actions
    fetchListings,
    fetchListing,
    fetchMyListings,
    fetchMyBids,
    fetchTransactions,
    fetchCategories,
    createListing,
    placeBid,
    buyNow,
    cancelListing,
    updateListingPrice,
    getPriceHistory,
    calculateFee,
    clearError,
  };
};

export default useMarketplace;
