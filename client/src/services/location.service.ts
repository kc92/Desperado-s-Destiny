/**
 * Location Service
 * API client for location-related operations
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';
import type {
  Location,
  PopulatedLocation,
  TravelResult,
  TownBuilding,
  RegionType,
} from '@desperados/shared';

/**
 * Location Service
 * Handles all location-related API calls
 */
export const locationService = {
  /**
   * Get all locations
   */
  async getAllLocations(
    region?: RegionType,
    type?: string
  ): Promise<ApiResponse<{ locations: Location[] }>> {
    try {
      const params = new URLSearchParams();
      if (region) params.append('region', region);
      if (type) params.append('type', type);

      const url = `/locations${params.toString() ? `?${params}` : ''}`;
      const response = await apiClient.get<ApiResponse<{ locations: Location[] }>>(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch locations',
      };
    }
  },

  /**
   * Get location by ID
   */
  async getLocationById(
    locationId: string
  ): Promise<ApiResponse<{ location: PopulatedLocation }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ location: PopulatedLocation }>>(
        `/locations/${locationId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch location',
      };
    }
  },

  /**
   * Get current character's location
   */
  async getCurrentLocation(): Promise<ApiResponse<{ location: PopulatedLocation }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ location: PopulatedLocation }>>(
        '/locations/current'
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch current location',
      };
    }
  },

  /**
   * Get locations by region
   */
  async getLocationsByRegion(
    region: RegionType
  ): Promise<ApiResponse<{ region: RegionType; locations: Location[] }>> {
    try {
      const response = await apiClient.get<
        ApiResponse<{ region: RegionType; locations: Location[] }>
      >(`/locations/region/${region}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch locations',
      };
    }
  },

  /**
   * Get town buildings for hub display
   */
  async getTownBuildings(): Promise<ApiResponse<{ buildings: TownBuilding[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ buildings: TownBuilding[] }>>(
        '/locations/town/buildings'
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch town buildings',
      };
    }
  },

  /**
   * Travel to a new location
   */
  async travel(
    targetLocationId: string
  ): Promise<
    ApiResponse<{
      result: TravelResult;
      character: { currentLocation: string; energy: number };
    }>
  > {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          result: TravelResult;
          character: { currentLocation: string; energy: number };
        }>
      >('/locations/travel', { targetLocationId });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to travel',
      };
    }
  },
};

export default locationService;
