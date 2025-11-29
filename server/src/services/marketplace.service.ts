/**
 * Marketplace Service
 *
 * Handles all marketplace (Frontier Exchange) operations including:
 * - Listing creation, updates, and cancellation
 * - Bidding on auctions
 * - Buy now functionality
 * - Price history and statistics
 * - Transaction tax (5% gold sink)
 */

import mongoose from 'mongoose';
import {
  MarketListing,
  IMarketListing,
  MarketItemData,
  ListingType,
  ListingStatus,
  MarketItemRarity
} from '../models/MarketListing.model';
import { PriceHistory, IPriceHistory } from '../models/PriceHistory.model';
import { Character, ICharacter, InventoryItem } from '../models/Character.model';
import { Item, IItem } from '../models/Item.model';
import { GoldService, TransactionSource } from './gold.service';
import { NotificationService } from './notification.service';
import logger from '../utils/logger';

/**
 * Configuration constants
 */
const MARKETPLACE_CONFIG = {
  TAX_RATE: 0.05, // 5% transaction tax
  MIN_LISTING_DURATION_HOURS: 1,
  MAX_LISTING_DURATION_HOURS: 168, // 7 days
  DEFAULT_LISTING_DURATION_HOURS: 48,
  MIN_BID_INCREMENT_PERCENT: 0.05, // 5% minimum bid increment
  MAX_ACTIVE_LISTINGS_PER_PLAYER: 25,
  LISTING_FEE_PERCENT: 0.01, // 1% listing fee (optional, currently disabled)
  FEATURED_LISTING_COST: 100 // Cost to feature a listing
};

/**
 * Market categories definition
 */
export const MARKET_CATEGORIES = {
  weapons: {
    name: 'Weapons',
    subcategories: ['revolvers', 'rifles', 'shotguns', 'melee']
  },
  armor: {
    name: 'Armor',
    subcategories: ['hats', 'dusters', 'boots', 'accessories']
  },
  horses: {
    name: 'Horses',
    subcategories: ['common', 'rare', 'legendary']
  },
  crafting: {
    name: 'Crafting Materials',
    subcategories: ['ore', 'leather', 'cloth', 'components']
  },
  consumables: {
    name: 'Consumables',
    subcategories: ['food', 'medicine', 'ammunition']
  },
  recipes: {
    name: 'Recipes',
    subcategories: ['crafting_patterns']
  },
  cosmetics: {
    name: 'Cosmetics',
    subcategories: ['skins', 'effects']
  }
};

/**
 * Listing options for creating/updating listings
 */
export interface ListingOptions {
  listingType: ListingType;
  startingPrice: number;
  buyoutPrice?: number;
  durationHours?: number;
  category: string;
  subcategory?: string;
  featured?: boolean;
}

/**
 * Listing filters for searching
 */
export interface ListingFilters {
  category?: string;
  subcategory?: string;
  rarity?: MarketItemRarity | MarketItemRarity[];
  minPrice?: number;
  maxPrice?: number;
  listingType?: ListingType;
  sellerId?: string;
  itemId?: string;
  search?: string;
  featured?: boolean;
}

/**
 * Pagination options
 */
export interface Pagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated listings result
 */
export interface PaginatedListings {
  listings: IMarketListing[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  listing: IMarketListing;
  buyer: ICharacter;
  seller: ICharacter;
  totalPaid: number;
  sellerReceived: number;
  taxPaid: number;
}

/**
 * Price suggestion result
 */
export interface PriceSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  confidence: 'high' | 'medium' | 'low' | 'none';
  recentSales: number;
  activeListings: number;
}

/**
 * Market statistics
 */
export interface MarketStats {
  totalActiveListings: number;
  totalValueListed: number;
  salesLast24h: number;
  volumeLast24h: number;
  taxCollectedLast24h: number;
  topCategories: Array<{ category: string; count: number; volume: number }>;
  trendingItems: Array<{ itemId: string; name: string; priceChange: number }>;
}

/**
 * Marketplace Service
 */
export class MarketplaceService {
  // ==========================================
  // LISTING MANAGEMENT
  // ==========================================

  /**
   * Create a new marketplace listing
   */
  static async createListing(
    sellerId: string,
    itemData: { itemId: string; quantity: number },
    options: ListingOptions
  ): Promise<IMarketListing> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get seller character
      const seller = await Character.findById(sellerId).session(session);
      if (!seller) {
        throw new Error('Seller character not found');
      }

      // Check max listings
      const activeListingsCount = await MarketListing.countDocuments({
        sellerId: new mongoose.Types.ObjectId(sellerId),
        status: 'active'
      }).session(session);

      if (activeListingsCount >= MARKETPLACE_CONFIG.MAX_ACTIVE_LISTINGS_PER_PLAYER) {
        throw new Error(`Maximum active listings (${MARKETPLACE_CONFIG.MAX_ACTIVE_LISTINGS_PER_PLAYER}) reached`);
      }

      // Find item in inventory
      const inventoryIndex = seller.inventory.findIndex(
        inv => inv.itemId === itemData.itemId && inv.quantity >= itemData.quantity
      );

      if (inventoryIndex === -1) {
        throw new Error('Item not found in inventory or insufficient quantity');
      }

      // Get item details from master item collection
      const masterItem = await Item.findOne({ itemId: itemData.itemId }).session(session);
      if (!masterItem) {
        throw new Error('Item type not found in game database');
      }

      // Validate listing options
      this.validateListingOptions(options, masterItem);

      // Remove item from seller's inventory
      const inventoryItem = seller.inventory[inventoryIndex];
      if (inventoryItem.quantity === itemData.quantity) {
        seller.inventory.splice(inventoryIndex, 1);
      } else {
        inventoryItem.quantity -= itemData.quantity;
      }

      // Calculate expiration
      const durationHours = Math.min(
        Math.max(
          options.durationHours || MARKETPLACE_CONFIG.DEFAULT_LISTING_DURATION_HOURS,
          MARKETPLACE_CONFIG.MIN_LISTING_DURATION_HOURS
        ),
        MARKETPLACE_CONFIG.MAX_LISTING_DURATION_HOURS
      );
      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      // Build market item data
      const marketItem: MarketItemData = {
        itemId: itemData.itemId,
        name: masterItem.name,
        type: masterItem.type,
        rarity: masterItem.rarity as MarketItemRarity,
        quantity: itemData.quantity,
        description: masterItem.description,
        icon: masterItem.icon
      };

      // Create the listing
      const listing = new MarketListing({
        sellerId: seller._id,
        sellerName: seller.name,
        item: marketItem,
        listingType: options.listingType,
        startingPrice: options.startingPrice,
        buyoutPrice: options.buyoutPrice,
        currentBid: options.listingType !== 'buyout' ? 0 : undefined,
        category: options.category,
        subcategory: options.subcategory,
        status: 'active',
        listedAt: new Date(),
        expiresAt,
        featured: options.featured || false,
        bidHistory: [],
        reservedBids: new Map()
      });

      // Handle featured listing cost
      if (options.featured) {
        if (seller.gold < MARKETPLACE_CONFIG.FEATURED_LISTING_COST) {
          throw new Error(`Insufficient gold for featured listing (requires ${MARKETPLACE_CONFIG.FEATURED_LISTING_COST} gold)`);
        }
        await GoldService.deductGold(
          sellerId,
          MARKETPLACE_CONFIG.FEATURED_LISTING_COST,
          TransactionSource.MARKETPLACE_LISTING_FEE,
          { listingId: listing._id, type: 'featured' },
          session
        );
      }

      await seller.save({ session });
      await listing.save({ session });

      // Update price history (create if not exists)
      await PriceHistory.findOrCreateByItemId(
        itemData.itemId,
        masterItem.name,
        options.category,
        masterItem.rarity
      );

      // Update active listings count in price history
      await PriceHistory.updateOne(
        { itemId: itemData.itemId },
        { $inc: { activeListings: 1 }, lastUpdated: new Date() }
      ).session(session);

      await session.commitTransaction();

      logger.info(`Marketplace listing created: ${listing._id} by ${seller.name} for ${marketItem.name}`);

      return listing;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error creating marketplace listing:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get listings with filters and pagination
   */
  static async getListings(
    filters: ListingFilters,
    pagination: Pagination
  ): Promise<PaginatedListings> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status: 'active', expiresAt: { $gt: new Date() } };

    if (filters.category) query.category = filters.category;
    if (filters.subcategory) query.subcategory = filters.subcategory;
    if (filters.listingType) query.listingType = filters.listingType;
    if (filters.sellerId) query.sellerId = new mongoose.Types.ObjectId(filters.sellerId);
    if (filters.itemId) query['item.itemId'] = filters.itemId;
    if (filters.featured !== undefined) query.featured = filters.featured;

    if (filters.rarity) {
      if (Array.isArray(filters.rarity)) {
        query['item.rarity'] = { $in: filters.rarity };
      } else {
        query['item.rarity'] = filters.rarity;
      }
    }

    // Price filters based on listing type
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceConditions: any[] = [];

      // For buyout price
      if (filters.minPrice !== undefined) {
        priceConditions.push({
          $or: [
            { buyoutPrice: { $gte: filters.minPrice } },
            { startingPrice: { $gte: filters.minPrice } }
          ]
        });
      }
      if (filters.maxPrice !== undefined) {
        priceConditions.push({
          $or: [
            { buyoutPrice: { $lte: filters.maxPrice } },
            { startingPrice: { $lte: filters.maxPrice } }
          ]
        });
      }

      if (priceConditions.length > 0) {
        query.$and = priceConditions;
      }
    }

    // Text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Build sort
    const sortOptions: any = {};
    const sortBy = pagination.sortBy || 'listedAt';
    const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'price':
        sortOptions.buyoutPrice = sortOrder;
        sortOptions.startingPrice = sortOrder;
        break;
      case 'endingSoon':
        sortOptions.expiresAt = 1;
        break;
      case 'newest':
        sortOptions.listedAt = -1;
        break;
      case 'bids':
        sortOptions['bidHistory.length'] = sortOrder;
        break;
      default:
        sortOptions[sortBy] = sortOrder;
    }

    // Execute query
    const [listings, total] = await Promise.all([
      MarketListing.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean<IMarketListing[]>(),
      MarketListing.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      listings,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Get a single listing by ID
   */
  static async getListingById(listingId: string): Promise<IMarketListing | null> {
    return MarketListing.findById(listingId);
  }

  /**
   * Cancel a listing (return item to seller)
   */
  static async cancelListing(sellerId: string, listingId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const listing = await MarketListing.findById(listingId).session(session);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.sellerId.toString() !== sellerId) {
        throw new Error('You do not own this listing');
      }

      if (listing.status !== 'active') {
        throw new Error(`Cannot cancel listing with status: ${listing.status}`);
      }

      // Cannot cancel auction with bids
      if (listing.listingType !== 'buyout' && listing.currentBid && listing.currentBid > 0) {
        throw new Error('Cannot cancel auction with active bids');
      }

      // Return item to seller
      const seller = await Character.findById(sellerId).session(session);
      if (!seller) {
        throw new Error('Seller not found');
      }

      // Add item back to inventory
      const existingItem = seller.inventory.find(inv => inv.itemId === listing.item.itemId);
      if (existingItem) {
        existingItem.quantity += listing.item.quantity;
      } else {
        seller.inventory.push({
          itemId: listing.item.itemId,
          quantity: listing.item.quantity,
          acquiredAt: new Date()
        });
      }

      // Update listing status
      listing.status = 'cancelled';

      // Update price history
      await PriceHistory.updateOne(
        { itemId: listing.item.itemId },
        { $inc: { activeListings: -1 }, lastUpdated: new Date() }
      ).session(session);

      await seller.save({ session });
      await listing.save({ session });

      await session.commitTransaction();

      logger.info(`Marketplace listing cancelled: ${listingId} by ${seller.name}`);
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error cancelling marketplace listing:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Update a listing (limited updates allowed)
   */
  static async updateListing(
    sellerId: string,
    listingId: string,
    updates: Partial<ListingOptions>
  ): Promise<IMarketListing> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const listing = await MarketListing.findById(listingId).session(session);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.sellerId.toString() !== sellerId) {
        throw new Error('You do not own this listing');
      }

      if (listing.status !== 'active') {
        throw new Error(`Cannot update listing with status: ${listing.status}`);
      }

      // Cannot update auction with bids
      if (listing.listingType !== 'buyout' && listing.currentBid && listing.currentBid > 0) {
        throw new Error('Cannot update auction with active bids');
      }

      // Only allow certain updates
      if (updates.buyoutPrice !== undefined) {
        if (updates.buyoutPrice < listing.startingPrice) {
          throw new Error('Buyout price cannot be less than starting price');
        }
        listing.buyoutPrice = updates.buyoutPrice;
      }

      // Handle featuring update
      if (updates.featured && !listing.featured) {
        const seller = await Character.findById(sellerId).session(session);
        if (!seller || seller.gold < MARKETPLACE_CONFIG.FEATURED_LISTING_COST) {
          throw new Error(`Insufficient gold for featured listing (requires ${MARKETPLACE_CONFIG.FEATURED_LISTING_COST} gold)`);
        }
        await GoldService.deductGold(
          sellerId,
          MARKETPLACE_CONFIG.FEATURED_LISTING_COST,
          TransactionSource.MARKETPLACE_LISTING_FEE,
          { listingId: listing._id, type: 'featured_upgrade' },
          session
        );
        listing.featured = true;
      }

      await listing.save({ session });
      await session.commitTransaction();

      return listing;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error updating marketplace listing:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ==========================================
  // BUYING AND BIDDING
  // ==========================================

  /**
   * Place a bid on an auction
   */
  static async placeBid(
    bidderId: string,
    listingId: string,
    amount: number
  ): Promise<IMarketListing> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const listing = await MarketListing.findById(listingId).session(session);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'active') {
        throw new Error(`Cannot bid on listing with status: ${listing.status}`);
      }

      if (listing.expiresAt <= new Date()) {
        throw new Error('This listing has expired');
      }

      if (listing.listingType === 'buyout') {
        throw new Error('This is a buyout-only listing. Use buyNow instead.');
      }

      if (listing.sellerId.toString() === bidderId) {
        throw new Error('Cannot bid on your own listing');
      }

      // Calculate minimum bid
      const minBid = listing.currentBid
        ? Math.ceil(listing.currentBid * (1 + MARKETPLACE_CONFIG.MIN_BID_INCREMENT_PERCENT))
        : listing.startingPrice;

      if (amount < minBid) {
        throw new Error(`Bid must be at least ${minBid} gold (current: ${listing.currentBid || 0})`);
      }

      // If there's a buyout price and bid exceeds it, reject (they should use buyNow)
      if (listing.buyoutPrice && amount >= listing.buyoutPrice) {
        throw new Error(`Bid exceeds buyout price. Use buyNow at ${listing.buyoutPrice} gold instead.`);
      }

      // Get bidder
      const bidder = await Character.findById(bidderId).session(session);
      if (!bidder) {
        throw new Error('Bidder not found');
      }

      // Calculate how much additional gold needs to be reserved
      const previousBidReserve = listing.reservedBids.get(bidderId) || 0;
      const additionalReserve = amount - previousBidReserve;

      if (additionalReserve > 0) {
        if (bidder.gold < additionalReserve) {
          throw new Error(`Insufficient gold. Need ${additionalReserve} more gold to place this bid.`);
        }

        // Reserve the bid amount
        await GoldService.deductGold(
          bidderId,
          additionalReserve,
          TransactionSource.MARKETPLACE_BID_RESERVE,
          { listingId: listing._id, bidAmount: amount },
          session
        );
      }

      // Refund previous highest bidder (if different from current bidder)
      if (listing.currentBidderId &&
          listing.currentBidderId.toString() !== bidderId &&
          listing.currentBid) {
        const previousBidder = listing.currentBidderId.toString();
        const previousBidAmount = listing.reservedBids.get(previousBidder) || listing.currentBid;

        await GoldService.addGold(
          previousBidder,
          previousBidAmount,
          TransactionSource.MARKETPLACE_BID_REFUND,
          { listingId: listing._id, reason: 'outbid' },
          session
        );

        // Remove their reserve
        listing.reservedBids.delete(previousBidder);

        // Notify previous bidder
        await NotificationService.sendNotification(
          previousBidder,
          'outbid',
          `Someone placed a higher bid of ${amount} gold on ${listing.item.name}`,
          { listingId: listing._id.toString(), link: '/market/my/bids' }
        );
      }

      // Update listing
      listing.currentBid = amount;
      listing.currentBidderId = new mongoose.Types.ObjectId(bidderId);
      listing.currentBidderName = bidder.name;
      listing.reservedBids.set(bidderId, amount);

      // Add to bid history
      listing.bidHistory.push({
        bidderId: new mongoose.Types.ObjectId(bidderId),
        bidderName: bidder.name,
        amount,
        bidAt: new Date()
      });

      await listing.save({ session });
      await session.commitTransaction();

      logger.info(`Bid placed: ${amount} gold on listing ${listingId} by ${bidder.name}`);

      // Notify seller
      await NotificationService.sendNotification(
        listing.sellerId.toString(),
        'new_bid',
        `${bidder.name} bid ${amount} gold on your ${listing.item.name}`,
        { listingId: listing._id.toString(), link: '/market/my/listings' }
      );

      return listing;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error placing bid:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Buy now - instant purchase at buyout price
   */
  static async buyNow(buyerId: string, listingId: string): Promise<PurchaseResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const listing = await MarketListing.findById(listingId).session(session);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.status !== 'active') {
        throw new Error(`Cannot buy listing with status: ${listing.status}`);
      }

      if (listing.expiresAt <= new Date()) {
        throw new Error('This listing has expired');
      }

      if (listing.sellerId.toString() === buyerId) {
        throw new Error('Cannot buy your own listing');
      }

      // Determine purchase price
      let purchasePrice: number;
      if (listing.listingType === 'auction') {
        // For auction-only, must have bid and won
        throw new Error('This is an auction-only listing. Place a bid instead.');
      } else if (listing.buyoutPrice) {
        purchasePrice = listing.buyoutPrice;
      } else {
        throw new Error('This listing does not have a buyout price');
      }

      // Get buyer and seller
      const [buyer, seller] = await Promise.all([
        Character.findById(buyerId).session(session),
        Character.findById(listing.sellerId).session(session)
      ]);

      if (!buyer) throw new Error('Buyer not found');
      if (!seller) throw new Error('Seller not found');

      // Check buyer has enough gold
      if (buyer.gold < purchasePrice) {
        throw new Error(`Insufficient gold. Need ${purchasePrice} gold.`);
      }

      // Calculate tax
      const tax = Math.floor(purchasePrice * MARKETPLACE_CONFIG.TAX_RATE);
      const sellerReceives = purchasePrice - tax;

      // Transfer gold from buyer
      await GoldService.deductGold(
        buyerId,
        purchasePrice,
        TransactionSource.MARKETPLACE_PURCHASE,
        {
          listingId: listing._id,
          itemId: listing.item.itemId,
          itemName: listing.item.name,
          sellerId: listing.sellerId
        },
        session
      );

      // Give gold to seller (minus tax)
      await GoldService.addGold(
        listing.sellerId.toString(),
        sellerReceives,
        TransactionSource.MARKETPLACE_SALE,
        {
          listingId: listing._id,
          itemId: listing.item.itemId,
          itemName: listing.item.name,
          buyerId,
          taxPaid: tax
        },
        session
      );

      // Refund any existing bidders
      for (const [bidderId, reservedAmount] of listing.reservedBids.entries()) {
        if (bidderId !== buyerId) {
          await GoldService.addGold(
            bidderId,
            reservedAmount,
            TransactionSource.MARKETPLACE_BID_REFUND,
            { listingId: listing._id, reason: 'bought_out' },
            session
          );
        }
      }

      // Transfer item to buyer
      const existingItem = buyer.inventory.find(inv => inv.itemId === listing.item.itemId);
      if (existingItem) {
        existingItem.quantity += listing.item.quantity;
      } else {
        buyer.inventory.push({
          itemId: listing.item.itemId,
          quantity: listing.item.quantity,
          acquiredAt: new Date()
        });
      }

      // Update listing status
      listing.status = 'sold';
      listing.soldAt = new Date();
      listing.soldTo = new mongoose.Types.ObjectId(buyerId);
      listing.soldToName = buyer.name;
      listing.finalPrice = purchasePrice;
      listing.taxPaid = tax;

      // Save all changes
      await buyer.save({ session });
      await listing.save({ session });

      // Record sale in price history
      await PriceHistory.recordSale(
        listing.item.itemId,
        purchasePrice,
        listing.item.quantity,
        listing._id.toString(),
        listing.sellerId.toString(),
        buyerId
      );

      // Update active listings count
      await PriceHistory.updateOne(
        { itemId: listing.item.itemId },
        { $inc: { activeListings: -1 }, lastUpdated: new Date() }
      ).session(session);

      await session.commitTransaction();

      logger.info(`Marketplace sale: ${listing.item.name} sold for ${purchasePrice} gold (tax: ${tax})`);

      // Notify seller
      await NotificationService.sendNotification(
        listing.sellerId.toString(),
        'item_sold',
        `${buyer.name} bought your ${listing.item.name} for ${purchasePrice} gold. You received ${sellerReceives} gold after tax.`,
        { listingId: listing._id.toString(), link: '/market/my/sales' }
      );

      return {
        listing,
        buyer,
        seller,
        totalPaid: purchasePrice,
        sellerReceived: sellerReceives,
        taxPaid: tax
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error buying item:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ==========================================
  // PLAYER HISTORY
  // ==========================================

  /**
   * Get player's active listings
   */
  static async getMyListings(
    characterId: string,
    status?: ListingStatus
  ): Promise<IMarketListing[]> {
    const query: any = { sellerId: new mongoose.Types.ObjectId(characterId) };
    if (status) {
      query.status = status;
    }
    return MarketListing.find(query).sort({ listedAt: -1 });
  }

  /**
   * Get player's active bids
   */
  static async getMyBids(characterId: string): Promise<IMarketListing[]> {
    return MarketListing.find({
      status: 'active',
      'bidHistory.bidderId': new mongoose.Types.ObjectId(characterId),
      expiresAt: { $gt: new Date() }
    }).sort({ expiresAt: 1 });
  }

  /**
   * Get player's purchase history
   */
  static async getPurchaseHistory(
    characterId: string,
    pagination: Pagination
  ): Promise<PaginatedListings> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    const query = {
      status: 'sold',
      soldTo: new mongoose.Types.ObjectId(characterId)
    };

    const [listings, total] = await Promise.all([
      MarketListing.find(query)
        .sort({ soldAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IMarketListing[]>(),
      MarketListing.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      listings,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Get player's sales history
   */
  static async getSalesHistory(
    characterId: string,
    pagination: Pagination
  ): Promise<PaginatedListings> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    const query = {
      status: 'sold',
      sellerId: new mongoose.Types.ObjectId(characterId)
    };

    const [listings, total] = await Promise.all([
      MarketListing.find(query)
        .sort({ soldAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IMarketListing[]>(),
      MarketListing.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      listings,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  // ==========================================
  // PRICE DATA
  // ==========================================

  /**
   * Get price history for an item
   */
  static async getPriceHistory(itemId: string, days: number = 30): Promise<IPriceHistory | null> {
    const priceHistory = await PriceHistory.findOne({ itemId });
    if (!priceHistory) return null;

    // Filter snapshots to requested days
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    priceHistory.dailySnapshots = priceHistory.dailySnapshots.filter(
      s => s.date >= cutoff
    );

    return priceHistory;
  }

  /**
   * Get suggested price for an item
   */
  static async getSuggestedPrice(itemId: string): Promise<PriceSuggestion> {
    const priceHistory = await PriceHistory.findOne({ itemId });

    // Get current active listings for this item
    const activeListings = await MarketListing.countDocuments({
      status: 'active',
      'item.itemId': itemId,
      expiresAt: { $gt: new Date() }
    });

    if (!priceHistory || priceHistory.sales.length === 0) {
      // No sales data - check for master item price as fallback
      const masterItem = await Item.findOne({ itemId });
      const basePrice = masterItem?.price || 100;

      return {
        suggestedPrice: basePrice,
        minPrice: Math.floor(basePrice * 0.5),
        maxPrice: Math.ceil(basePrice * 2),
        averagePrice: basePrice,
        confidence: 'none',
        recentSales: 0,
        activeListings
      };
    }

    // Calculate confidence based on recent sales
    const day7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSales = priceHistory.sales.filter(s => s.date >= day7).length;

    let confidence: 'high' | 'medium' | 'low' | 'none';
    if (recentSales >= 10) confidence = 'high';
    else if (recentSales >= 5) confidence = 'medium';
    else if (recentSales >= 1) confidence = 'low';
    else confidence = 'none';

    return {
      suggestedPrice: Math.round(priceHistory.stats.averagePrice),
      minPrice: priceHistory.stats.minPrice,
      maxPrice: priceHistory.stats.maxPrice,
      averagePrice: priceHistory.stats.averagePrice,
      confidence,
      recentSales,
      activeListings
    };
  }

  /**
   * Get overall market statistics
   */
  static async getMarketStats(): Promise<MarketStats> {
    const day24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get active listings stats
    const [activeListingsData, salesData, categoryData] = await Promise.all([
      MarketListing.aggregate([
        {
          $match: {
            status: 'active',
            expiresAt: { $gt: new Date() }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalValue: {
              $sum: { $ifNull: ['$buyoutPrice', '$startingPrice'] }
            }
          }
        }
      ]),
      MarketListing.aggregate([
        {
          $match: {
            status: 'sold',
            soldAt: { $gte: day24h }
          }
        },
        {
          $group: {
            _id: null,
            salesCount: { $sum: 1 },
            totalVolume: { $sum: '$finalPrice' },
            totalTax: { $sum: '$taxPaid' }
          }
        }
      ]),
      MarketListing.aggregate([
        {
          $match: {
            status: 'active',
            expiresAt: { $gt: new Date() }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            volume: {
              $sum: { $ifNull: ['$buyoutPrice', '$startingPrice'] }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Get trending items
    const trendingItems = await PriceHistory.getTrendingItems(5);

    const activeStats = activeListingsData[0] || { count: 0, totalValue: 0 };
    const salesStats = salesData[0] || { salesCount: 0, totalVolume: 0, totalTax: 0 };

    return {
      totalActiveListings: activeStats.count,
      totalValueListed: activeStats.totalValue,
      salesLast24h: salesStats.salesCount,
      volumeLast24h: salesStats.totalVolume,
      taxCollectedLast24h: salesStats.totalTax,
      topCategories: categoryData.map(c => ({
        category: c._id,
        count: c.count,
        volume: c.volume
      })),
      trendingItems: trendingItems.map(t => ({
        itemId: t.itemId,
        name: t.itemName,
        priceChange: t.stats.priceChange24h
      }))
    };
  }

  /**
   * Get all categories
   */
  static getCategories(): typeof MARKET_CATEGORIES {
    return MARKET_CATEGORIES;
  }

  // ==========================================
  // AUCTION PROCESSING (FOR CRON JOBS)
  // ==========================================

  /**
   * Process all expired buyout-only listings
   */
  static async processExpiredListings(): Promise<number> {
    const session = await mongoose.startSession();
    let processedCount = 0;

    try {
      const expiredListings = await MarketListing.findExpiredListings();

      for (const listing of expiredListings) {
        session.startTransaction();

        try {
          // Return item to seller
          const seller = await Character.findById(listing.sellerId).session(session);
          if (seller) {
            const existingItem = seller.inventory.find(
              inv => inv.itemId === listing.item.itemId
            );
            if (existingItem) {
              existingItem.quantity += listing.item.quantity;
            } else {
              seller.inventory.push({
                itemId: listing.item.itemId,
                quantity: listing.item.quantity,
                acquiredAt: new Date()
              });
            }
            await seller.save({ session });

            // Notify seller
            await NotificationService.sendNotification(
              listing.sellerId.toString(),
              'listing_expired',
              `Your listing for ${listing.item.name} has expired. The item has been returned to your inventory.`,
              { listingId: listing._id.toString(), link: '/market/my/listings' }
            );
          }

          // Update listing status
          listing.status = 'expired';
          await listing.save({ session });

          // Update price history
          await PriceHistory.updateOne(
            { itemId: listing.item.itemId },
            { $inc: { activeListings: -1 }, lastUpdated: new Date() }
          ).session(session);

          await session.commitTransaction();
          processedCount++;

          logger.info(`Expired listing processed: ${listing._id}`);
        } catch (error) {
          await session.abortTransaction();
          logger.error(`Error processing expired listing ${listing._id}:`, error);
        }
      }
    } finally {
      session.endSession();
    }

    return processedCount;
  }

  /**
   * Process all ended auctions (award to highest bidder or return to seller)
   */
  static async processEndedAuctions(): Promise<number> {
    const session = await mongoose.startSession();
    let processedCount = 0;

    try {
      const endedAuctions = await MarketListing.findEndedAuctions();

      for (const listing of endedAuctions) {
        session.startTransaction();

        try {
          if (listing.currentBidderId && listing.currentBid && listing.currentBid > 0) {
            // Award to highest bidder
            await this.completeAuction(listing, session);
          } else {
            // No bids - return to seller
            await this.returnListingToSeller(listing, session);
          }

          await session.commitTransaction();
          processedCount++;
        } catch (error) {
          await session.abortTransaction();
          logger.error(`Error processing ended auction ${listing._id}:`, error);
        }
      }
    } finally {
      session.endSession();
    }

    return processedCount;
  }

  /**
   * Complete an auction - award item to winner
   */
  private static async completeAuction(
    listing: IMarketListing,
    session: mongoose.ClientSession
  ): Promise<void> {
    const winnerId = listing.currentBidderId!.toString();
    const winningBid = listing.currentBid!;

    // Get winner and seller
    const [winner, seller] = await Promise.all([
      Character.findById(winnerId).session(session),
      Character.findById(listing.sellerId).session(session)
    ]);

    if (!winner || !seller) {
      throw new Error('Winner or seller not found');
    }

    // Calculate tax
    const tax = Math.floor(winningBid * MARKETPLACE_CONFIG.TAX_RATE);
    const sellerReceives = winningBid - tax;

    // The bid amount is already reserved, so convert it to a sale
    // Refund any excess if they bid multiple times
    const reservedAmount = listing.reservedBids.get(winnerId) || winningBid;
    if (reservedAmount > winningBid) {
      await GoldService.addGold(
        winnerId,
        reservedAmount - winningBid,
        TransactionSource.MARKETPLACE_BID_REFUND,
        { listingId: listing._id, reason: 'excess_refund' },
        session
      );
    }

    // Give gold to seller
    await GoldService.addGold(
      listing.sellerId.toString(),
      sellerReceives,
      TransactionSource.MARKETPLACE_AUCTION_WIN,
      {
        listingId: listing._id,
        itemId: listing.item.itemId,
        itemName: listing.item.name,
        buyerId: winnerId,
        taxPaid: tax
      },
      session
    );

    // Refund other bidders
    for (const [bidderId, reservedAmount] of listing.reservedBids.entries()) {
      if (bidderId !== winnerId) {
        await GoldService.addGold(
          bidderId,
          reservedAmount,
          TransactionSource.MARKETPLACE_BID_REFUND,
          { listingId: listing._id, reason: 'auction_ended' },
          session
        );
      }
    }

    // Transfer item to winner
    const existingItem = winner.inventory.find(inv => inv.itemId === listing.item.itemId);
    if (existingItem) {
      existingItem.quantity += listing.item.quantity;
    } else {
      winner.inventory.push({
        itemId: listing.item.itemId,
        quantity: listing.item.quantity,
        acquiredAt: new Date()
      });
    }

    // Update listing
    listing.status = 'sold';
    listing.soldAt = new Date();
    listing.soldTo = new mongoose.Types.ObjectId(winnerId);
    listing.soldToName = winner.name;
    listing.finalPrice = winningBid;
    listing.taxPaid = tax;

    await winner.save({ session });
    await listing.save({ session });

    // Record sale
    await PriceHistory.recordSale(
      listing.item.itemId,
      winningBid,
      listing.item.quantity,
      listing._id.toString(),
      listing.sellerId.toString(),
      winnerId
    );

    // Update active listings count
    await PriceHistory.updateOne(
      { itemId: listing.item.itemId },
      { $inc: { activeListings: -1 }, lastUpdated: new Date() }
    ).session(session);

    logger.info(`Auction completed: ${listing._id} won by ${winner.name} for ${winningBid} gold`);

    // Notify winner
    await NotificationService.sendNotification(
      winnerId,
      'auction_won',
      `You won the auction for ${listing.item.name} with a bid of ${winningBid} gold.`,
      { listingId: listing._id.toString(), link: '/market/my/purchases' }
    );

    // Notify seller
    await NotificationService.sendNotification(
      listing.sellerId.toString(),
      'auction_sold',
      `${winner.name} won your auction for ${listing.item.name} at ${winningBid} gold. You received ${sellerReceives} gold after tax.`,
      { listingId: listing._id.toString(), link: '/market/my/sales' }
    );
  }

  /**
   * Return listing to seller (no bids)
   */
  private static async returnListingToSeller(
    listing: IMarketListing,
    session: mongoose.ClientSession
  ): Promise<void> {
    const seller = await Character.findById(listing.sellerId).session(session);
    if (!seller) {
      throw new Error('Seller not found');
    }

    // Return item
    const existingItem = seller.inventory.find(inv => inv.itemId === listing.item.itemId);
    if (existingItem) {
      existingItem.quantity += listing.item.quantity;
    } else {
      seller.inventory.push({
        itemId: listing.item.itemId,
        quantity: listing.item.quantity,
        acquiredAt: new Date()
      });
    }

    // Update listing
    listing.status = 'expired';

    await seller.save({ session });
    await listing.save({ session });

    // Update price history
    await PriceHistory.updateOne(
      { itemId: listing.item.itemId },
      { $inc: { activeListings: -1 }, lastUpdated: new Date() }
    ).session(session);

    logger.info(`Auction expired with no bids: ${listing._id}`);

    // Notify seller
    await NotificationService.sendNotification(
      listing.sellerId.toString(),
      'auction_expired',
      `Your auction for ${listing.item.name} ended with no bids. The item has been returned to your inventory.`,
      { listingId: listing._id.toString(), link: '/market/my/listings' }
    );
  }

  /**
   * Search listings with text search
   */
  static async searchListings(
    query: string,
    filters: ListingFilters
  ): Promise<IMarketListing[]> {
    const searchQuery: any = {
      status: 'active',
      expiresAt: { $gt: new Date() },
      $text: { $search: query }
    };

    if (filters.category) searchQuery.category = filters.category;
    if (filters.subcategory) searchQuery.subcategory = filters.subcategory;
    if (filters.rarity) searchQuery['item.rarity'] = filters.rarity;

    return MarketListing.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Validate listing options
   */
  private static validateListingOptions(options: ListingOptions, item: IItem): void {
    // Validate category
    const validCategories = Object.keys(MARKET_CATEGORIES);
    if (!validCategories.includes(options.category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate subcategory if provided
    if (options.subcategory) {
      const categoryConfig = MARKET_CATEGORIES[options.category as keyof typeof MARKET_CATEGORIES];
      if (!categoryConfig.subcategories.includes(options.subcategory)) {
        throw new Error(`Invalid subcategory for ${options.category}`);
      }
    }

    // Validate listing type
    if (!['auction', 'buyout', 'both'].includes(options.listingType)) {
      throw new Error('Invalid listing type');
    }

    // Validate prices
    if (options.startingPrice < 1) {
      throw new Error('Starting price must be at least 1 gold');
    }

    if (options.listingType === 'buyout' && !options.buyoutPrice) {
      throw new Error('Buyout-only listings require a buyout price');
    }

    if (options.buyoutPrice && options.buyoutPrice < options.startingPrice) {
      throw new Error('Buyout price must be greater than or equal to starting price');
    }
  }

  /**
   * Clean up old expired/sold listings (maintenance)
   */
  static async cleanupOldListings(daysOld: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    const result = await MarketListing.deleteMany({
      status: { $in: ['sold', 'expired', 'cancelled'] },
      updatedAt: { $lt: cutoff }
    });

    logger.info(`Cleaned up ${result.deletedCount} old marketplace listings`);

    return result.deletedCount;
  }
}
