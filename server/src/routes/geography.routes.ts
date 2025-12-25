/**
 * Geography Routes
 * API routes for world geography hierarchy: Continent > Region > Zone > Location
 */

import { Router } from 'express';
import {
  getGeographyTree,
  getContinents,
  getContinentDetail,
  getRegionsForContinent,
  getRegions,
  getRegionDetail,
  getZonesForRegion,
  getZones,
  getZoneDetail,
  getLocationsForZone,
  checkRegionUnlocked,
  checkZoneUnlocked,
} from '../controllers/geography.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCharacter } from '../middleware';

const router = Router();

// =============================================================================
// GEOGRAPHY TREE (Full Hierarchy)
// =============================================================================

/**
 * @route   GET /api/geography/tree
 * @desc    Get full geography tree for map rendering
 * @access  Public
 */
router.get('/tree', asyncHandler(getGeographyTree));

// =============================================================================
// CONTINENTS
// =============================================================================

/**
 * @route   GET /api/geography/continents
 * @desc    Get all continent summaries
 * @access  Public
 */
router.get('/continents', asyncHandler(getContinents));

/**
 * @route   GET /api/geography/continents/:continentId
 * @desc    Get continent details with all regions
 * @access  Public
 */
router.get('/continents/:continentId', asyncHandler(getContinentDetail));

/**
 * @route   GET /api/geography/continents/:continentId/regions
 * @desc    Get regions within a continent
 * @access  Public
 */
router.get('/continents/:continentId/regions', asyncHandler(getRegionsForContinent));

// =============================================================================
// REGIONS
// =============================================================================

/**
 * @route   GET /api/geography/regions
 * @desc    Get all region summaries
 * @access  Public
 */
router.get('/regions', asyncHandler(getRegions));

/**
 * @route   GET /api/geography/regions/:regionId
 * @desc    Get region details with all zones
 * @access  Public
 */
router.get('/regions/:regionId', asyncHandler(getRegionDetail));

/**
 * @route   GET /api/geography/regions/:regionId/zones
 * @desc    Get zones within a region
 * @access  Public
 */
router.get('/regions/:regionId/zones', asyncHandler(getZonesForRegion));

/**
 * @route   GET /api/geography/regions/:regionId/unlocked
 * @desc    Check if region is unlocked for current character
 * @access  Protected (requires character)
 */
router.get('/regions/:regionId/unlocked', requireCharacter, asyncHandler(checkRegionUnlocked));

// =============================================================================
// ZONES
// =============================================================================

/**
 * @route   GET /api/geography/zones
 * @desc    Get all zone summaries
 * @access  Public
 */
router.get('/zones', asyncHandler(getZones));

/**
 * @route   GET /api/geography/zones/:zoneId
 * @desc    Get zone details with all locations
 * @access  Public
 */
router.get('/zones/:zoneId', asyncHandler(getZoneDetail));

/**
 * @route   GET /api/geography/zones/:zoneId/locations
 * @desc    Get locations within a zone
 * @access  Public
 */
router.get('/zones/:zoneId/locations', asyncHandler(getLocationsForZone));

/**
 * @route   GET /api/geography/zones/:zoneId/unlocked
 * @desc    Check if zone is unlocked for current character
 * @access  Protected (requires character)
 */
router.get('/zones/:zoneId/unlocked', requireCharacter, asyncHandler(checkZoneUnlocked));

export default router;
