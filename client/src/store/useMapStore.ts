/**
 * Map Store
 * Zustand store for managing world map state and navigation
 */

import { create } from 'zustand';
import { mapService } from '@/services/map.service';
import { logger } from '@/services/logger.service';
import type {
  GeographyTree,
  ContinentSummary,
  RegionSummary,
  ZoneSummary,
  LocationSummary,
} from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Map zoom levels
 */
export type MapZoomLevel = 'continental' | 'regional' | 'local';

/**
 * Map overlay types for visualization
 */
export type MapOverlay = 'danger' | 'faction' | 'territory' | 'economy';

/**
 * Map interaction modes
 */
export type MapMode = 'navigation' | 'territory' | 'economy';

/**
 * Breadcrumb path for current location
 */
export interface MapBreadcrumb {
  continent: ContinentSummary | null;
  region: RegionSummary | null;
  zone: ZoneSummary | null;
  location: LocationSummary | null;
}

/**
 * Map store state interface
 */
interface MapState {
  // Geography data
  geographyTree: GeographyTree | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Current view state
  currentZoom: MapZoomLevel;
  focusedContinentId: string | null;
  focusedRegionId: string | null;
  focusedZoneId: string | null;
  focusedLocationId: string | null;

  // Player position (from character store)
  playerLocationId: string | null;

  // Discovery state (tracked per character)
  discoveredLocations: Set<string>;

  // UI state
  activeOverlays: MapOverlay[];
  mapMode: MapMode;
  isMinimapExpanded: boolean;
  showMapPanel: boolean;

  // Computed breadcrumb
  breadcrumb: MapBreadcrumb;

  // Actions
  fetchGeographyTree: () => Promise<void>;
  refreshGeographyTree: () => Promise<void>;

  // Navigation actions
  setZoom: (zoom: MapZoomLevel) => void;
  focusContinent: (continentId: string | null) => void;
  focusRegion: (regionId: string | null) => void;
  focusZone: (zoneId: string | null) => void;
  focusLocation: (locationId: string | null) => void;

  // Navigate to a specific location (updates zoom and all focus states)
  navigateToLocation: (locationId: string) => void;

  // Sync player position from character store
  setPlayerLocation: (locationId: string | null) => void;

  // Discovery management
  addDiscoveredLocation: (locationId: string) => void;
  setDiscoveredLocations: (locationIds: string[]) => void;
  isLocationDiscovered: (locationId: string) => boolean;

  // Overlay toggles
  toggleOverlay: (overlay: MapOverlay) => void;
  setOverlays: (overlays: MapOverlay[]) => void;

  // Mode toggles
  setMapMode: (mode: MapMode) => void;
  toggleMinimap: () => void;
  toggleMapPanel: () => void;

  // Utility getters
  getCurrentContinent: () => ContinentSummary | null;
  getCurrentRegion: () => RegionSummary | null;
  getCurrentZone: () => ZoneSummary | null;
  getZonesInCurrentRegion: () => ZoneSummary[];
  getLocationsInCurrentZone: () => LocationSummary[];

  // Clear state
  clearMapState: () => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build breadcrumb from geography tree and location ID
 */
function buildBreadcrumb(tree: GeographyTree | null, locationId: string | null): MapBreadcrumb {
  if (!tree || !locationId) {
    return { continent: null, region: null, zone: null, location: null };
  }
  return mapService.getBreadcrumbPath(tree, locationId);
}

/**
 * Find zone ID containing a location
 */
function findZoneIdForLocation(tree: GeographyTree, locationId: string): string | null {
  for (const continent of tree.continents) {
    for (const region of continent.regions) {
      for (const zone of region.zones) {
        if (zone.locations.some((loc) => loc.id === locationId)) {
          return zone.id;
        }
      }
    }
  }
  return null;
}

/**
 * Find region ID containing a zone
 */
function findRegionIdForZone(tree: GeographyTree, zoneId: string): string | null {
  for (const continent of tree.continents) {
    for (const region of continent.regions) {
      if (region.zones.some((z) => z.id === zoneId)) {
        return region.id;
      }
    }
  }
  return null;
}

/**
 * Find continent ID containing a region
 */
function findContinentIdForRegion(tree: GeographyTree, regionId: string): string | null {
  for (const continent of tree.continents) {
    if (continent.regions.some((r) => r.id === regionId)) {
      return continent.id;
    }
  }
  return null;
}

// =============================================================================
// STORE
// =============================================================================

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  geographyTree: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  currentZoom: 'local',
  focusedContinentId: null,
  focusedRegionId: null,
  focusedZoneId: null,
  focusedLocationId: null,

  playerLocationId: null,

  discoveredLocations: new Set(),

  activeOverlays: [],
  mapMode: 'navigation',
  isMinimapExpanded: false,
  showMapPanel: false,

  breadcrumb: { continent: null, region: null, zone: null, location: null },

  // ===== Data Fetching =====

  fetchGeographyTree: async () => {
    const { geographyTree, lastFetched } = get();

    // Skip if recently fetched (within 5 minutes)
    if (geographyTree && lastFetched) {
      const timeSinceLastFetch = Date.now() - lastFetched.getTime();
      if (timeSinceLastFetch < 5 * 60 * 1000) {
        return;
      }
    }

    set({ isLoading: true, error: null });

    try {
      const tree = await mapService.fetchGeographyTree();
      const { playerLocationId } = get();

      set({
        geographyTree: tree,
        isLoading: false,
        lastFetched: new Date(),
        breadcrumb: buildBreadcrumb(tree, playerLocationId),
      });
    } catch (error) {
      logger.error('Failed to fetch geography tree', error as Error, {
        context: 'useMapStore.fetchGeographyTree',
      });
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load map data',
      });
    }
  },

  refreshGeographyTree: async () => {
    set({ isLoading: true, error: null });

    try {
      const tree = await mapService.fetchGeographyTree();
      const { playerLocationId } = get();

      set({
        geographyTree: tree,
        isLoading: false,
        lastFetched: new Date(),
        breadcrumb: buildBreadcrumb(tree, playerLocationId),
      });
    } catch (error) {
      logger.error('Failed to refresh geography tree', error as Error, {
        context: 'useMapStore.refreshGeographyTree',
      });
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh map data',
      });
    }
  },

  // ===== Navigation Actions =====

  setZoom: (zoom: MapZoomLevel) => {
    set({ currentZoom: zoom });
  },

  focusContinent: (continentId: string | null) => {
    set({
      focusedContinentId: continentId,
      focusedRegionId: null,
      focusedZoneId: null,
      focusedLocationId: null,
      currentZoom: 'continental',
    });
  },

  focusRegion: (regionId: string | null) => {
    const { geographyTree } = get();

    let continentId: string | null = null;
    if (geographyTree && regionId) {
      continentId = findContinentIdForRegion(geographyTree, regionId);
    }

    set({
      focusedContinentId: continentId,
      focusedRegionId: regionId,
      focusedZoneId: null,
      focusedLocationId: null,
      currentZoom: 'regional',
    });
  },

  focusZone: (zoneId: string | null) => {
    const { geographyTree } = get();

    let regionId: string | null = null;
    let continentId: string | null = null;

    if (geographyTree && zoneId) {
      regionId = findRegionIdForZone(geographyTree, zoneId);
      if (regionId) {
        continentId = findContinentIdForRegion(geographyTree, regionId);
      }
    }

    set({
      focusedContinentId: continentId,
      focusedRegionId: regionId,
      focusedZoneId: zoneId,
      focusedLocationId: null,
      currentZoom: 'local',
    });
  },

  focusLocation: (locationId: string | null) => {
    const { geographyTree } = get();

    let zoneId: string | null = null;
    let regionId: string | null = null;
    let continentId: string | null = null;

    if (geographyTree && locationId) {
      zoneId = findZoneIdForLocation(geographyTree, locationId);
      if (zoneId) {
        regionId = findRegionIdForZone(geographyTree, zoneId);
        if (regionId) {
          continentId = findContinentIdForRegion(geographyTree, regionId);
        }
      }
    }

    set({
      focusedContinentId: continentId,
      focusedRegionId: regionId,
      focusedZoneId: zoneId,
      focusedLocationId: locationId,
      currentZoom: 'local',
      breadcrumb: buildBreadcrumb(geographyTree, locationId),
    });
  },

  navigateToLocation: (locationId: string) => {
    const { geographyTree, addDiscoveredLocation } = get();

    if (!geographyTree) return;

    const zoneId = findZoneIdForLocation(geographyTree, locationId);
    let regionId: string | null = null;
    let continentId: string | null = null;

    if (zoneId) {
      regionId = findRegionIdForZone(geographyTree, zoneId);
      if (regionId) {
        continentId = findContinentIdForRegion(geographyTree, regionId);
      }
    }

    // Add to discovered locations
    addDiscoveredLocation(locationId);

    set({
      focusedContinentId: continentId,
      focusedRegionId: regionId,
      focusedZoneId: zoneId,
      focusedLocationId: locationId,
      currentZoom: 'local',
      breadcrumb: buildBreadcrumb(geographyTree, locationId),
    });
  },

  setPlayerLocation: (locationId: string | null) => {
    const { geographyTree } = get();

    set({
      playerLocationId: locationId,
      breadcrumb: buildBreadcrumb(geographyTree, locationId),
    });

    // Auto-focus on player location
    if (locationId) {
      get().focusLocation(locationId);
    }
  },

  // ===== Discovery Management =====

  addDiscoveredLocation: (locationId: string) => {
    set((state) => ({
      discoveredLocations: new Set([...state.discoveredLocations, locationId]),
    }));
  },

  setDiscoveredLocations: (locationIds: string[]) => {
    set({ discoveredLocations: new Set(locationIds) });
  },

  isLocationDiscovered: (locationId: string) => {
    return get().discoveredLocations.has(locationId);
  },

  // ===== Overlay & Mode Toggles =====

  toggleOverlay: (overlay: MapOverlay) => {
    set((state) => {
      const overlays = [...state.activeOverlays];
      const index = overlays.indexOf(overlay);
      if (index >= 0) {
        overlays.splice(index, 1);
      } else {
        overlays.push(overlay);
      }
      return { activeOverlays: overlays };
    });
  },

  setOverlays: (overlays: MapOverlay[]) => {
    set({ activeOverlays: overlays });
  },

  setMapMode: (mode: MapMode) => {
    set({ mapMode: mode });
  },

  toggleMinimap: () => {
    set((state) => ({ isMinimapExpanded: !state.isMinimapExpanded }));
  },

  toggleMapPanel: () => {
    set((state) => ({ showMapPanel: !state.showMapPanel }));
  },

  // ===== Utility Getters =====

  getCurrentContinent: () => {
    const { geographyTree, focusedContinentId } = get();
    if (!geographyTree || !focusedContinentId) return null;

    const continent = geographyTree.continents.find((c) => c.id === focusedContinentId);
    if (!continent) return null;

    return {
      id: continent.id,
      name: continent.name,
      icon: continent.icon,
      isUnlocked: continent.isUnlocked,
      regionCount: continent.regionCount,
    };
  },

  getCurrentRegion: () => {
    const { geographyTree, focusedContinentId, focusedRegionId } = get();
    if (!geographyTree || !focusedContinentId || !focusedRegionId) return null;

    const continent = geographyTree.continents.find((c) => c.id === focusedContinentId);
    if (!continent) return null;

    const region = continent.regions.find((r) => r.id === focusedRegionId);
    if (!region) return null;

    return {
      id: region.id,
      name: region.name,
      icon: region.icon,
      primaryFaction: region.primaryFaction,
      isUnlocked: region.isUnlocked,
      zoneCount: region.zoneCount,
    };
  },

  getCurrentZone: () => {
    const { geographyTree, focusedContinentId, focusedRegionId, focusedZoneId } = get();
    if (!geographyTree || !focusedContinentId || !focusedRegionId || !focusedZoneId) return null;

    const continent = geographyTree.continents.find((c) => c.id === focusedContinentId);
    if (!continent) return null;

    const region = continent.regions.find((r) => r.id === focusedRegionId);
    if (!region) return null;

    const zone = region.zones.find((z) => z.id === focusedZoneId);
    if (!zone) return null;

    return {
      id: zone.id,
      name: zone.name,
      icon: zone.icon,
      theme: zone.theme,
      primaryFaction: zone.primaryFaction,
      dangerRange: zone.dangerRange,
      isUnlocked: zone.isUnlocked,
      locationCount: zone.locationCount,
    };
  },

  getZonesInCurrentRegion: () => {
    const { geographyTree, focusedContinentId, focusedRegionId } = get();
    if (!geographyTree || !focusedContinentId || !focusedRegionId) return [];

    const continent = geographyTree.continents.find((c) => c.id === focusedContinentId);
    if (!continent) return [];

    const region = continent.regions.find((r) => r.id === focusedRegionId);
    if (!region) return [];

    return region.zones.map((z) => ({
      id: z.id,
      name: z.name,
      icon: z.icon,
      theme: z.theme,
      primaryFaction: z.primaryFaction,
      dangerRange: z.dangerRange,
      isUnlocked: z.isUnlocked,
      locationCount: z.locationCount,
    }));
  },

  getLocationsInCurrentZone: () => {
    const { geographyTree, focusedContinentId, focusedRegionId, focusedZoneId } = get();
    if (!geographyTree || !focusedContinentId || !focusedRegionId || !focusedZoneId) return [];

    const continent = geographyTree.continents.find((c) => c.id === focusedContinentId);
    if (!continent) return [];

    const region = continent.regions.find((r) => r.id === focusedRegionId);
    if (!region) return [];

    const zone = region.zones.find((z) => z.id === focusedZoneId);
    if (!zone) return [];

    return zone.locations;
  },

  // ===== Clear State =====

  clearMapState: () => {
    set({
      geographyTree: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      currentZoom: 'local',
      focusedContinentId: null,
      focusedRegionId: null,
      focusedZoneId: null,
      focusedLocationId: null,
      playerLocationId: null,
      discoveredLocations: new Set(),
      activeOverlays: [],
      mapMode: 'navigation',
      isMinimapExpanded: false,
      showMapPanel: false,
      breadcrumb: { continent: null, region: null, zone: null, location: null },
    });
  },
}));

export default useMapStore;
