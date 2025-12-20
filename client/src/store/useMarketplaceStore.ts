/**
 * Marketplace Store
 * Manages marketplace state and operations
 */

import { create } from 'zustand';
import {
  marketplaceService,
  type Listing,
  type MyBid,
  type ListingsFilter,
  type CreateListingRequest,
  type ListingsResponse,
  type TransactionHistoryEntry,
  type MarketplaceCategory,
} from '@/services/marketplace.service';
import { logger } from '@/services/logger.service';

interface MarketplaceStore {
  // State
  listings: Listing[];
  myListings: Listing[];
  myBids: MyBid[];
  searchResults: Listing[];
  categories: MarketplaceCategory[];
  purchaseHistory: TransactionHistoryEntry[];
  salesHistory: TransactionHistoryEntry[];
  filters: ListingsFilter;
  pagination: ListingsResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchListings: (filters?: ListingsFilter) => Promise<void>;
  fetchMyListings: (status?: 'active' | 'sold' | 'expired' | 'cancelled') => Promise<void>;
  fetchMyBids: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPurchaseHistory: (page?: number, limit?: number) => Promise<void>;
  fetchSalesHistory: (page?: number, limit?: number) => Promise<void>;
  searchListings: (query: string, filters?: Omit<Parameters<typeof marketplaceService.searchListings>[1], 'q'>) => Promise<void>;
  createListing: (request: CreateListingRequest) => Promise<void>;
  placeBid: (listingId: string, amount: number) => Promise<void>;
  buyNow: (listingId: string) => Promise<void>;
  cancelListing: (listingId: string) => Promise<void>;
  updateListing: (listingId: string, updates: { buyoutPrice?: number; featured?: boolean }) => Promise<void>;
  setFilters: (filters: ListingsFilter) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearMarketplaceState: () => void;
  refreshListings: () => Promise<void>;

  // Computed
  hasActiveListings: () => boolean;
  hasActiveBids: () => boolean;
}

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  // Initial state
  listings: [],
  myListings: [],
  myBids: [],
  searchResults: [],
  categories: [],
  purchaseHistory: [],
  salesHistory: [],
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,

  fetchListings: async (filters?: ListingsFilter) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.getListings(filters);

      set({
        listings: response.listings,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch listings', error as Error, {
        context: 'useMarketplaceStore.fetchListings',
        filters,
      });
      set({
        listings: [],
        isLoading: false,
        error: error.message || 'Failed to fetch listings',
      });
    }
  },

  fetchMyListings: async (status) => {
    set({ isLoading: true, error: null });

    try {
      const listings = await marketplaceService.getMyListings(status);

      set({
        myListings: listings,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch my listings', error as Error, {
        context: 'useMarketplaceStore.fetchMyListings',
        status,
      });
      set({
        myListings: [],
        isLoading: false,
        error: error.message || 'Failed to fetch your listings',
      });
    }
  },

  fetchMyBids: async () => {
    set({ isLoading: true, error: null });

    try {
      const bids = await marketplaceService.getMyBids();

      set({
        myBids: bids,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch my bids', error as Error, {
        context: 'useMarketplaceStore.fetchMyBids',
      });
      set({
        myBids: [],
        isLoading: false,
        error: error.message || 'Failed to fetch your bids',
      });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });

    try {
      const categories = await marketplaceService.getCategories();

      set({
        categories,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch categories', error as Error, {
        context: 'useMarketplaceStore.fetchCategories',
      });
      set({
        categories: [],
        isLoading: false,
        error: error.message || 'Failed to fetch categories',
      });
    }
  },

  fetchPurchaseHistory: async (page, limit) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.getPurchaseHistory(page, limit);

      set({
        purchaseHistory: response.purchases,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch purchase history', error as Error, {
        context: 'useMarketplaceStore.fetchPurchaseHistory',
        page,
        limit,
      });
      set({
        purchaseHistory: [],
        isLoading: false,
        error: error.message || 'Failed to fetch purchase history',
      });
    }
  },

  fetchSalesHistory: async (page, limit) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.getSalesHistory(page, limit);

      set({
        salesHistory: response.sales,
        pagination: response.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch sales history', error as Error, {
        context: 'useMarketplaceStore.fetchSalesHistory',
        page,
        limit,
      });
      set({
        salesHistory: [],
        isLoading: false,
        error: error.message || 'Failed to fetch sales history',
      });
    }
  },

  searchListings: async (query, filters) => {
    set({ isLoading: true, error: null });

    try {
      const results = await marketplaceService.searchListings(query, filters);

      set({
        searchResults: results,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to search listings', error as Error, {
        context: 'useMarketplaceStore.searchListings',
        query,
        filters,
      });
      set({
        searchResults: [],
        isLoading: false,
        error: error.message || 'Failed to search listings',
      });
    }
  },

  createListing: async (request: CreateListingRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.createListing(request);

      if (response.success) {
        set((state) => ({
          myListings: [response.listing, ...state.myListings],
          isLoading: false,
          error: null,
        }));

        logger.info('Listing created successfully', {
          context: 'useMarketplaceStore.createListing',
          listingId: response.listing._id,
          itemId: request.itemId,
        });
      } else {
        throw new Error(response.message || 'Failed to create listing');
      }
    } catch (error: any) {
      logger.error('Failed to create listing', error as Error, {
        context: 'useMarketplaceStore.createListing',
        request,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to create listing',
      });
      throw error;
    }
  },

  placeBid: async (listingId: string, amount: number) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.placeBid(listingId, amount);

      if (response.success) {
        // Update the listing in the listings array
        set((state) => ({
          listings: state.listings.map((listing) =>
            listing._id === listingId ? response.listing : listing
          ),
          searchResults: state.searchResults.map((listing) =>
            listing._id === listingId ? response.listing : listing
          ),
          isLoading: false,
          error: null,
        }));

        // Refresh bids to get updated status
        get().fetchMyBids();

        logger.info('Bid placed successfully', {
          context: 'useMarketplaceStore.placeBid',
          listingId,
          amount,
        });
      } else {
        throw new Error(response.message || 'Failed to place bid');
      }
    } catch (error: any) {
      logger.error('Failed to place bid', error as Error, {
        context: 'useMarketplaceStore.placeBid',
        listingId,
        amount,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to place bid',
      });
      throw error;
    }
  },

  buyNow: async (listingId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.buyNow(listingId);

      if (response.success) {
        // Remove the listing from listings array
        set((state) => ({
          listings: state.listings.filter((listing) => listing._id !== listingId),
          searchResults: state.searchResults.filter((listing) => listing._id !== listingId),
          isLoading: false,
          error: null,
        }));

        logger.info('Item purchased successfully', {
          context: 'useMarketplaceStore.buyNow',
          listingId,
          itemName: response.item.name,
          price: response.totalPaid,
        });
      } else {
        throw new Error(response.message || 'Failed to purchase item');
      }
    } catch (error: any) {
      logger.error('Failed to buy now', error as Error, {
        context: 'useMarketplaceStore.buyNow',
        listingId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to purchase item',
      });
      throw error;
    }
  },

  cancelListing: async (listingId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.cancelListing(listingId);

      if (response.success) {
        // Remove the listing from myListings
        set((state) => ({
          myListings: state.myListings.filter((listing) => listing._id !== listingId),
          isLoading: false,
          error: null,
        }));

        logger.info('Listing cancelled successfully', {
          context: 'useMarketplaceStore.cancelListing',
          listingId,
        });
      } else {
        throw new Error(response.message || 'Failed to cancel listing');
      }
    } catch (error: any) {
      logger.error('Failed to cancel listing', error as Error, {
        context: 'useMarketplaceStore.cancelListing',
        listingId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to cancel listing',
      });
      throw error;
    }
  },

  updateListing: async (listingId: string, updates: { buyoutPrice?: number; featured?: boolean }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await marketplaceService.updateListing(listingId, updates);

      if (response.success) {
        // Update the listing in myListings
        set((state) => ({
          myListings: state.myListings.map((listing) =>
            listing._id === listingId ? response.listing : listing
          ),
          isLoading: false,
          error: null,
        }));

        logger.info('Listing updated successfully', {
          context: 'useMarketplaceStore.updateListing',
          listingId,
          updates,
        });
      } else {
        throw new Error(response.message || 'Failed to update listing');
      }
    } catch (error: any) {
      logger.error('Failed to update listing', error as Error, {
        context: 'useMarketplaceStore.updateListing',
        listingId,
        updates,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to update listing',
      });
      throw error;
    }
  },

  setFilters: (filters: ListingsFilter) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  clearMarketplaceState: () => {
    set({
      listings: [],
      myListings: [],
      myBids: [],
      searchResults: [],
      categories: [],
      purchaseHistory: [],
      salesHistory: [],
      filters: {},
      pagination: null,
      isLoading: false,
      error: null,
    });
  },

  refreshListings: async () => {
    const { filters } = get();
    await get().fetchListings(filters);
  },

  hasActiveListings: () => {
    return get().myListings.filter((listing) => listing.status === 'active').length > 0;
  },

  hasActiveBids: () => {
    return get().myBids.length > 0;
  },
}));

export default useMarketplaceStore;
