/**
 * Map Service
 * API client for world geography and map data
 */

import api from './api';
import { logger } from './logger.service';
import type {
  GeographyTree,
  ContinentSummary,
  ContinentWithRegions,
  RegionSummary,
  RegionWithZones,
  ZoneSummary,
  ZoneWithLocations,
  LocationSummary,
} from '@desperados/shared';

// =============================================================================
// RESPONSE TYPES
// =============================================================================

interface GeographyTreeResponse {
  success: boolean;
  data: {
    tree: GeographyTree;
  };
}

interface ContinentsResponse {
  success: boolean;
  data: {
    continents: ContinentSummary[];
  };
}

interface ContinentDetailResponse {
  success: boolean;
  data: {
    continent: ContinentWithRegions;
  };
}

interface RegionsResponse {
  success: boolean;
  data: {
    regions: RegionSummary[];
  };
}

interface RegionDetailResponse {
  success: boolean;
  data: {
    region: RegionWithZones;
  };
}

interface ZonesResponse {
  success: boolean;
  data: {
    zones: ZoneSummary[];
  };
}

interface ZoneDetailResponse {
  success: boolean;
  data: {
    zone: ZoneWithLocations;
  };
}

interface LocationsResponse {
  success: boolean;
  data: {
    locations: LocationSummary[];
  };
}

interface UnlockedResponse {
  success: boolean;
  data: {
    isUnlocked: boolean;
  };
}

// =============================================================================
// MAP SERVICE
// =============================================================================

export const mapService = {
  // ===== Geography Tree =====

  /**
   * Fetch full geography tree for map rendering
   * This is the primary method for getting all map data at once
   */
  async fetchGeographyTree(): Promise<GeographyTree> {
    try {
      const response = await api.get<GeographyTreeResponse>('/geography/tree');
      if (!response.data?.data?.tree) {
        throw new Error('Invalid geography tree response structure');
      }
      return response.data.data.tree;
    } catch (error) {
      logger.error('Failed to fetch geography tree', error as Error, {
        context: 'mapService.fetchGeographyTree',
      });
      throw error;
    }
  },

  // ===== Continents =====

  /**
   * Get all continent summaries
   */
  async getContinents(): Promise<ContinentSummary[]> {
    const response = await api.get<ContinentsResponse>('/geography/continents');
    return response.data.data.continents;
  },

  /**
   * Get continent details with all regions
   */
  async getContinentDetail(continentId: string): Promise<ContinentWithRegions> {
    const response = await api.get<ContinentDetailResponse>(
      `/geography/continents/${continentId}`
    );
    return response.data.data.continent;
  },

  /**
   * Get regions for a specific continent
   */
  async getRegionsForContinent(continentId: string): Promise<RegionSummary[]> {
    const response = await api.get<RegionsResponse>(
      `/geography/continents/${continentId}/regions`
    );
    return response.data.data.regions;
  },

  // ===== Regions =====

  /**
   * Get all region summaries
   */
  async getRegions(): Promise<RegionSummary[]> {
    const response = await api.get<RegionsResponse>('/geography/regions');
    return response.data.data.regions;
  },

  /**
   * Get region details with all zones
   */
  async getRegionDetail(regionId: string): Promise<RegionWithZones> {
    const response = await api.get<RegionDetailResponse>(
      `/geography/regions/${regionId}`
    );
    return response.data.data.region;
  },

  /**
   * Get zones for a specific region
   */
  async getZonesForRegion(regionId: string): Promise<ZoneSummary[]> {
    const response = await api.get<ZonesResponse>(
      `/geography/regions/${regionId}/zones`
    );
    return response.data.data.zones;
  },

  /**
   * Check if a region is unlocked for the current character
   */
  async checkRegionUnlocked(regionId: string): Promise<boolean> {
    const response = await api.get<UnlockedResponse>(
      `/geography/regions/${regionId}/unlocked`
    );
    return response.data.data.isUnlocked;
  },

  // ===== Zones =====

  /**
   * Get all zone summaries
   */
  async getZones(): Promise<ZoneSummary[]> {
    const response = await api.get<ZonesResponse>('/geography/zones');
    return response.data.data.zones;
  },

  /**
   * Get zone details with all locations
   */
  async getZoneDetail(zoneId: string): Promise<ZoneWithLocations> {
    const response = await api.get<ZoneDetailResponse>(
      `/geography/zones/${zoneId}`
    );
    return response.data.data.zone;
  },

  /**
   * Get locations for a specific zone
   */
  async getLocationsForZone(zoneId: string): Promise<LocationSummary[]> {
    const response = await api.get<LocationsResponse>(
      `/geography/zones/${zoneId}/locations`
    );
    return response.data.data.locations;
  },

  /**
   * Check if a zone is unlocked for the current character
   */
  async checkZoneUnlocked(zoneId: string): Promise<boolean> {
    const response = await api.get<UnlockedResponse>(
      `/geography/zones/${zoneId}/unlocked`
    );
    return response.data.data.isUnlocked;
  },

  // ===== Helper Methods =====

  /**
   * Find a location in the geography tree
   */
  findLocationInTree(tree: GeographyTree, locationId: string): LocationSummary | null {
    for (const continent of tree.continents) {
      for (const region of continent.regions) {
        for (const zone of region.zones) {
          const location = zone.locations.find((loc) => loc.id === locationId);
          if (location) return location;
        }
      }
    }
    return null;
  },

  /**
   * Get the breadcrumb path for a location
   * Returns: [continent, region, zone, location]
   */
  getBreadcrumbPath(
    tree: GeographyTree,
    locationId: string
  ): {
    continent: ContinentSummary | null;
    region: RegionSummary | null;
    zone: ZoneSummary | null;
    location: LocationSummary | null;
  } {
    for (const continent of tree.continents) {
      for (const region of continent.regions) {
        for (const zone of region.zones) {
          const location = zone.locations.find((loc) => loc.id === locationId);
          if (location) {
            return {
              continent: {
                id: continent.id,
                name: continent.name,
                icon: continent.icon,
                isUnlocked: continent.isUnlocked,
                regionCount: continent.regionCount,
              },
              region: {
                id: region.id,
                name: region.name,
                icon: region.icon,
                primaryFaction: region.primaryFaction,
                isUnlocked: region.isUnlocked,
                zoneCount: region.zoneCount,
              },
              zone: {
                id: zone.id,
                name: zone.name,
                icon: zone.icon,
                theme: zone.theme,
                primaryFaction: zone.primaryFaction,
                dangerRange: zone.dangerRange,
                isUnlocked: zone.isUnlocked,
                locationCount: zone.locationCount,
              },
              location,
            };
          }
        }
      }
    }
    return { continent: null, region: null, zone: null, location: null };
  },

  /**
   * Get zone by location ID
   */
  getZoneByLocation(tree: GeographyTree, locationId: string): ZoneSummary | null {
    const breadcrumb = this.getBreadcrumbPath(tree, locationId);
    return breadcrumb.zone;
  },

  /**
   * Get region by location ID
   */
  getRegionByLocation(tree: GeographyTree, locationId: string): RegionSummary | null {
    const breadcrumb = this.getBreadcrumbPath(tree, locationId);
    return breadcrumb.region;
  },

  /**
   * Get all locations within a continent
   */
  getLocationsInContinent(tree: GeographyTree, continentId: string): LocationSummary[] {
    const continent = tree.continents.find((c) => c.id === continentId);
    if (!continent) return [];

    const locations: LocationSummary[] = [];
    for (const region of continent.regions) {
      for (const zone of region.zones) {
        locations.push(...zone.locations);
      }
    }
    return locations;
  },

  /**
   * Get all unlocked zones in the tree
   */
  getUnlockedZones(tree: GeographyTree): ZoneSummary[] {
    const zones: ZoneSummary[] = [];
    for (const continent of tree.continents) {
      for (const region of continent.regions) {
        for (const zone of region.zones) {
          if (zone.isUnlocked) {
            zones.push({
              id: zone.id,
              name: zone.name,
              icon: zone.icon,
              theme: zone.theme,
              primaryFaction: zone.primaryFaction,
              dangerRange: zone.dangerRange,
              isUnlocked: zone.isUnlocked,
              locationCount: zone.locationCount,
            });
          }
        }
      }
    }
    return zones;
  },

  /**
   * Calculate total location count for a continent
   */
  getTotalLocationsInContinent(continent: ContinentWithRegions): number {
    let count = 0;
    for (const region of continent.regions) {
      for (const zone of region.zones) {
        count += zone.locations.length;
      }
    }
    return count;
  },
};

export default mapService;
