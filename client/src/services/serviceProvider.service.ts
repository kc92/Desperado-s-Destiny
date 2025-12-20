/**
 * Service Provider Service
 * API client for wandering service provider interactions
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';
import type {
  Service,
  UseServiceResponse,
  GetServiceProvidersAtLocationResponse,
  GetProviderScheduleResponse,
} from '@desperados/shared';

/**
 * Simplified provider info returned by getAllProviders
 */
export interface ProviderSummary {
  id: string;
  name: string;
  title: string;
  profession: string;
  description: string;
  faction: 'neutral' | 'settler' | 'frontera' | 'coalition';
  route: {
    locationName: string;
    arrivalDay: number;
    departureDay: number;
  }[];
}

/**
 * Response for getAllProviders endpoint
 */
export interface GetAllProvidersResponse {
  success: boolean;
  providers: ProviderSummary[];
}

/**
 * Response for getAvailableServices endpoint
 */
export interface GetAvailableServicesResponse {
  success: boolean;
  services: Service[];
}

/**
 * Service Provider Service
 * Handles all service provider-related API calls
 */
export const serviceProviderService = {
  /**
   * Get all service providers
   * Public endpoint - no auth required
   */
  async getAllProviders(): Promise<ApiResponse<{ providers: ProviderSummary[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ providers: ProviderSummary[] }>>(
        '/service-providers'
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch service providers',
      };
    }
  },

  /**
   * Get provider schedule
   * Public endpoint - no auth required
   * @param providerId - ID of the service provider
   */
  async getProviderSchedule(
    providerId: string
  ): Promise<ApiResponse<GetProviderScheduleResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<GetProviderScheduleResponse>>(
        `/service-providers/${providerId}/schedule`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch provider schedule',
      };
    }
  },

  /**
   * Get service providers at a specific location
   * Protected endpoint - requires authentication
   * @param locationId - ID of the location
   */
  async getProvidersAtLocation(
    locationId: string
  ): Promise<ApiResponse<GetServiceProvidersAtLocationResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<GetServiceProvidersAtLocationResponse>>(
        `/service-providers/location/${locationId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch providers at location',
      };
    }
  },

  /**
   * Get available services from a provider
   * Protected endpoint - requires authentication
   * @param providerId - ID of the service provider
   */
  async getAvailableServices(
    providerId: string
  ): Promise<ApiResponse<{ services: Service[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ services: Service[] }>>(
        `/service-providers/${providerId}/services`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch available services',
      };
    }
  },

  /**
   * Use a service from a provider
   * Protected endpoint - requires authentication
   * @param providerId - ID of the service provider
   * @param serviceId - ID of the service to use
   * @param paymentType - Type of payment ('gold' or 'barter')
   * @param barterItems - Items to barter (if payment type is 'barter')
   */
  async useService(
    providerId: string,
    serviceId: string,
    paymentType: 'gold' | 'barter' = 'gold',
    barterItems?: { itemId: string; quantity: number }[]
  ): Promise<ApiResponse<UseServiceResponse>> {
    try {
      const requestData = {
        serviceId,
        paymentType,
        barterItems,
      };

      const response = await apiClient.post<ApiResponse<UseServiceResponse>>(
        `/service-providers/${providerId}/use-service`,
        requestData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to use service',
      };
    }
  },
};

export default serviceProviderService;
