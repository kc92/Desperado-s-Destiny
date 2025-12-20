/**
 * Territory Control Routes
 *
 * API endpoints for gang territory control system
 */

import { Router } from 'express';
import {
  getZones,
  getZone,
  getGangTerritoryControl,
  recordInfluenceGain,
  contestZone,
  getTerritoryMap,
  getZoneStatistics,
} from '../controllers/territoryControl.controller';
import { requireAuth } from '../middleware/auth.middleware';
import asyncHandler from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * @route   GET /api/territory/zones
 * @desc    Get all territory zones
 * @access  Public
 */
router.get('/zones', asyncHandler(getZones));

/**
 * @route   GET /api/territory/zones/:zoneId
 * @desc    Get single zone details
 * @access  Public
 */
router.get('/zones/:zoneId', asyncHandler(getZone));

/**
 * @route   GET /api/territory/gang/:gangId
 * @desc    Get gang's territory control overview
 * @access  Public
 */
router.get('/gang/:gangId', asyncHandler(getGangTerritoryControl));

/**
 * @route   POST /api/territory/influence
 * @desc    Record influence gain from activity
 * @access  Private
 */
router.post('/influence', requireAuth, requireCsrfToken, asyncHandler(recordInfluenceGain));

/**
 * @route   POST /api/territory/contest/:zoneId
 * @desc    Contest a zone (declare intent to take it)
 * @access  Private
 */
router.post('/contest/:zoneId', requireAuth, requireCsrfToken, asyncHandler(contestZone));

/**
 * @route   GET /api/territory/map
 * @desc    Get territory map data
 * @access  Public
 */
router.get('/map', asyncHandler(getTerritoryMap));

/**
 * @route   GET /api/territory/statistics
 * @desc    Get zone statistics
 * @access  Public
 */
router.get('/statistics', asyncHandler(getZoneStatistics));

export default router;
