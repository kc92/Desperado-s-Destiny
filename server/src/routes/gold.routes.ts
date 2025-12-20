/**
 * Gold Routes
 *
 * API routes for gold economy system
 */

import express from 'express';
import { GoldController } from '../controllers/gold.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

/**
 * GET /api/gold/balance
 * Get current gold balance
 */
router.get('/balance', requireAuth, asyncHandler(GoldController.getBalance));

/**
 * GET /api/gold/history
 * Get transaction history (paginated)
 * Query params: limit (default 50), offset (default 0)
 */
router.get('/history', requireAuth, asyncHandler(GoldController.getHistory));

/**
 * GET /api/gold/statistics
 * Get gold statistics (total earned, spent, etc.)
 */
router.get('/statistics', requireAuth, asyncHandler(GoldController.getStatistics));

export default router;
