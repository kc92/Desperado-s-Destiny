/**
 * Business Service
 * API client for business-related endpoints (Phase 12)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface Business {
  _id: string;
  propertyId: string;
  ownerId: string;
  ownerType: 'character' | 'gang';
  businessType: string;
  name: string;
  status: 'open' | 'closed' | 'suspended';
  services: BusinessService[];
  staff: BusinessStaff[];
  pendingRevenue: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessService {
  serviceId: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  dailyCapacity: number;
  dailyServed: number;
}

export interface BusinessStaff {
  workerId: string;
  workerName: string;
  role: string;
  assignedAt: Date;
}

export interface BusinessType {
  id: string;
  name: string;
  description: string;
  requiredPropertyType: string;
  establishmentCost: number;
  dailyOperatingCost: number;
}

export interface ServiceDefinition {
  serviceId: string;
  name: string;
  description: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface ProductDefinition {
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  productionCost: number;
}

export interface BusinessStatistics {
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  customersServed: number;
  averageRating: number;
}

/**
 * Business service for API calls
 */
export const businessService = {
  // ============================================================================
  // Owner Endpoints
  // ============================================================================

  /**
   * Get all businesses owned by the authenticated character
   */
  getMyBusinesses: async () => {
    const response = await apiClient.get<ApiResponse<{ businesses: Business[] }>>(
      '/businesses/my-businesses'
    );
    return response.data;
  },

  /**
   * Establish a new business on a property
   */
  establishBusiness: async (propertyId: string, businessType: string, name: string) => {
    const response = await apiClient.post<ApiResponse<{ business: Business }>>(
      '/businesses/establish',
      { propertyId, businessType, name }
    );
    return response.data;
  },

  /**
   * Get business details
   */
  getBusinessDetails: async (businessId: string) => {
    const response = await apiClient.get<ApiResponse<{ business: Business }>>(
      `/businesses/${businessId}`
    );
    return response.data;
  },

  /**
   * Update service price
   */
  updateServicePrice: async (businessId: string, serviceId: string, price: number) => {
    const response = await apiClient.put<ApiResponse<{ service: BusinessService }>>(
      `/businesses/${businessId}/services/${serviceId}/price`,
      { price }
    );
    return response.data;
  },

  /**
   * Toggle service active state
   */
  toggleService: async (businessId: string, serviceId: string) => {
    const response = await apiClient.post<ApiResponse<{ service: BusinessService }>>(
      `/businesses/${businessId}/services/${serviceId}/toggle`
    );
    return response.data;
  },

  /**
   * Assign worker to business
   */
  assignStaff: async (businessId: string, workerId: string, role: string) => {
    const response = await apiClient.post<ApiResponse<{ staff: BusinessStaff[] }>>(
      `/businesses/${businessId}/staff/assign`,
      { workerId, role }
    );
    return response.data;
  },

  /**
   * Remove staff from business
   */
  removeStaff: async (businessId: string, workerId: string) => {
    const response = await apiClient.delete<ApiResponse<{ staff: BusinessStaff[] }>>(
      `/businesses/${businessId}/staff/${workerId}`
    );
    return response.data;
  },

  /**
   * Collect pending revenue
   */
  collectRevenue: async (businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ collected: number; newBalance: number }>>(
      `/businesses/${businessId}/collect`
    );
    return response.data;
  },

  /**
   * Get business statistics
   */
  getStatistics: async (businessId: string) => {
    const response = await apiClient.get<ApiResponse<{ statistics: BusinessStatistics }>>(
      `/businesses/${businessId}/statistics`
    );
    return response.data;
  },

  /**
   * Close a business
   */
  closeBusiness: async (businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ business: Business }>>(
      `/businesses/${businessId}/close`
    );
    return response.data;
  },

  /**
   * Reopen a closed business
   */
  reopenBusiness: async (businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ business: Business }>>(
      `/businesses/${businessId}/reopen`
    );
    return response.data;
  },

  // ============================================================================
  // Customer Endpoints
  // ============================================================================

  /**
   * Get all businesses at a location
   */
  getBusinessesAtLocation: async (locationId: string) => {
    const response = await apiClient.get<ApiResponse<{ businesses: Business[] }>>(
      `/businesses/location/${locationId}`
    );
    return response.data;
  },

  // ============================================================================
  // Reference Data Endpoints
  // ============================================================================

  /**
   * Get available business types for a property type
   */
  getAvailableTypes: async (propertyType: string) => {
    const response = await apiClient.get<ApiResponse<{ types: BusinessType[] }>>(
      `/businesses/types/${propertyType}`
    );
    return response.data;
  },

  /**
   * Get service definitions for a business type
   */
  getServiceDefinitions: async (businessType: string) => {
    const response = await apiClient.get<ApiResponse<{ services: ServiceDefinition[] }>>(
      `/businesses/services/${businessType}`
    );
    return response.data;
  },

  /**
   * Get product definitions for a business type
   */
  getProductDefinitions: async (businessType: string) => {
    const response = await apiClient.get<ApiResponse<{ products: ProductDefinition[] }>>(
      `/businesses/products/${businessType}`
    );
    return response.data;
  },
};

export default businessService;
