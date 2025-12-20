/**
 * Property Service
 * API client for property ownership, purchase, and management operations
 */

import api from './api';

// ===== Types =====

export interface Property {
  _id: string;
  name: string;
  description: string;
  type: 'saloon' | 'ranch' | 'mine' | 'shop' | 'hotel' | 'warehouse' | 'office';
  location: string;
  tier: number;
  price: number;
  currentValue: number;
  ownerId?: string;
  ownerName?: string;
  status: 'for_sale' | 'owned' | 'foreclosed' | 'under_construction';
  features: PropertyFeature[];
  upgrades: PropertyUpgrade[];
  workers: PropertyWorker[];
  storage: PropertyStorage;
  income: {
    base: number;
    modified: number;
    lastCollection?: string;
  };
  expenses: {
    maintenance: number;
    workers: number;
    total: number;
  };
  condition: number; // 0-100
  purchaseDate?: string;
  lastUpgradeDate?: string;
  image?: string;
}

export interface PropertyFeature {
  id: string;
  name: string;
  description: string;
  effect: string;
  unlocked: boolean;
}

export interface PropertyUpgrade {
  _id: string;
  name: string;
  description: string;
  type: 'storage' | 'income' | 'efficiency' | 'security' | 'aesthetics';
  cost: number;
  effect: {
    type: string;
    value: number;
    unit: string;
  };
  requirements?: {
    tier?: number;
    previousUpgrade?: string;
  };
  isPurchased: boolean;
  purchaseDate?: string;
}

export interface PropertyWorker {
  _id: string;
  npcId: string;
  name: string;
  role: 'manager' | 'guard' | 'clerk' | 'laborer' | 'specialist';
  level: number;
  salary: number;
  efficiency: number;
  morale: number;
  hireDate: string;
  skills: string[];
}

export interface PropertyStorage {
  capacity: number;
  used: number;
  items: StorageItem[];
}

export interface StorageItem {
  itemId: string;
  name: string;
  type: string;
  quantity: number;
  value: number;
}

export interface PropertyListing {
  _id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  tier: number;
  price: number;
  estimatedIncome: number;
  condition: number;
  features: string[];
  isForeclosed: boolean;
  image?: string;
}

export interface PropertyLoan {
  _id: string;
  propertyId: string;
  propertyName: string;
  principalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  nextPaymentDue: string;
  missedPayments: number;
  status: 'active' | 'paid_off' | 'defaulted' | 'foreclosed';
  startDate: string;
  term: number; // months
}

// ===== Request/Response Types =====

export interface PurchasePropertyRequest {
  propertyId: string;
  useFinancing?: boolean;
  downPayment?: number;
}

export interface PurchasePropertyResponse {
  success: boolean;
  property: Property;
  loan?: PropertyLoan;
  newCharacterGold: number;
  message: string;
}

export interface UpgradeTierRequest {
  propertyId: string;
}

export interface UpgradeTierResponse {
  success: boolean;
  property: Property;
  oldTier: number;
  newTier: number;
  cost: number;
  newCharacterGold: number;
  message: string;
}

export interface AddUpgradeRequest {
  upgradeId: string;
}

export interface AddUpgradeResponse {
  success: boolean;
  property: Property;
  upgrade: PropertyUpgrade;
  cost: number;
  newCharacterGold: number;
  message: string;
}

export interface HireWorkerRequest {
  npcId: string;
  role: 'manager' | 'guard' | 'clerk' | 'laborer' | 'specialist';
}

export interface HireWorkerResponse {
  success: boolean;
  property: Property;
  worker: PropertyWorker;
  newCharacterGold: number;
  message: string;
}

export interface FireWorkerRequest {
  workerId: string;
}

export interface FireWorkerResponse {
  success: boolean;
  property: Property;
  severancePay: number;
  newCharacterGold: number;
  message: string;
}

export interface DepositItemRequest {
  itemId: string;
  quantity: number;
}

export interface DepositItemResponse {
  success: boolean;
  property: Property;
  item: StorageItem;
  message: string;
}

export interface WithdrawItemRequest {
  itemId: string;
  quantity: number;
}

export interface WithdrawItemResponse {
  success: boolean;
  property: Property;
  item: StorageItem;
  message: string;
}

export interface MakeLoanPaymentRequest {
  amount: number;
}

export interface MakeLoanPaymentResponse {
  success: boolean;
  loan: PropertyLoan;
  amountPaid: number;
  remainingBalance: number;
  newCharacterGold: number;
  message: string;
}

export interface TransferPropertyRequest {
  targetCharacterId: string;
  price?: number;
}

export interface TransferPropertyResponse {
  success: boolean;
  property: Property;
  newOwnerId: string;
  newOwnerName: string;
  transferPrice?: number;
  message: string;
}

// ===== Property Service =====

export const propertyService = {
  // ===== Public Routes =====

  /**
   * Get property listings for sale
   */
  async getListings(): Promise<PropertyListing[]> {
    const response = await api.get<{ data: { listings: PropertyListing[] } }>(
      '/property/listings'
    );
    return response.data.data?.listings || [];
  },

  /**
   * Get foreclosed property listings
   */
  async getForeclosedListings(): Promise<PropertyListing[]> {
    const response = await api.get<{ data: { listings: PropertyListing[] } }>(
      '/property/foreclosed'
    );
    return response.data.data?.listings || [];
  },

  /**
   * Get property details
   */
  async getPropertyDetails(propertyId: string): Promise<Property> {
    const response = await api.get<{ data: Property }>(`/property/${propertyId}`);
    return response.data.data;
  },

  // ===== Protected Routes =====

  /**
   * Get my properties
   */
  async getMyProperties(): Promise<Property[]> {
    const response = await api.get<{ data: { properties: Property[] } }>(
      '/property/my-properties'
    );
    return response.data.data?.properties || [];
  },

  /**
   * Get my loans
   */
  async getMyLoans(): Promise<PropertyLoan[]> {
    const response = await api.get<{ data: { loans: PropertyLoan[] } }>('/property/loans');
    return response.data.data?.loans || [];
  },

  /**
   * Purchase property
   */
  async purchaseProperty(request: PurchasePropertyRequest): Promise<PurchasePropertyResponse> {
    const response = await api.post<{ data: PurchasePropertyResponse }>(
      '/property/purchase',
      request
    );
    return response.data.data;
  },

  /**
   * Upgrade property tier
   */
  async upgradeTier(propertyId: string): Promise<UpgradeTierResponse> {
    const response = await api.post<{ data: UpgradeTierResponse }>(
      `/property/${propertyId}/upgrade-tier`
    );
    return response.data.data;
  },

  /**
   * Add upgrade to property
   */
  async addUpgrade(propertyId: string, request: AddUpgradeRequest): Promise<AddUpgradeResponse> {
    const response = await api.post<{ data: AddUpgradeResponse }>(
      `/property/${propertyId}/upgrade`,
      request
    );
    return response.data.data;
  },

  /**
   * Hire worker for property
   */
  async hireWorker(propertyId: string, request: HireWorkerRequest): Promise<HireWorkerResponse> {
    const response = await api.post<{ data: HireWorkerResponse }>(
      `/property/${propertyId}/hire`,
      request
    );
    return response.data.data;
  },

  /**
   * Fire worker from property
   */
  async fireWorker(propertyId: string, request: FireWorkerRequest): Promise<FireWorkerResponse> {
    const response = await api.post<{ data: FireWorkerResponse }>(
      `/property/${propertyId}/fire`,
      request
    );
    return response.data.data;
  },

  /**
   * Deposit item into property storage
   */
  async depositItem(
    propertyId: string,
    request: DepositItemRequest
  ): Promise<DepositItemResponse> {
    const response = await api.post<{ data: DepositItemResponse }>(
      `/property/${propertyId}/storage/deposit`,
      request
    );
    return response.data.data;
  },

  /**
   * Withdraw item from property storage
   */
  async withdrawItem(
    propertyId: string,
    request: WithdrawItemRequest
  ): Promise<WithdrawItemResponse> {
    const response = await api.post<{ data: WithdrawItemResponse }>(
      `/property/${propertyId}/storage/withdraw`,
      request
    );
    return response.data.data;
  },

  /**
   * Make loan payment
   */
  async makeLoanPayment(
    loanId: string,
    request: MakeLoanPaymentRequest
  ): Promise<MakeLoanPaymentResponse> {
    const response = await api.post<{ data: MakeLoanPaymentResponse }>(
      `/property/loans/${loanId}/pay`,
      request
    );
    return response.data.data;
  },

  /**
   * Transfer property to another character
   */
  async transferProperty(
    propertyId: string,
    request: TransferPropertyRequest
  ): Promise<TransferPropertyResponse> {
    const response = await api.post<{ data: TransferPropertyResponse }>(
      `/property/${propertyId}/transfer`,
      request
    );
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Filter properties by type
   */
  filterByType(
    properties: Property[] | PropertyListing[],
    type: string
  ): (Property | PropertyListing)[] {
    return properties.filter(property => property.type === type);
  },

  /**
   * Filter properties by location
   */
  filterByLocation(
    properties: Property[] | PropertyListing[],
    location: string
  ): (Property | PropertyListing)[] {
    return properties.filter(property => property.location === location);
  },

  /**
   * Filter properties by tier
   */
  filterByTier(
    properties: Property[] | PropertyListing[],
    tier: number
  ): (Property | PropertyListing)[] {
    return properties.filter(property => property.tier === tier);
  },

  /**
   * Sort properties by price
   */
  sortByPrice(
    properties: PropertyListing[],
    descending: boolean = false
  ): PropertyListing[] {
    return [...properties].sort((a, b) =>
      descending ? b.price - a.price : a.price - b.price
    );
  },

  /**
   * Sort properties by income
   */
  sortByIncome(properties: Property[], descending: boolean = true): Property[] {
    return [...properties].sort((a, b) =>
      descending
        ? b.income.modified - a.income.modified
        : a.income.modified - b.income.modified
    );
  },

  /**
   * Calculate net income (income - expenses)
   */
  calculateNetIncome(property: Property): number {
    return property.income.modified - property.expenses.total;
  },

  /**
   * Calculate property ROI (annual)
   */
  calculateROI(property: Property): number {
    const netIncome = this.calculateNetIncome(property);
    const annualIncome = netIncome * 365; // Assuming daily income
    return (annualIncome / property.currentValue) * 100;
  },

  /**
   * Calculate storage space available
   */
  calculateAvailableStorage(property: Property): number {
    return property.storage.capacity - property.storage.used;
  },

  /**
   * Check if property needs maintenance
   */
  needsMaintenance(property: Property): boolean {
    return property.condition < 70;
  },

  /**
   * Get property condition status
   */
  getConditionStatus(condition: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (condition >= 90) return 'excellent';
    if (condition >= 70) return 'good';
    if (condition >= 50) return 'fair';
    if (condition >= 30) return 'poor';
    return 'critical';
  },

  /**
   * Calculate total worker salaries
   */
  calculateTotalWorkerSalaries(workers: PropertyWorker[]): number {
    return workers.reduce((total, worker) => total + worker.salary, 0);
  },

  /**
   * Calculate average worker efficiency
   */
  calculateAverageWorkerEfficiency(workers: PropertyWorker[]): number {
    if (workers.length === 0) return 0;
    const total = workers.reduce((sum, worker) => sum + worker.efficiency, 0);
    return total / workers.length;
  },

  /**
   * Check if can afford upgrade
   */
  canAffordUpgrade(characterGold: number, upgradeCost: number): boolean {
    return characterGold >= upgradeCost;
  },

  /**
   * Check if upgrade requirements are met
   */
  meetsUpgradeRequirements(
    property: Property,
    upgrade: PropertyUpgrade
  ): boolean {
    if (!upgrade.requirements) return true;

    if (upgrade.requirements.tier && property.tier < upgrade.requirements.tier) {
      return false;
    }

    if (upgrade.requirements.previousUpgrade) {
      const hasPrevious = property.upgrades.some(
        u => u._id === upgrade.requirements?.previousUpgrade && u.isPurchased
      );
      if (!hasPrevious) return false;
    }

    return true;
  },

  /**
   * Calculate loan monthly payment
   */
  calculateMonthlyPayment(
    principal: number,
    interestRate: number,
    term: number
  ): number {
    const monthlyRate = interestRate / 12 / 100;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);
    return Math.ceil(payment);
  },

  /**
   * Check if loan is at risk of foreclosure
   */
  isLoanAtRisk(loan: PropertyLoan): boolean {
    return loan.missedPayments >= 2 || loan.status === 'defaulted';
  },

  /**
   * Calculate days until next loan payment
   */
  daysUntilNextPayment(loan: PropertyLoan): number {
    const nextPayment = new Date(loan.nextPaymentDue).getTime();
    const now = Date.now();
    const diff = nextPayment - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },

  /**
   * Get property type icon/emoji
   */
  getPropertyTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      saloon: '🍺',
      ranch: '🐴',
      mine: '⛏️',
      shop: '🏪',
      hotel: '🏨',
      warehouse: '📦',
      office: '🏢',
    };
    return icons[type] || '🏠';
  },
};

export default propertyService;
