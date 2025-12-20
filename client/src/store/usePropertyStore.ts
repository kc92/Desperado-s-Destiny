/**
 * Property Store
 * Zustand store for property ownership and management state
 */

import { create } from 'zustand';
import {
  propertyService,
  Property,
  PropertyListing,
  PropertyLoan,
  PurchasePropertyRequest,
  AddUpgradeRequest,
  HireWorkerRequest,
  FireWorkerRequest,
  DepositItemRequest,
  WithdrawItemRequest,
  MakeLoanPaymentRequest,
  TransferPropertyRequest,
} from '../services/property.service';
import { logger } from '../services/logger.service';

interface PropertyStore {
  // State
  ownedProperties: Property[];
  availableProperties: PropertyListing[];
  foreclosedProperties: PropertyListing[];
  selectedProperty: Property | null;
  loans: PropertyLoan[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOwnedProperties: () => Promise<void>;
  fetchAvailableProperties: () => Promise<void>;
  fetchForeclosedProperties: () => Promise<void>;
  fetchPropertyDetails: (propertyId: string) => Promise<void>;
  fetchLoans: () => Promise<void>;
  purchaseProperty: (request: PurchasePropertyRequest) => Promise<boolean>;
  sellProperty: (propertyId: string, request: TransferPropertyRequest) => Promise<boolean>;
  upgradeProperty: (propertyId: string) => Promise<boolean>;
  addPropertyUpgrade: (propertyId: string, request: AddUpgradeRequest) => Promise<boolean>;
  hireWorker: (propertyId: string, request: HireWorkerRequest) => Promise<boolean>;
  fireWorker: (propertyId: string, request: FireWorkerRequest) => Promise<boolean>;
  depositItem: (propertyId: string, request: DepositItemRequest) => Promise<boolean>;
  withdrawItem: (propertyId: string, request: WithdrawItemRequest) => Promise<boolean>;
  makeLoanPayment: (loanId: string, request: MakeLoanPaymentRequest) => Promise<boolean>;
  transferProperty: (propertyId: string, request: TransferPropertyRequest) => Promise<boolean>;
  setSelectedProperty: (property: Property | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  // Initial state
  ownedProperties: [],
  availableProperties: [],
  foreclosedProperties: [],
  selectedProperty: null,
  loans: [],
  isLoading: false,
  error: null,

  // Actions
  fetchOwnedProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Fetching owned properties');
      const properties = await propertyService.getMyProperties();
      set({ ownedProperties: properties, isLoading: false });
      logger.info('Owned properties fetched successfully', { count: properties.length });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch owned properties';
      logger.error('Failed to fetch owned properties', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAvailableProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Fetching available properties');
      const listings = await propertyService.getListings();
      set({ availableProperties: listings, isLoading: false });
      logger.info('Available properties fetched successfully', { count: listings.length });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch available properties';
      logger.error('Failed to fetch available properties', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchForeclosedProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Fetching foreclosed properties');
      const listings = await propertyService.getForeclosedListings();
      set({ foreclosedProperties: listings, isLoading: false });
      logger.info('Foreclosed properties fetched successfully', { count: listings.length });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch foreclosed properties';
      logger.error('Failed to fetch foreclosed properties', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPropertyDetails: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Fetching property details', { propertyId });
      const property = await propertyService.getPropertyDetails(propertyId);
      set({ selectedProperty: property, isLoading: false });
      logger.info('Property details fetched successfully', { propertyId, name: property.name });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch property details';
      logger.error('Failed to fetch property details', error, { propertyId });
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Fetching loans');
      const loans = await propertyService.getMyLoans();
      set({ loans, isLoading: false });
      logger.info('Loans fetched successfully', { count: loans.length });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch loans';
      logger.error('Failed to fetch loans', error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  purchaseProperty: async (request: PurchasePropertyRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Purchasing property', { propertyId: request.propertyId });
      const response = await propertyService.purchaseProperty(request);

      if (response.success) {
        // Refresh owned properties
        await get().fetchOwnedProperties();

        // Refresh available properties
        await get().fetchAvailableProperties();

        // If a loan was created, refresh loans
        if (response.loan) {
          await get().fetchLoans();
        }

        set({ isLoading: false });
        logger.info('Property purchased successfully', {
          propertyId: request.propertyId,
          propertyName: response.property.name,
          hasLoan: !!response.loan,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to purchase property';
        logger.warn('Property purchase failed', { propertyId: request.propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to purchase property';
      logger.error('Failed to purchase property', error, { propertyId: request.propertyId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  sellProperty: async (propertyId: string, request: TransferPropertyRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Selling/transferring property', { propertyId, targetCharacterId: request.targetCharacterId });
      const response = await propertyService.transferProperty(propertyId, request);

      if (response.success) {
        // Refresh owned properties
        await get().fetchOwnedProperties();

        set({ isLoading: false });
        logger.info('Property transferred successfully', {
          propertyId,
          propertyName: response.property.name,
          newOwner: response.newOwnerName,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to transfer property';
        logger.warn('Property transfer failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to transfer property';
      logger.error('Failed to transfer property', error, { propertyId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  upgradeProperty: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Upgrading property tier', { propertyId });
      const response = await propertyService.upgradeTier(propertyId);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Property tier upgraded successfully', {
          propertyId,
          propertyName: response.property.name,
          oldTier: response.oldTier,
          newTier: response.newTier,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to upgrade property';
        logger.warn('Property upgrade failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upgrade property';
      logger.error('Failed to upgrade property', error, { propertyId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  addPropertyUpgrade: async (propertyId: string, request: AddUpgradeRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Adding property upgrade', { propertyId, upgradeId: request.upgradeId });
      const response = await propertyService.addUpgrade(propertyId, request);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Property upgrade added successfully', {
          propertyId,
          propertyName: response.property.name,
          upgradeName: response.upgrade.name,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to add upgrade';
        logger.warn('Property upgrade failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add upgrade';
      logger.error('Failed to add upgrade', error, { propertyId, upgradeId: request.upgradeId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  hireWorker: async (propertyId: string, request: HireWorkerRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Hiring worker', { propertyId, npcId: request.npcId, role: request.role });
      const response = await propertyService.hireWorker(propertyId, request);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Worker hired successfully', {
          propertyId,
          propertyName: response.property.name,
          workerName: response.worker.name,
          role: response.worker.role,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to hire worker';
        logger.warn('Worker hire failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to hire worker';
      logger.error('Failed to hire worker', error, { propertyId, npcId: request.npcId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  fireWorker: async (propertyId: string, request: FireWorkerRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Firing worker', { propertyId, workerId: request.workerId });
      const response = await propertyService.fireWorker(propertyId, request);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Worker fired successfully', {
          propertyId,
          propertyName: response.property.name,
          severancePay: response.severancePay,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to fire worker';
        logger.warn('Worker fire failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fire worker';
      logger.error('Failed to fire worker', error, { propertyId, workerId: request.workerId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  depositItem: async (propertyId: string, request: DepositItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Depositing item to property storage', { propertyId, itemId: request.itemId, quantity: request.quantity });
      const response = await propertyService.depositItem(propertyId, request);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Item deposited successfully', {
          propertyId,
          propertyName: response.property.name,
          itemName: response.item.name,
          quantity: response.item.quantity,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to deposit item';
        logger.warn('Item deposit failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to deposit item';
      logger.error('Failed to deposit item', error, { propertyId, itemId: request.itemId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  withdrawItem: async (propertyId: string, request: WithdrawItemRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Withdrawing item from property storage', { propertyId, itemId: request.itemId, quantity: request.quantity });
      const response = await propertyService.withdrawItem(propertyId, request);

      if (response.success) {
        // Update the property in owned properties
        const updatedProperties = get().ownedProperties.map(p =>
          p._id === propertyId ? response.property : p
        );
        set({ ownedProperties: updatedProperties });

        // Update selected property if it matches
        if (get().selectedProperty?._id === propertyId) {
          set({ selectedProperty: response.property });
        }

        set({ isLoading: false });
        logger.info('Item withdrawn successfully', {
          propertyId,
          propertyName: response.property.name,
          itemName: response.item.name,
          quantity: response.item.quantity,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to withdraw item';
        logger.warn('Item withdrawal failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to withdraw item';
      logger.error('Failed to withdraw item', error, { propertyId, itemId: request.itemId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  makeLoanPayment: async (loanId: string, request: MakeLoanPaymentRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Making loan payment', { loanId, amount: request.amount });
      const response = await propertyService.makeLoanPayment(loanId, request);

      if (response.success) {
        // Update the loan in loans array
        const updatedLoans = get().loans.map(l =>
          l._id === loanId ? response.loan : l
        );
        set({ loans: updatedLoans, isLoading: false });

        logger.info('Loan payment made successfully', {
          loanId,
          amountPaid: response.amountPaid,
          remainingBalance: response.remainingBalance,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to make loan payment';
        logger.warn('Loan payment failed', { loanId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to make loan payment';
      logger.error('Failed to make loan payment', error, { loanId, amount: request.amount });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  transferProperty: async (propertyId: string, request: TransferPropertyRequest) => {
    set({ isLoading: true, error: null });
    try {
      logger.debug('Transferring property', { propertyId, targetCharacterId: request.targetCharacterId });
      const response = await propertyService.transferProperty(propertyId, request);

      if (response.success) {
        // Refresh owned properties
        await get().fetchOwnedProperties();

        set({ isLoading: false });
        logger.info('Property transferred successfully', {
          propertyId,
          propertyName: response.property.name,
          newOwner: response.newOwnerName,
        });
        return true;
      } else {
        const errorMessage = response.message || 'Failed to transfer property';
        logger.warn('Property transfer failed', { propertyId, message: errorMessage });
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to transfer property';
      logger.error('Failed to transfer property', error, { propertyId });
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  setSelectedProperty: (property: Property | null) => {
    set({ selectedProperty: property });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      ownedProperties: [],
      availableProperties: [],
      foreclosedProperties: [],
      selectedProperty: null,
      loans: [],
      isLoading: false,
      error: null,
    });
    logger.debug('Property store reset');
  },
}));

// Default export
export default usePropertyStore;
