/**
 * Marketplace Routes
 *
 * Routes for the Frontier Exchange (player marketplace)
 */

import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  cancelListing,
  placeBid,
  buyNow,
  getMyListings,
  getMyBids,
  getPurchaseHistory,
  getSalesHistory,
  getPriceHistory,
  getSuggestedPrice,
  getMarketStats,
  getCategories,
  searchListings
} from '../controllers/marketplace.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { marketplaceRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate, MarketplaceSchemas } from '../validation';
import { preventTradingExploits, checkGoldDuplication } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// ==========================================
// PUBLIC ROUTES (no authentication required)
// ==========================================

/**
 * @route   GET /api/market/listings
 * @desc    Get marketplace listings with filters
 * @access  Public
 * @query   {string} category - Filter by category
 * @query   {string} subcategory - Filter by subcategory
 * @query   {string} listingType - Filter by listing type (auction/buyout/both)
 * @query   {string} rarity - Filter by item rarity
 * @query   {number} minPrice - Minimum price filter
 * @query   {number} maxPrice - Maximum price filter
 * @query   {string} search - Text search
 * @query   {boolean} featured - Featured listings only
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 20, max: 100)
 * @query   {string} sortBy - Sort field (listedAt, price, endingSoon, bids)
 * @query   {string} sortOrder - Sort order (asc/desc)
 */
router.get('/listings', asyncHandler(getListings));

/**
 * @route   GET /api/market/listings/:id
 * @desc    Get a single listing by ID
 * @access  Public
 * @param   {string} id - Listing ID
 */
router.get('/listings/:id', asyncHandler(getListingById));

/**
 * @route   GET /api/market/categories
 * @desc    Get all marketplace categories
 * @access  Public
 */
router.get('/categories', asyncHandler(getCategories));

/**
 * @route   GET /api/market/stats
 * @desc    Get marketplace statistics
 * @access  Public
 */
router.get('/stats', asyncHandler(getMarketStats));

/**
 * @route   GET /api/market/prices/:itemId
 * @desc    Get price history for an item
 * @access  Public
 * @param   {string} itemId - Item ID
 * @query   {number} days - Number of days of history (default: 30)
 */
router.get('/prices/:itemId', asyncHandler(getPriceHistory));

/**
 * @route   GET /api/market/suggest/:itemId
 * @desc    Get suggested price for an item
 * @access  Public
 * @param   {string} itemId - Item ID
 */
router.get('/suggest/:itemId', asyncHandler(getSuggestedPrice));

/**
 * @route   GET /api/market/search
 * @desc    Search marketplace listings
 * @access  Public
 * @query   {string} q - Search query (required, min 2 characters)
 * @query   {string} category - Filter by category
 * @query   {string} subcategory - Filter by subcategory
 * @query   {string} rarity - Filter by rarity
 */
router.get('/search', asyncHandler(searchListings));

// ==========================================
// PROTECTED ROUTES (authentication required)
// ==========================================
router.use(requireAuth);
router.use(requireCharacter);

/**
 * @route   POST /api/market/listings
 * @desc    Create a new marketplace listing
 * @access  Private
 * @body    {string} itemId - Item ID to list
 * @body    {number} quantity - Quantity to list (default: 1)
 * @body    {string} listingType - Type of listing (auction/buyout/both)
 * @body    {number} startingPrice - Starting/minimum price
 * @body    {number} buyoutPrice - Buyout price (required for buyout type)
 * @body    {number} durationHours - Listing duration in hours (1-168)
 * @body    {string} category - Item category
 * @body    {string} subcategory - Item subcategory (optional)
 * @body    {boolean} featured - Featured listing (costs extra gold)
 */
router.post('/listings', requireCsrfToken, marketplaceRateLimiter, preventTradingExploits(20), validate(MarketplaceSchemas.createListing), asyncHandler(createListing));

/**
 * @route   PUT /api/market/listings/:id
 * @desc    Update a marketplace listing
 * @access  Private (owner only)
 * @param   {string} id - Listing ID
 * @body    {number} buyoutPrice - New buyout price
 * @body    {boolean} featured - Make listing featured
 */
router.put('/listings/:id', requireCsrfToken, marketplaceRateLimiter, asyncHandler(updateListing));

/**
 * @route   DELETE /api/market/listings/:id
 * @desc    Cancel a marketplace listing
 * @access  Private (owner only, cannot cancel auctions with bids)
 * @param   {string} id - Listing ID
 */
router.delete('/listings/:id', requireCsrfToken, marketplaceRateLimiter, asyncHandler(cancelListing));

/**
 * @route   POST /api/market/listings/:id/bid
 * @desc    Place a bid on an auction
 * @access  Private
 * @param   {string} id - Listing ID
 * @body    {number} amount - Bid amount
 */
router.post('/listings/:id/bid', requireCsrfToken, marketplaceRateLimiter, preventTradingExploits(50), validate(MarketplaceSchemas.placeBid), asyncHandler(placeBid));

/**
 * @route   POST /api/market/listings/:id/buy
 * @desc    Buy now at buyout price
 * @access  Private
 * @param   {string} id - Listing ID
 */
router.post('/listings/:id/buy', requireCsrfToken, marketplaceRateLimiter, checkGoldDuplication(), asyncHandler(buyNow));

/**
 * @route   GET /api/market/my/listings
 * @desc    Get current player's listings
 * @access  Private
 * @query   {string} status - Filter by status (active/sold/expired/cancelled)
 */
router.get('/my/listings', asyncHandler(getMyListings));

/**
 * @route   GET /api/market/my/bids
 * @desc    Get current player's active bids
 * @access  Private
 */
router.get('/my/bids', asyncHandler(getMyBids));

/**
 * @route   GET /api/market/my/purchases
 * @desc    Get current player's purchase history
 * @access  Private
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 */
router.get('/my/purchases', asyncHandler(getPurchaseHistory));

/**
 * @route   GET /api/market/my/sales
 * @desc    Get current player's sales history
 * @access  Private
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 */
router.get('/my/sales', asyncHandler(getSalesHistory));

export default router;
