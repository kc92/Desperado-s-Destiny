/**
 * Currency Routes
 *
 * API routes for the currency system:
 * - Dollars (primary currency)
 * - Gold Resource (valuable material)
 * - Silver Resource (common material)
 * - Exchange operations
 */

import express from 'express';
import { CurrencyController } from '../controllers/currency.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// =============================================================================
// BALANCE ENDPOINTS
// =============================================================================

/**
 * GET /api/currency/balance
 * Get all currency balances (dollars, gold resource, silver resource)
 */
router.get('/balance', requireAuth, asyncHandler(CurrencyController.getBalance));

/**
 * GET /api/currency/resources/:type
 * Get specific resource balance (gold or silver)
 */
router.get('/resources/:type', requireAuth, asyncHandler(CurrencyController.getResourceBalance));

// =============================================================================
// HISTORY ENDPOINTS
// =============================================================================

/**
 * GET /api/currency/history
 * Get transaction history (paginated)
 * Query params: limit (default 50), offset (default 0), type (optional: DOLLAR, GOLD_RESOURCE, SILVER_RESOURCE)
 */
router.get('/history', requireAuth, asyncHandler(CurrencyController.getHistory));

/**
 * GET /api/currency/resources/:type/history
 * Get resource-specific transaction history
 * Query params: limit (default 50), offset (default 0)
 */
router.get('/resources/:type/history', requireAuth, asyncHandler(CurrencyController.getResourceHistory));

// =============================================================================
// STATISTICS ENDPOINTS
// =============================================================================

/**
 * GET /api/currency/statistics
 * Get detailed statistics about all currencies
 */
router.get('/statistics', requireAuth, asyncHandler(CurrencyController.getStatistics));

// =============================================================================
// EXCHANGE ENDPOINTS
// =============================================================================

/**
 * GET /api/currency/rates
 * Get current exchange rates for gold and silver resources
 */
router.get('/rates', requireAuth, asyncHandler(CurrencyController.getExchangeRates));

/**
 * GET /api/currency/rates/history
 * Get price history for a resource type
 * Query params: type ('gold' | 'silver'), days (default 7, max 30)
 */
router.get('/rates/history', requireAuth, asyncHandler(CurrencyController.getPriceHistory));

/**
 * POST /api/currency/exchange/sell
 * Sell resource (gold/silver) for dollars
 * Body: { type: 'gold' | 'silver', amount: number }
 */
router.post('/exchange/sell', requireAuth, asyncHandler(CurrencyController.sellResource));

/**
 * POST /api/currency/exchange/buy
 * Buy resource (gold/silver) with dollars
 * Body: { type: 'gold' | 'silver', amount: number }
 */
router.post('/exchange/buy', requireAuth, asyncHandler(CurrencyController.buyResource));

export default router;
