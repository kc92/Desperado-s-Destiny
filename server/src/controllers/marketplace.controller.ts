/**
 * Marketplace Controller
 *
 * Handles HTTP requests for the Frontier Exchange (player marketplace)
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  MarketplaceService,
  ListingFilters,
  ListingOptions,
  Pagination,
  MARKET_CATEGORIES
} from '../services/marketplace.service';
import { ListingType, MarketItemRarity } from '../models/MarketListing.model';

/**
 * Get marketplace listings with filters and pagination
 * GET /api/market/listings
 */
export const getListings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Build filters from query params
    const filters: ListingFilters = {};

    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.subcategory) filters.subcategory = req.query.subcategory as string;
    if (req.query.listingType) filters.listingType = req.query.listingType as ListingType;
    if (req.query.sellerId) filters.sellerId = req.query.sellerId as string;
    if (req.query.itemId) filters.itemId = req.query.itemId as string;
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.featured === 'true') filters.featured = true;

    if (req.query.rarity) {
      const rarityParam = req.query.rarity;
      if (Array.isArray(rarityParam)) {
        filters.rarity = rarityParam as MarketItemRarity[];
      } else {
        filters.rarity = rarityParam as MarketItemRarity;
      }
    }

    if (req.query.minPrice) filters.minPrice = parseInt(req.query.minPrice as string, 10);
    if (req.query.maxPrice) filters.maxPrice = parseInt(req.query.maxPrice as string, 10);

    // Build pagination from query params
    const pagination: Pagination = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 20,
      sortBy: req.query.sortBy as string || 'listedAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await MarketplaceService.getListings(filters, pagination);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Get a single listing by ID
 * GET /api/market/listings/:id
 */
export const getListingById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const listing = await MarketplaceService.getListingById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { listing }
    });
  }
);

/**
 * Create a new marketplace listing
 * POST /api/market/listings
 */
export const createListing = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const {
      itemId,
      quantity = 1,
      listingType = 'buyout',
      startingPrice,
      buyoutPrice,
      durationHours,
      category,
      subcategory,
      featured
    } = req.body;

    // Validate required fields
    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'itemId is required'
      });
    }

    if (!startingPrice || startingPrice < 1) {
      return res.status(400).json({
        success: false,
        error: 'startingPrice is required and must be at least 1'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'category is required'
      });
    }

    const itemData = {
      itemId,
      quantity: parseInt(quantity, 10) || 1
    };

    const options: ListingOptions = {
      listingType: listingType as ListingType,
      startingPrice: parseInt(startingPrice, 10),
      buyoutPrice: buyoutPrice ? parseInt(buyoutPrice, 10) : undefined,
      durationHours: durationHours ? parseInt(durationHours, 10) : undefined,
      category,
      subcategory,
      featured: featured === true || featured === 'true'
    };

    const listing = await MarketplaceService.createListing(characterId, itemData, options);

    res.status(201).json({
      success: true,
      message: `Listed ${listing.item.name} x${listing.item.quantity} on the marketplace`,
      data: { listing }
    });
  }
);

/**
 * Update a marketplace listing
 * PUT /api/market/listings/:id
 */
export const updateListing = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { id } = req.params;
    const { buyoutPrice, featured } = req.body;

    const updates: Partial<ListingOptions> = {};

    if (buyoutPrice !== undefined) {
      updates.buyoutPrice = parseInt(buyoutPrice, 10);
    }

    if (featured !== undefined) {
      updates.featured = featured === true || featured === 'true';
    }

    const listing = await MarketplaceService.updateListing(characterId, id, updates);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing }
    });
  }
);

/**
 * Cancel a marketplace listing
 * DELETE /api/market/listings/:id
 */
export const cancelListing = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { id } = req.params;

    await MarketplaceService.cancelListing(characterId, id);

    res.status(200).json({
      success: true,
      message: 'Listing cancelled. Item returned to inventory.'
    });
  }
);

/**
 * Place a bid on an auction
 * POST /api/market/listings/:id/bid
 */
export const placeBid = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'Bid amount is required and must be at least 1'
      });
    }

    const listing = await MarketplaceService.placeBid(
      characterId,
      id,
      parseInt(amount, 10)
    );

    res.status(200).json({
      success: true,
      message: `Bid of ${amount} gold placed successfully`,
      data: {
        listing,
        yourBid: parseInt(amount, 10),
        currentBid: listing.currentBid
      }
    });
  }
);

/**
 * Buy now - instant purchase at buyout price
 * POST /api/market/listings/:id/buy
 */
export const buyNow = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const { id } = req.params;

    const result = await MarketplaceService.buyNow(characterId, id);

    res.status(200).json({
      success: true,
      message: `Purchased ${result.listing.item.name} for ${result.totalPaid} gold`,
      data: {
        listing: result.listing,
        totalPaid: result.totalPaid,
        taxPaid: result.taxPaid,
        item: result.listing.item
      }
    });
  }
);

/**
 * Get current player's active listings
 * GET /api/market/my/listings
 */
export const getMyListings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();
    const status = req.query.status as string | undefined;

    const listings = await MarketplaceService.getMyListings(
      characterId,
      status as any
    );

    res.status(200).json({
      success: true,
      data: {
        listings,
        count: listings.length
      }
    });
  }
);

/**
 * Get current player's active bids
 * GET /api/market/my/bids
 */
export const getMyBids = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const listings = await MarketplaceService.getMyBids(characterId);

    res.status(200).json({
      success: true,
      data: {
        listings,
        count: listings.length
      }
    });
  }
);

/**
 * Get current player's purchase history
 * GET /api/market/my/purchases
 */
export const getPurchaseHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const pagination: Pagination = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 20
    };

    const result = await MarketplaceService.getPurchaseHistory(characterId, pagination);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Get current player's sales history
 * GET /api/market/my/sales
 */
export const getSalesHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const characterId = req.character!._id.toString();

    const pagination: Pagination = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 20
    };

    const result = await MarketplaceService.getSalesHistory(characterId, pagination);

    res.status(200).json({
      success: true,
      data: result
    });
  }
);

/**
 * Get price history for an item
 * GET /api/market/prices/:itemId
 */
export const getPriceHistory = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { itemId } = req.params;
    const days = parseInt(req.query.days as string, 10) || 30;

    const priceHistory = await MarketplaceService.getPriceHistory(itemId, days);

    if (!priceHistory) {
      return res.status(404).json({
        success: false,
        error: 'No price history found for this item'
      });
    }

    res.status(200).json({
      success: true,
      data: { priceHistory }
    });
  }
);

/**
 * Get price suggestion for an item
 * GET /api/market/suggest/:itemId
 */
export const getSuggestedPrice = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { itemId } = req.params;

    const suggestion = await MarketplaceService.getSuggestedPrice(itemId);

    res.status(200).json({
      success: true,
      data: { suggestion }
    });
  }
);

/**
 * Get market statistics
 * GET /api/market/stats
 */
export const getMarketStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await MarketplaceService.getMarketStats();

    res.status(200).json({
      success: true,
      data: { stats }
    });
  }
);

/**
 * Get market categories
 * GET /api/market/categories
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = MarketplaceService.getCategories();

    res.status(200).json({
      success: true,
      data: { categories }
    });
  }
);

/**
 * Search listings
 * GET /api/market/search
 */
export const searchListings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const filters: ListingFilters = {};
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.subcategory) filters.subcategory = req.query.subcategory as string;
    if (req.query.rarity) filters.rarity = req.query.rarity as MarketItemRarity;

    const listings = await MarketplaceService.searchListings(query, filters);

    res.status(200).json({
      success: true,
      data: {
        listings,
        count: listings.length,
        query
      }
    });
  }
);
