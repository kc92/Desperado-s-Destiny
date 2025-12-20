/**
 * Marketplace Service
 * API client for the Frontier Exchange (player marketplace)
 */

import api from './api';

// ===== Types =====

export type ListingType = 'auction' | 'buyout' | 'both';
export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type SortField = 'listedAt' | 'price' | 'endingSoon' | 'bids';
export type SortOrder = 'asc' | 'desc';

export interface MarketplaceItem {
  itemId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  rarity: ItemRarity;
  stackable: boolean;
  iconUrl?: string;
}

export interface Bid {
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

export interface Listing {
  _id: string;
  sellerId: string;
  sellerName: string;
  item: MarketplaceItem;
  quantity: number;
  listingType: ListingType;
  startingPrice: number;
  currentPrice: number;
  buyoutPrice?: number;
  bids: Bid[];
  bidCount: number;
  status: ListingStatus;
  featured: boolean;
  listedAt: string;
  expiresAt: string;
  soldAt?: string;
  soldTo?: {
    characterId: string;
    characterName: string;
  };
  finalPrice?: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  subcategories: Array<{
    id: string;
    name: string;
  }>;
  itemCount: number;
}

export interface PriceHistoryEntry {
  date: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
}

export interface SuggestedPrice {
  itemId: string;
  itemName: string;
  suggestedPrice: number;
  minRecentPrice: number;
  maxRecentPrice: number;
  averageRecentPrice: number;
  confidence: number;
  basis: string;
}

export interface MarketStats {
  totalListings: number;
  totalActiveListings: number;
  totalSalesVolume: number;
  totalSalesValue: number;
  averageListingPrice: number;
  topCategories: Array<{
    category: string;
    listingCount: number;
    salesVolume: number;
  }>;
  recentTrends: {
    listingsCreated24h: number;
    salesCompleted24h: number;
    priceDirection: 'up' | 'down' | 'stable';
  };
}

export interface MyBid {
  listingId: string;
  listing: Listing;
  myBidAmount: number;
  myBidTime: string;
  isWinning: boolean;
  outbidAmount?: number;
}

export interface TransactionHistoryEntry {
  _id: string;
  listingId: string;
  item: MarketplaceItem;
  quantity: number;
  price: number;
  type: 'purchase' | 'sale';
  otherParty: {
    characterId: string;
    characterName: string;
  };
  timestamp: string;
  listingType: ListingType;
  wasAuction: boolean;
}

// ===== Request/Response Types =====

export interface ListingsFilter {
  category?: string;
  subcategory?: string;
  listingType?: ListingType;
  rarity?: ItemRarity;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface ListingsResponse {
  listings: Listing[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateListingRequest {
  itemId: string;
  quantity?: number;
  listingType: ListingType;
  startingPrice: number;
  buyoutPrice?: number;
  durationHours: number;
  category: string;
  subcategory?: string;
  featured?: boolean;
}

export interface CreateListingResponse {
  success: boolean;
  listing: Listing;
  listingFee: number;
  message: string;
}

export interface UpdateListingRequest {
  buyoutPrice?: number;
  featured?: boolean;
}

export interface UpdateListingResponse {
  success: boolean;
  listing: Listing;
  message: string;
}

export interface CancelListingResponse {
  success: boolean;
  refundedItem: boolean;
  message: string;
}

export interface PlaceBidRequest {
  amount: number;
}

export interface PlaceBidResponse {
  success: boolean;
  listing: Listing;
  myBid: Bid;
  previousBidRefunded?: number;
  message: string;
}

export interface BuyNowResponse {
  success: boolean;
  listing: Listing;
  totalPaid: number;
  item: MarketplaceItem;
  quantity: number;
  message: string;
}

export interface SearchRequest {
  q: string;
  category?: string;
  subcategory?: string;
  rarity?: ItemRarity;
}

// ===== Marketplace Service =====

export const marketplaceService = {
  // ===== Public Routes =====

  /**
   * Get marketplace listings with filters
   */
  async getListings(filters?: ListingsFilter): Promise<ListingsResponse> {
    const response = await api.get<{ data: ListingsResponse }>('/market/listings', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get a single listing by ID
   */
  async getListingById(listingId: string): Promise<Listing> {
    const response = await api.get<{ data: Listing }>(`/market/listings/${listingId}`);
    return response.data.data;
  },

  /**
   * Get all marketplace categories
   */
  async getCategories(): Promise<MarketplaceCategory[]> {
    const response = await api.get<{ data: { categories: MarketplaceCategory[] } }>(
      '/market/categories'
    );
    return response.data.data?.categories || [];
  },

  /**
   * Get marketplace statistics
   */
  async getMarketStats(): Promise<MarketStats> {
    const response = await api.get<{ data: MarketStats }>('/market/stats');
    return response.data.data;
  },

  /**
   * Get price history for an item
   */
  async getPriceHistory(itemId: string, days?: number): Promise<PriceHistoryEntry[]> {
    const response = await api.get<{ data: { history: PriceHistoryEntry[] } }>(
      `/market/prices/${itemId}`,
      { params: days ? { days } : {} }
    );
    return response.data.data?.history || [];
  },

  /**
   * Get suggested price for an item
   */
  async getSuggestedPrice(itemId: string): Promise<SuggestedPrice> {
    const response = await api.get<{ data: SuggestedPrice }>(`/market/suggest/${itemId}`);
    return response.data.data;
  },

  /**
   * Search marketplace listings
   */
  async searchListings(query: string, filters?: Omit<SearchRequest, 'q'>): Promise<Listing[]> {
    const response = await api.get<{ data: { listings: Listing[] } }>('/market/search', {
      params: { q: query, ...filters },
    });
    return response.data.data?.listings || [];
  },

  // ===== Authenticated Routes =====

  /**
   * Create a new marketplace listing
   */
  async createListing(request: CreateListingRequest): Promise<CreateListingResponse> {
    const response = await api.post<{ data: CreateListingResponse }>('/market/listings', request);
    return response.data.data;
  },

  /**
   * Update a marketplace listing
   */
  async updateListing(
    listingId: string,
    updates: UpdateListingRequest
  ): Promise<UpdateListingResponse> {
    const response = await api.put<{ data: UpdateListingResponse }>(
      `/market/listings/${listingId}`,
      updates
    );
    return response.data.data;
  },

  /**
   * Cancel a marketplace listing
   */
  async cancelListing(listingId: string): Promise<CancelListingResponse> {
    const response = await api.delete<{ data: CancelListingResponse }>(
      `/market/listings/${listingId}`
    );
    return response.data.data;
  },

  /**
   * Place a bid on an auction
   */
  async placeBid(listingId: string, amount: number): Promise<PlaceBidResponse> {
    const response = await api.post<{ data: PlaceBidResponse }>(
      `/market/listings/${listingId}/bid`,
      { amount }
    );
    return response.data.data;
  },

  /**
   * Buy now at buyout price
   */
  async buyNow(listingId: string): Promise<BuyNowResponse> {
    const response = await api.post<{ data: BuyNowResponse }>(`/market/listings/${listingId}/buy`);
    return response.data.data;
  },

  /**
   * Get current player's listings
   */
  async getMyListings(status?: ListingStatus): Promise<Listing[]> {
    const response = await api.get<{ data: { listings: Listing[] } }>('/market/my/listings', {
      params: status ? { status } : {},
    });
    return response.data.data?.listings || [];
  },

  /**
   * Get current player's active bids
   */
  async getMyBids(): Promise<MyBid[]> {
    const response = await api.get<{ data: { bids: MyBid[] } }>('/market/my/bids');
    return response.data.data?.bids || [];
  },

  /**
   * Get current player's purchase history
   */
  async getPurchaseHistory(page?: number, limit?: number): Promise<{
    purchases: TransactionHistoryEntry[];
    pagination: ListingsResponse['pagination'];
  }> {
    const response = await api.get<{
      data: {
        purchases: TransactionHistoryEntry[];
        pagination: ListingsResponse['pagination'];
      };
    }>('/market/my/purchases', { params: { page, limit } });
    return response.data.data;
  },

  /**
   * Get current player's sales history
   */
  async getSalesHistory(page?: number, limit?: number): Promise<{
    sales: TransactionHistoryEntry[];
    pagination: ListingsResponse['pagination'];
  }> {
    const response = await api.get<{
      data: {
        sales: TransactionHistoryEntry[];
        pagination: ListingsResponse['pagination'];
      };
    }>('/market/my/sales', { params: { page, limit } });
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Get active auction listings ending soon
   */
  async getEndingSoon(limit?: number): Promise<Listing[]> {
    const response = await this.getListings({
      listingType: 'auction',
      sortBy: 'endingSoon',
      sortOrder: 'asc',
      limit: limit || 20,
    });
    return response.listings;
  },

  /**
   * Get featured listings
   */
  async getFeaturedListings(): Promise<Listing[]> {
    const response = await this.getListings({
      featured: true,
      sortBy: 'listedAt',
      sortOrder: 'desc',
    });
    return response.listings;
  },

  /**
   * Get listings by category
   */
  async getListingsByCategory(category: string, subcategory?: string): Promise<ListingsResponse> {
    return this.getListings({ category, subcategory });
  },

  /**
   * Get my active listings
   */
  async getMyActiveListings(): Promise<Listing[]> {
    return this.getMyListings('active');
  },

  /**
   * Get my sold listings
   */
  async getMySoldListings(): Promise<Listing[]> {
    return this.getMyListings('sold');
  },
};

export default marketplaceService;
