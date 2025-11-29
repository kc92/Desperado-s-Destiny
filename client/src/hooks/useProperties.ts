/**
 * useProperties Hook
 * Handles property management operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import type {
  Property,
  PropertyListing,
  PropertyLoan,
  PropertyType,
  PropertyTier,
  WorkerType,
} from '@desperados/shared';

/**
 * Property listing response from API
 */
interface PropertyListingsResponse {
  listings: PropertyListing[];
  total: number;
}

/**
 * Foreclosed properties response from API
 */
interface ForeclosedPropertiesResponse {
  properties: PropertyListing[];
  total: number;
}

/**
 * My properties response from API
 */
interface MyPropertiesResponse {
  properties: Property[];
  total: number;
}

/**
 * Property details response from API
 */
interface PropertyDetailsResponse {
  property: Property;
}

/**
 * Loans response from API
 */
interface LoansResponse {
  loans: PropertyLoan[];
  total: number;
}

/**
 * Action result type
 */
interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

/**
 * Available worker for hire
 */
export interface AvailableWorker {
  workerId: string;
  name: string;
  workerType: WorkerType;
  skill: number;
  dailyWage: number;
}

/**
 * Upgrade option definition
 */
export interface UpgradeOption {
  upgradeId: string;
  upgradeType: string;
  name: string;
  description: string;
  cost: number;
  minTier: PropertyTier;
  benefits: string[];
}

/**
 * Hook return type
 */
interface UsePropertiesReturn {
  // State
  listings: PropertyListing[];
  foreclosedListings: PropertyListing[];
  myProperties: Property[];
  selectedProperty: Property | null;
  loans: PropertyLoan[];
  isLoading: boolean;
  error: string | null;

  // Fetch operations
  fetchListings: (filters?: {
    type?: PropertyType;
    locationId?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => Promise<void>;
  fetchForeclosedListings: () => Promise<void>;
  fetchMyProperties: () => Promise<void>;
  fetchPropertyDetails: (propertyId: string) => Promise<void>;
  fetchLoans: () => Promise<void>;

  // Property operations
  purchaseProperty: (
    listingId: string,
    useLoan: boolean,
    downPaymentPercentage?: number
  ) => Promise<ActionResult>;
  upgradeTier: (propertyId: string) => Promise<ActionResult>;
  addUpgrade: (propertyId: string, upgradeType: string) => Promise<ActionResult>;
  hireWorker: (
    propertyId: string,
    workerType: WorkerType,
    skill: number
  ) => Promise<ActionResult>;
  fireWorker: (propertyId: string, workerId: string) => Promise<ActionResult>;
  depositItem: (
    propertyId: string,
    itemId: string,
    quantity: number
  ) => Promise<ActionResult>;
  withdrawItem: (
    propertyId: string,
    itemId: string,
    quantity: number
  ) => Promise<ActionResult>;
  makeLoanPayment: (loanId: string, amount?: number) => Promise<ActionResult>;
  transferProperty: (
    propertyId: string,
    targetCharacterId: string,
    price?: number
  ) => Promise<ActionResult>;

  // UI helpers
  clearSelectedProperty: () => void;
  clearError: () => void;
}

/**
 * Properties management hook
 */
export const useProperties = (): UsePropertiesReturn => {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [foreclosedListings, setForeclosedListings] = useState<PropertyListing[]>([]);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loans, setLoans] = useState<PropertyLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch available property listings
   */
  const fetchListings = useCallback(
    async (filters?: {
      type?: PropertyType;
      locationId?: string;
      minPrice?: number;
      maxPrice?: number;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.locationId) params.append('locationId', filters.locationId);
        if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

        const queryString = params.toString();
        const url = `/properties/listings${queryString ? `?${queryString}` : ''}`;
        const response = await api.get<{ data: PropertyListingsResponse }>(url);
        setListings(response.data.data.listings || []);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch property listings';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch foreclosed property listings
   */
  const fetchForeclosedListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: ForeclosedPropertiesResponse }>(
        '/properties/foreclosed'
      );
      setForeclosedListings(response.data.data.properties || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch foreclosed properties';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch my owned properties
   */
  const fetchMyProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: MyPropertiesResponse }>(
        '/properties/my-properties'
      );
      setMyProperties(response.data.data.properties || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch your properties';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch property details
   */
  const fetchPropertyDetails = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: PropertyDetailsResponse }>(
        `/properties/${propertyId}`
      );
      setSelectedProperty(response.data.data.property);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch property details';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch my loans
   */
  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: LoansResponse }>('/properties/loans');
      setLoans(response.data.data.loans || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch loans';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Purchase a property
   */
  const purchaseProperty = useCallback(
    async (
      listingId: string,
      useLoan: boolean,
      downPaymentPercentage?: number
    ): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          '/properties/purchase',
          {
            listingId,
            useLoan,
            downPaymentPercentage,
          }
        );
        await refreshCharacter();
        await fetchMyProperties();
        if (useLoan) {
          await fetchLoans();
        }
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to purchase property';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchMyProperties, fetchLoans]
  );

  /**
   * Upgrade property tier
   */
  const upgradeTier = useCallback(
    async (propertyId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/upgrade-tier`
        );
        await refreshCharacter();
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upgrade property tier';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchPropertyDetails]
  );

  /**
   * Add upgrade to property
   */
  const addUpgrade = useCallback(
    async (propertyId: string, upgradeType: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/upgrade`,
          { upgradeType }
        );
        await refreshCharacter();
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add upgrade';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchPropertyDetails]
  );

  /**
   * Hire a worker
   */
  const hireWorker = useCallback(
    async (
      propertyId: string,
      workerType: WorkerType,
      skill: number
    ): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/hire`,
          { workerType, skill }
        );
        await refreshCharacter();
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to hire worker';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchPropertyDetails]
  );

  /**
   * Fire a worker
   */
  const fireWorker = useCallback(
    async (propertyId: string, workerId: string): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/fire`,
          { workerId }
        );
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fire worker';
        return { success: false, message: errorMessage };
      }
    },
    [fetchPropertyDetails]
  );

  /**
   * Deposit item to storage
   */
  const depositItem = useCallback(
    async (
      propertyId: string,
      itemId: string,
      quantity: number
    ): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/storage/deposit`,
          { itemId, quantity }
        );
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to deposit item';
        return { success: false, message: errorMessage };
      }
    },
    [fetchPropertyDetails]
  );

  /**
   * Withdraw item from storage
   */
  const withdrawItem = useCallback(
    async (
      propertyId: string,
      itemId: string,
      quantity: number
    ): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/storage/withdraw`,
          { itemId, quantity }
        );
        await fetchPropertyDetails(propertyId);
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to withdraw item';
        return { success: false, message: errorMessage };
      }
    },
    [fetchPropertyDetails]
  );

  /**
   * Make loan payment
   */
  const makeLoanPayment = useCallback(
    async (loanId: string, amount?: number): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/loans/${loanId}/pay`,
          { amount }
        );
        await refreshCharacter();
        await fetchLoans();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to make payment';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchLoans]
  );

  /**
   * Transfer property to another player
   */
  const transferProperty = useCallback(
    async (
      propertyId: string,
      targetCharacterId: string,
      price?: number
    ): Promise<ActionResult> => {
      try {
        const response = await api.post<{ data: { message: string } }>(
          `/properties/${propertyId}/transfer`,
          { targetCharacterId, price }
        );
        await refreshCharacter();
        await fetchMyProperties();
        return { success: true, message: response.data.data.message };
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to transfer property';
        return { success: false, message: errorMessage };
      }
    },
    [refreshCharacter, fetchMyProperties]
  );

  /**
   * Clear selected property
   */
  const clearSelectedProperty = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    listings,
    foreclosedListings,
    myProperties,
    selectedProperty,
    loans,
    isLoading,
    error,

    // Fetch operations
    fetchListings,
    fetchForeclosedListings,
    fetchMyProperties,
    fetchPropertyDetails,
    fetchLoans,

    // Property operations
    purchaseProperty,
    upgradeTier,
    addUpgrade,
    hireWorker,
    fireWorker,
    depositItem,
    withdrawItem,
    makeLoanPayment,
    transferProperty,

    // UI helpers
    clearSelectedProperty,
    clearError,
  };
};

export default useProperties;
