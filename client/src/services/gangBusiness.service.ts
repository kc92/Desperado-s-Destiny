/**
 * Gang Business Service
 * API client for gang business and protection racket endpoints (Phase 15)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface GangBusiness {
  _id: string;
  gangId: string;
  businessId: string;
  businessName: string;
  businessType: string;
  locationId: string;
  locationName: string;
  managerId?: string;
  managerName?: string;
  revenueShare: number;
  pendingRevenue: number;
  totalRevenue: number;
  status: 'active' | 'closed' | 'contested';
  acquiredAt: Date;
}

export interface ProtectionContract {
  _id: string;
  gangId: string;
  gangName: string;
  businessId: string;
  businessName: string;
  ownerId: string;
  ownerName: string;
  weeklyFee: number;
  protectionLevel: number;
  status: 'pending' | 'active' | 'rejected' | 'terminated';
  expiresAt?: Date;
  createdAt: Date;
}

export interface ProtectionOffer {
  _id: string;
  gangId: string;
  gangName: string;
  businessId: string;
  businessName: string;
  weeklyFee: number;
  protectionLevel: number;
  message?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ProtectionStatus {
  isProtected: boolean;
  contract?: ProtectionContract;
  pendingOffers: ProtectionOffer[];
}

/**
 * Gang Business service for API calls
 */
export const gangBusinessService = {
  // ============================================================================
  // Gang Business Management
  // ============================================================================

  /**
   * Get all businesses owned by a gang
   */
  getGangBusinesses: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ businesses: GangBusiness[] }>>(
      `/gang-businesses/gang/${gangId}`
    );
    return response.data;
  },

  /**
   * Purchase a new business for the gang
   */
  purchaseBusiness: async (gangId: string, propertyId: string, businessType: string, name: string) => {
    const response = await apiClient.post<ApiResponse<{ business: GangBusiness }>>(
      `/gang-businesses/gang/${gangId}/purchase`,
      { propertyId, businessType, name }
    );
    return response.data;
  },

  /**
   * Transfer a player's business to their gang
   */
  transferToGang: async (businessId: string, gangId: string) => {
    const response = await apiClient.post<ApiResponse<{ business: GangBusiness }>>(
      `/gang-businesses/${businessId}/transfer-to-gang`,
      { gangId }
    );
    return response.data;
  },

  /**
   * Collect revenue from gang business
   */
  collectRevenue: async (gangId: string, businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ collected: number; newBalance: number }>>(
      `/gang-businesses/gang/${gangId}/businesses/${businessId}/collect`
    );
    return response.data;
  },

  /**
   * Set manager for gang business
   */
  setManager: async (gangId: string, businessId: string, managerId: string) => {
    const response = await apiClient.put<ApiResponse<{ business: GangBusiness }>>(
      `/gang-businesses/gang/${gangId}/businesses/${businessId}/manager`,
      { managerId }
    );
    return response.data;
  },

  /**
   * Update revenue share percentage
   */
  setRevenueShare: async (gangId: string, businessId: string, revenueShare: number) => {
    const response = await apiClient.put<ApiResponse<{ business: GangBusiness }>>(
      `/gang-businesses/gang/${gangId}/businesses/${businessId}/revenue-share`,
      { revenueShare }
    );
    return response.data;
  },

  /**
   * Sell a gang business
   */
  sellBusiness: async (gangId: string, businessId: string) => {
    const response = await apiClient.post<ApiResponse<{ salePrice: number }>>(
      `/gang-businesses/gang/${gangId}/businesses/${businessId}/sell`
    );
    return response.data;
  },

  // ============================================================================
  // Protection Racket
  // ============================================================================

  /**
   * Offer protection to a business
   */
  offerProtection: async (gangId: string, businessId: string, weeklyFee: number, message?: string) => {
    const response = await apiClient.post<ApiResponse<{ offer: ProtectionOffer }>>(
      `/gang-businesses/gang/${gangId}/protection/offer`,
      { businessId, weeklyFee, message }
    );
    return response.data;
  },

  /**
   * Get all protection contracts for a gang
   */
  getGangProtectionContracts: async (gangId: string) => {
    const response = await apiClient.get<ApiResponse<{ contracts: ProtectionContract[] }>>(
      `/gang-businesses/gang/${gangId}/protection`
    );
    return response.data;
  },

  /**
   * Get protection status for a business
   */
  getBusinessProtectionStatus: async (businessId: string) => {
    const response = await apiClient.get<ApiResponse<{ status: ProtectionStatus }>>(
      `/gang-businesses/businesses/${businessId}/protection`
    );
    return response.data;
  },

  /**
   * Respond to a protection offer (accept or reject)
   */
  respondToProtectionOffer: async (contractId: string, accept: boolean) => {
    const response = await apiClient.post<ApiResponse<{ contract: ProtectionContract }>>(
      `/gang-businesses/protection/${contractId}/respond`,
      { accept }
    );
    return response.data;
  },

  /**
   * Terminate a protection contract
   */
  terminateProtection: async (contractId: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/gang-businesses/protection/${contractId}/terminate`
    );
    return response.data;
  },

  /**
   * Get pending protection offers for the authenticated character's businesses
   */
  getMyProtectionOffers: async () => {
    const response = await apiClient.get<ApiResponse<{ offers: ProtectionOffer[] }>>(
      '/gang-businesses/my-protection-offers'
    );
    return response.data;
  },
};

export default gangBusinessService;
