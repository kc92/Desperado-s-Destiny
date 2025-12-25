/**
 * Geography Controller
 * Handles API requests for world geography hierarchy
 */

import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import geographyService from '../services/geography.service';

/**
 * Get full geography tree
 * @route GET /api/geography/tree
 */
export async function getGeographyTree(req: Request, res: Response): Promise<void> {
  const tree = await geographyService.getGeographyTree();
  res.json({
    success: true,
    data: { tree },
  });
}

/**
 * Get all continents (summaries)
 * @route GET /api/geography/continents
 */
export async function getContinents(req: Request, res: Response): Promise<void> {
  const continents = await geographyService.getContinentSummaries();
  res.json({
    success: true,
    data: { continents },
  });
}

/**
 * Get continent details with regions
 * @route GET /api/geography/continents/:continentId
 */
export async function getContinentDetail(req: Request, res: Response): Promise<void> {
  const { continentId } = req.params;
  const continent = await geographyService.getContinentTree(continentId);

  if (!continent) {
    res.status(404).json({
      success: false,
      error: 'Continent not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { continent },
  });
}

/**
 * Get regions for a continent
 * @route GET /api/geography/continents/:continentId/regions
 */
export async function getRegionsForContinent(req: Request, res: Response): Promise<void> {
  const { continentId } = req.params;
  const regions = await geographyService.getRegionSummaries(continentId);
  res.json({
    success: true,
    data: { regions },
  });
}

/**
 * Get all regions (summaries)
 * @route GET /api/geography/regions
 */
export async function getRegions(req: Request, res: Response): Promise<void> {
  const regions = await geographyService.getRegionSummaries();
  res.json({
    success: true,
    data: { regions },
  });
}

/**
 * Get region details with zones
 * @route GET /api/geography/regions/:regionId
 */
export async function getRegionDetail(req: Request, res: Response): Promise<void> {
  const { regionId } = req.params;
  const region = await geographyService.getRegionById(regionId);

  if (!region) {
    res.status(404).json({
      success: false,
      error: 'Region not found',
    });
    return;
  }

  // Get zones for this region
  const zones = await geographyService.getZoneSummaries(regionId);

  res.json({
    success: true,
    data: {
      region: {
        id: region.id,
        name: region.name,
        icon: region.icon,
        description: region.description,
        category: region.category,
        primaryFaction: region.primaryFaction,
        dangerRange: region.dangerRange,
        position: region.position,
        isUnlocked: region.isUnlocked,
        zoneCount: zones.length,
        zones,
      },
    },
  });
}

/**
 * Get zones for a region
 * @route GET /api/geography/regions/:regionId/zones
 */
export async function getZonesForRegion(req: Request, res: Response): Promise<void> {
  const { regionId } = req.params;
  const zones = await geographyService.getZoneSummaries(regionId);
  res.json({
    success: true,
    data: { zones },
  });
}

/**
 * Get all zones (summaries)
 * @route GET /api/geography/zones
 */
export async function getZones(req: Request, res: Response): Promise<void> {
  const zones = await geographyService.getZoneSummaries();
  res.json({
    success: true,
    data: { zones },
  });
}

/**
 * Get zone details with locations
 * @route GET /api/geography/zones/:zoneId
 */
export async function getZoneDetail(req: Request, res: Response): Promise<void> {
  const { zoneId } = req.params;
  const zone = await geographyService.getWorldZoneById(zoneId);

  if (!zone) {
    res.status(404).json({
      success: false,
      error: 'Zone not found',
    });
    return;
  }

  // Get locations for this zone
  const locations = await geographyService.getLocationSummaries(zoneId);

  res.json({
    success: true,
    data: {
      zone: {
        id: zone.id,
        name: zone.name,
        icon: zone.icon,
        description: zone.description,
        theme: zone.theme,
        primaryFaction: zone.primaryFaction,
        dangerRange: zone.dangerRange,
        adjacentZones: zone.adjacentZones,
        isUnlocked: zone.isUnlocked,
        locationCount: locations.length,
        locations,
      },
    },
  });
}

/**
 * Get locations for a zone
 * @route GET /api/geography/zones/:zoneId/locations
 */
export async function getLocationsForZone(req: Request, res: Response): Promise<void> {
  const { zoneId } = req.params;
  const locations = await geographyService.getLocationSummaries(zoneId);
  res.json({
    success: true,
    data: { locations },
  });
}

/**
 * Check if a region is unlocked for the current character
 * @route GET /api/geography/regions/:regionId/unlocked
 */
export async function checkRegionUnlocked(req: AuthRequest, res: Response): Promise<void> {
  const { regionId } = req.params;

  if (!req.character) {
    res.status(401).json({
      success: false,
      error: 'Character required',
    });
    return;
  }

  const isUnlocked = await geographyService.isRegionUnlockedForCharacter(
    regionId,
    req.character.level
  );

  res.json({
    success: true,
    data: { isUnlocked },
  });
}

/**
 * Check if a zone is unlocked for the current character
 * @route GET /api/geography/zones/:zoneId/unlocked
 */
export async function checkZoneUnlocked(req: AuthRequest, res: Response): Promise<void> {
  const { zoneId } = req.params;

  if (!req.character) {
    res.status(401).json({
      success: false,
      error: 'Character required',
    });
    return;
  }

  const isUnlocked = await geographyService.isZoneUnlockedForCharacter(
    zoneId,
    req.character.level
  );

  res.json({
    success: true,
    data: { isUnlocked },
  });
}

export default {
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
};
