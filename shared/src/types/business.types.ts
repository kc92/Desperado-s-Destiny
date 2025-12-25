/**
 * Business Ownership System Types
 *
 * Phase 12: Business Ownership
 * Transforms player-owned properties into operational businesses with:
 * - NPC customer traffic simulation
 * - Service and product pricing control
 * - Player-to-player service transactions
 * - Revenue accumulation (visit-to-collect pattern)
 */

import type { PropertyType } from './production.types';
import type { WorkerSpecialization } from './production.types';

/**
 * Business types available in the game
 * Type-locked to property types (e.g., Saloon property -> SALOON/BREWERY business)
 */
export enum PlayerBusinessType {
  // Service Businesses (provide services to customers)
  SALOON = 'saloon',                 // Drinks, entertainment, gambling, lodging
  GENERAL_STORE = 'general_store',   // Buy/sell goods, player shops
  BLACKSMITH = 'blacksmith',         // Repair, upgrade, custom orders
  STABLE = 'stable',                 // Horse boarding, training, breeding
  DOCTOR_OFFICE = 'doctor_office',   // Healing, medicine
  BANK_BRANCH = 'bank_branch',       // Loans, deposits for other players

  // Production Businesses (produce goods for sale)
  BREWERY = 'brewery',               // Alcohol production
  TANNERY = 'tannery',               // Leather goods
  GUNSMITH = 'gunsmith',             // Weapons, ammunition
  RANCH = 'ranch',                   // Livestock, crops
  MINING_OPERATION = 'mining_operation', // Ore processing
}

/**
 * Player business categories (distinct from gang businesses)
 */
export enum PlayerBusinessCategory {
  SERVICE = 'service',               // Provides services
  PRODUCTION = 'production',         // Produces goods
}

/**
 * Service categories for service businesses
 */
export enum BusinessServiceCategory {
  // Saloon
  DRINKS = 'drinks',
  FOOD = 'food',
  ENTERTAINMENT = 'entertainment',
  GAMBLING = 'gambling',
  LODGING = 'lodging',

  // General Store
  RETAIL = 'retail',
  BROKERAGE = 'brokerage',

  // Blacksmith
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
  CUSTOM_CRAFTING = 'custom_crafting',

  // Stable
  BOARDING = 'boarding',
  TRAINING = 'training',
  BREEDING = 'breeding',

  // Doctor
  HEALING = 'healing',
  MEDICINE = 'medicine',
  SURGERY = 'surgery',

  // Bank
  LOANS = 'loans',
  DEPOSITS = 'deposits',
  EXCHANGE = 'exchange',
}

/**
 * Player business status lifecycle (distinct from gang businesses)
 */
export enum PlayerBusinessStatus {
  ESTABLISHING = 'establishing',     // Being set up
  ACTIVE = 'active',                 // Fully operational
  CLOSED = 'closed',                 // Temporarily closed (by owner)
  SUSPENDED = 'suspended',           // Suspended (unpaid taxes/fees)
  BANKRUPT = 'bankrupt',             // Failed due to debt
}

/**
 * Operating hours mode
 */
export enum OperatingHoursMode {
  ALWAYS_OPEN = 'always_open',       // 24/7 operation
  DAY_ONLY = 'day_only',             // 6am - 10pm
  NIGHT_ONLY = 'night_only',         // 8pm - 6am
  CUSTOM = 'custom',                 // Custom schedule
}

/**
 * Property type to available business types mapping
 * Defines which business types can be established on each property type
 */
export const PROPERTY_BUSINESS_MAPPING: Record<PropertyType, PlayerBusinessType[]> = {
  saloon: [PlayerBusinessType.SALOON, PlayerBusinessType.BREWERY],
  shop: [PlayerBusinessType.GENERAL_STORE, PlayerBusinessType.BANK_BRANCH],
  workshop: [PlayerBusinessType.BLACKSMITH, PlayerBusinessType.GUNSMITH, PlayerBusinessType.TANNERY],
  stable: [PlayerBusinessType.STABLE],
  ranch: [PlayerBusinessType.RANCH],
  mine: [PlayerBusinessType.MINING_OPERATION],
  homestead: [PlayerBusinessType.DOCTOR_OFFICE],
};

/**
 * Business type metadata
 */
export const BUSINESS_TYPE_INFO: Record<PlayerBusinessType, {
  name: string;
  description: string;
  category: PlayerBusinessCategory;
  propertyTypes: PropertyType[];
  baseTrafficRate: number;       // NPCs/hour at 100 reputation, tier 1
  establishmentCostMultiplier: number; // Multiplier on property value
  defaultServices?: BusinessServiceCategory[];
}> = {
  [PlayerBusinessType.SALOON]: {
    name: 'Saloon',
    description: 'A place for drinks, entertainment, and socializing',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['saloon'] as PropertyType[],
    baseTrafficRate: 3,
    establishmentCostMultiplier: 1.5,
    defaultServices: [
      BusinessServiceCategory.DRINKS,
      BusinessServiceCategory.FOOD,
      BusinessServiceCategory.ENTERTAINMENT,
      BusinessServiceCategory.GAMBLING,
      BusinessServiceCategory.LODGING,
    ],
  },
  [PlayerBusinessType.GENERAL_STORE]: {
    name: 'General Store',
    description: 'Retail business selling goods to customers',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['shop'] as PropertyType[],
    baseTrafficRate: 4,
    establishmentCostMultiplier: 1.3,
    defaultServices: [BusinessServiceCategory.RETAIL, BusinessServiceCategory.BROKERAGE],
  },
  [PlayerBusinessType.BLACKSMITH]: {
    name: 'Blacksmith',
    description: 'Metalworking and equipment services',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['workshop'] as PropertyType[],
    baseTrafficRate: 2,
    establishmentCostMultiplier: 1.4,
    defaultServices: [
      BusinessServiceCategory.REPAIR,
      BusinessServiceCategory.UPGRADE,
      BusinessServiceCategory.CUSTOM_CRAFTING,
    ],
  },
  [PlayerBusinessType.STABLE]: {
    name: 'Stable',
    description: 'Horse boarding, training, and breeding services',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['stable'] as PropertyType[],
    baseTrafficRate: 2,
    establishmentCostMultiplier: 1.4,
    defaultServices: [
      BusinessServiceCategory.BOARDING,
      BusinessServiceCategory.TRAINING,
      BusinessServiceCategory.BREEDING,
    ],
  },
  [PlayerBusinessType.DOCTOR_OFFICE]: {
    name: "Doctor's Office",
    description: 'Medical services and healing',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['homestead'] as PropertyType[],
    baseTrafficRate: 2,
    establishmentCostMultiplier: 1.6,
    defaultServices: [
      BusinessServiceCategory.HEALING,
      BusinessServiceCategory.MEDICINE,
      BusinessServiceCategory.SURGERY,
    ],
  },
  [PlayerBusinessType.BANK_BRANCH]: {
    name: 'Bank Branch',
    description: 'Financial services for other players',
    category: PlayerBusinessCategory.SERVICE,
    propertyTypes: ['shop'] as PropertyType[],
    baseTrafficRate: 1,
    establishmentCostMultiplier: 2.0,
    defaultServices: [
      BusinessServiceCategory.LOANS,
      BusinessServiceCategory.DEPOSITS,
      BusinessServiceCategory.EXCHANGE,
    ],
  },
  [PlayerBusinessType.BREWERY]: {
    name: 'Brewery',
    description: 'Produces alcoholic beverages for sale',
    category: PlayerBusinessCategory.PRODUCTION,
    propertyTypes: ['saloon'] as PropertyType[],
    baseTrafficRate: 1,
    establishmentCostMultiplier: 1.5,
  },
  [PlayerBusinessType.TANNERY]: {
    name: 'Tannery',
    description: 'Produces leather goods from animal hides',
    category: PlayerBusinessCategory.PRODUCTION,
    propertyTypes: ['workshop'] as PropertyType[],
    baseTrafficRate: 1,
    establishmentCostMultiplier: 1.3,
  },
  [PlayerBusinessType.GUNSMITH]: {
    name: 'Gunsmith',
    description: 'Produces and repairs firearms and ammunition',
    category: PlayerBusinessCategory.PRODUCTION,
    propertyTypes: ['workshop'] as PropertyType[],
    baseTrafficRate: 2,
    establishmentCostMultiplier: 1.6,
  },
  [PlayerBusinessType.RANCH]: {
    name: 'Ranch',
    description: 'Raises livestock and grows crops for sale',
    category: PlayerBusinessCategory.PRODUCTION,
    propertyTypes: ['ranch'] as PropertyType[],
    baseTrafficRate: 1,
    establishmentCostMultiplier: 1.2,
  },
  [PlayerBusinessType.MINING_OPERATION]: {
    name: 'Mining Operation',
    description: 'Extracts and processes ore for sale',
    category: PlayerBusinessCategory.PRODUCTION,
    propertyTypes: ['mine'] as PropertyType[],
    baseTrafficRate: 1,
    establishmentCostMultiplier: 1.4,
  },
};

/**
 * Business service definition (what services a business can offer)
 */
export interface IBusinessServiceDefinition {
  serviceId: string;
  name: string;
  description: string;
  category: BusinessServiceCategory;
  businessTypes: PlayerBusinessType[];
  basePrice: number;
  baseDuration: number;           // Minutes
  requiredWorkerSpecialization?: WorkerSpecialization;
  requiredTier?: number;          // Minimum business tier
  energyCost?: number;            // Energy cost for customer
  customerSatisfactionBase: number; // Base satisfaction 0-100
  cooldownMinutes?: number;       // Time before same customer can use again
}

/**
 * Active service on a business (instance of a service definition)
 */
export interface IBusinessService {
  serviceId: string;
  name: string;
  category: BusinessServiceCategory;
  basePrice: number;
  currentPrice: number;           // Owner-set price
  duration: number;               // Minutes
  isActive: boolean;
  requiredWorkerSpecialization?: WorkerSpecialization;
  assignedWorkerId?: string;
  totalServiced: number;          // Historical count
  lastServicedAt?: Date;
}

/**
 * Business product definition (for production businesses)
 */
export interface IBusinessProductDefinition {
  productId: string;
  name: string;
  description: string;
  businessTypes: PlayerBusinessType[];
  basePrice: number;
  productionTimeMinutes: number;
  requiredMaterials: Array<{ itemId: string; quantity: number }>;
  requiredWorkerSpecialization?: WorkerSpecialization;
  requiredTier?: number;
  outputQuantity: number;
}

/**
 * Active product listing on a business
 */
export interface IBusinessProduct {
  productId: string;
  itemId: string;                 // Game item ID
  name: string;
  currentPrice: number;           // Owner-set price
  stockLevel: number;             // Current inventory
  maxStock: number;               // Maximum storage
  autoSellEnabled: boolean;       // Auto-sell to NPC buyers
  autoRestockEnabled: boolean;    // Auto-produce when low
  restockThreshold: number;       // Produce when stock below this
  totalSold: number;              // Historical count
}

/**
 * Staff assignment for a business
 */
export interface IStaffAssignment {
  workerId: string;
  workerName: string;
  specialization: WorkerSpecialization;
  role: 'service' | 'production' | 'sales' | 'management';
  serviceId?: string;             // If assigned to specific service
  productId?: string;             // If assigned to specific product
  efficiency: number;             // Worker's efficiency modifier
  assignedAt: Date;
}

/**
 * Business reputation system
 */
export interface IBusinessReputation {
  overall: number;                // 0-100, weighted average
  serviceQuality: number;         // 0-100, based on worker skills
  priceValue: number;             // 0-100, based on prices vs market
  availability: number;           // 0-100, based on service availability
  cleanliness: number;            // 0-100, based on property condition
  lastUpdated: Date;
}

/**
 * Operating hours schedule
 */
export interface IOperatingHours {
  mode: OperatingHoursMode;
  customSchedule?: {
    open: number;                 // Hour of day (0-23)
    close: number;                // Hour of day (0-23)
    daysOpen: number[];           // 0=Sunday, 6=Saturday
  };
}

/**
 * Customer traffic stats
 */
export interface ITrafficStats {
  todayVisitors: number;
  todayRevenue: number;
  weeklyVisitors: number;
  weeklyRevenue: number;
  monthlyVisitors: number;
  monthlyRevenue: number;
  peakHour: number;               // 0-23
  averageSatisfaction: number;    // 0-100
}

/**
 * Main Business interface
 */
export interface IBusiness {
  _id: string;

  // Links
  propertyId: string;             // Parent property
  characterId: string;            // Owner
  locationId: string;             // Cached for queries

  // Identity
  businessType: PlayerBusinessType;
  businessName: string;
  description?: string;
  tier: number;                   // 1-5, synced with property

  // Status
  status: PlayerBusinessStatus;
  establishedAt: Date;
  lastActiveAt: Date;

  // Services (for service businesses)
  services: IBusinessService[];

  // Products (for production businesses)
  products: IBusinessProduct[];

  // Staff
  staffAssignments: IStaffAssignment[];
  maxStaff: number;               // Based on tier

  // Reputation
  reputation: IBusinessReputation;

  // Operating Hours
  operatingHours: IOperatingHours;

  // Traffic & Revenue
  baseTrafficRate: number;        // NPCs/hour at 100 reputation
  currentTrafficRate: number;     // Calculated with all modifiers
  pendingRevenue: number;         // Visit-to-collect
  lastRevenueCollection: Date;
  maxPendingRevenue: number;      // 7-day cap

  // Statistics
  totalCustomersServed: number;
  totalRevenue: number;
  totalExpenses: number;
  trafficStats: ITrafficStats;

  // P2P Transaction Settings
  allowPlayerCustomers: boolean;
  playerServicePremium: number;   // % markup for player customers (0-100)

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business service record (transaction log)
 */
export interface IBusinessServiceRecord {
  _id: string;
  businessId: string;
  serviceId?: string;
  productId?: string;

  // Transaction type
  transactionType: 'service' | 'product_sale' | 'p2p_service';

  // Customer
  customerId?: string;            // Character ID (null for NPC)
  customerName: string;
  isNPC: boolean;

  // Details
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  workerIds: string[];

  // Satisfaction
  satisfaction: number;           // 0-100
  tipAmount: number;

  // Timing
  startedAt: Date;
  completedAt: Date;
  duration: number;               // Minutes

  // Metadata
  createdAt: Date;
}

/**
 * Customer traffic record (aggregated)
 */
export interface ICustomerTraffic {
  _id: string;
  businessId: string;
  locationId: string;
  date: Date;                     // Day (midnight)
  hour: number;                   // 0-23

  // Counts
  npcVisitors: number;
  playerVisitors: number;
  totalVisitors: number;

  // Revenue
  npcRevenue: number;
  playerRevenue: number;
  totalRevenue: number;

  // Satisfaction
  averageSatisfaction: number;
  complaints: number;

  // Metadata
  createdAt: Date;
}

/**
 * Business tier configuration
 */
export type BusinessTier = 1 | 2 | 3 | 4 | 5;

export const BUSINESS_TIER_INFO: Record<BusinessTier, {
  name: string;
  trafficMultiplier: number;
  maxServices: number;
  maxProducts: number;
  maxStaff: number;
  reputationDecayRate: number;    // Per day if inactive
  maxPendingRevenueDays: number;
}> = {
  1: {
    name: 'Startup',
    trafficMultiplier: 1.0,
    maxServices: 3,
    maxProducts: 3,
    maxStaff: 1,
    reputationDecayRate: 2,
    maxPendingRevenueDays: 3,
  },
  2: {
    name: 'Established',
    trafficMultiplier: 1.5,
    maxServices: 5,
    maxProducts: 5,
    maxStaff: 2,
    reputationDecayRate: 1.5,
    maxPendingRevenueDays: 5,
  },
  3: {
    name: 'Prosperous',
    trafficMultiplier: 2.0,
    maxServices: 7,
    maxProducts: 7,
    maxStaff: 4,
    reputationDecayRate: 1.0,
    maxPendingRevenueDays: 7,
  },
  4: {
    name: 'Renowned',
    trafficMultiplier: 3.0,
    maxServices: 10,
    maxProducts: 10,
    maxStaff: 6,
    reputationDecayRate: 0.75,
    maxPendingRevenueDays: 10,
  },
  5: {
    name: 'Legendary',
    trafficMultiplier: 4.0,
    maxServices: 15,
    maxProducts: 15,
    maxStaff: 10,
    reputationDecayRate: 0.5,
    maxPendingRevenueDays: 14,
  },
};

/**
 * Daily revenue targets by tier (active management)
 */
export const BUSINESS_REVENUE_TARGETS: Record<BusinessTier, {
  dailyTarget: number;
  maxPending: number;
}> = {
  1: { dailyTarget: 500, maxPending: 1500 },
  2: { dailyTarget: 1500, maxPending: 7500 },
  3: { dailyTarget: 4000, maxPending: 28000 },
  4: { dailyTarget: 10000, maxPending: 100000 },
  5: { dailyTarget: 25000, maxPending: 350000 },
};

// =============================================================================
// Request/Response Types
// =============================================================================

/**
 * Establish business request
 */
export interface EstablishBusinessRequest {
  characterId: string;
  propertyId: string;
  businessType: PlayerBusinessType;
  businessName: string;
  description?: string;
}

/**
 * Update service price request
 */
export interface UpdateServicePriceRequest {
  characterId: string;
  businessId: string;
  serviceId: string;
  newPrice: number;
}

/**
 * Update product price request
 */
export interface UpdateProductPriceRequest {
  characterId: string;
  businessId: string;
  productId: string;
  newPrice: number;
}

/**
 * Toggle service request
 */
export interface ToggleServiceRequest {
  characterId: string;
  businessId: string;
  serviceId: string;
  isActive: boolean;
}

/**
 * Assign staff request
 */
export interface AssignStaffRequest {
  characterId: string;
  businessId: string;
  workerId: string;
  role: 'service' | 'production' | 'sales' | 'management';
  serviceId?: string;
  productId?: string;
}

/**
 * Remove staff request
 */
export interface RemoveStaffRequest {
  characterId: string;
  businessId: string;
  workerId: string;
}

/**
 * Update operating hours request
 */
export interface UpdateOperatingHoursRequest {
  characterId: string;
  businessId: string;
  operatingHours: IOperatingHours;
}

/**
 * Collect revenue request
 */
export interface CollectRevenueRequest {
  characterId: string;
  businessId: string;
}

/**
 * Purchase service request (player customer)
 */
export interface PurchaseServiceRequest {
  customerId: string;             // Player character ID
  businessId: string;
  serviceId: string;
}

/**
 * Purchase product request
 */
export interface PurchaseProductRequest {
  customerId: string;
  businessId: string;
  productId: string;
  quantity: number;
}

/**
 * Business list response
 */
export interface BusinessListResponse {
  businesses: IBusiness[];
  total: number;
}

/**
 * Business details response
 */
export interface BusinessDetailsResponse {
  business: IBusiness;
  property: {
    propertyId: string;
    propertyName: string;
    tier: number;
    condition: number;
  };
  recentTransactions: IBusinessServiceRecord[];
}

/**
 * Revenue collection response
 */
export interface CollectRevenueResponse {
  collectedAmount: number;
  newPendingRevenue: number;
  businessId: string;
}

/**
 * Business statistics response
 */
export interface BusinessStatisticsResponse {
  businessId: string;
  period: 'day' | 'week' | 'month' | 'all';
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  customersServed: number;
  averageSatisfaction: number;
  topServices: Array<{ serviceId: string; name: string; revenue: number; count: number }>;
  topProducts: Array<{ productId: string; name: string; revenue: number; count: number }>;
  trafficByHour: Array<{ hour: number; visitors: number; revenue: number }>;
}

/**
 * Available businesses at location response
 */
export interface LocationBusinessesResponse {
  locationId: string;
  locationName: string;
  businesses: Array<{
    businessId: string;
    businessName: string;
    businessType: PlayerBusinessType;
    ownerName: string;
    reputation: number;
    isOpen: boolean;
    services: Array<{ serviceId: string; name: string; price: number; available: boolean }>;
    products: Array<{ productId: string; name: string; price: number; stock: number }>;
  }>;
}

/**
 * Service request result (for P2P transactions)
 */
export interface ServiceRequestResult {
  success: boolean;
  transactionId?: string;
  serviceName: string;
  totalCost: number;
  estimatedDuration: number;
  completionTime?: Date;
  message: string;
}
