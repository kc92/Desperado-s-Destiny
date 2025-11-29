/**
 * Property Tax System Types
 *
 * Shared types for property taxation, consequences, and foreclosure
 */

// Import PropertySize from property.types to avoid duplication
import { PropertySize } from './property.types';

/**
 * Property size tax configurations
 */
export const PROPERTY_SIZE_TAX_CONFIG = {
  [PropertySize.SMALL]: {
    name: 'Small Property',
    baseWeeklyTax: 75, // 50-100 range
    minValue: 500,
    maxValue: 2000,
  },
  [PropertySize.MEDIUM]: {
    name: 'Medium Property',
    baseWeeklyTax: 175, // 100-250 range
    minValue: 2000,
    maxValue: 5000,
  },
  [PropertySize.LARGE]: {
    name: 'Large Property',
    baseWeeklyTax: 375, // 250-500 range
    minValue: 5000,
    maxValue: 15000,
  },
  [PropertySize.HUGE]: {
    name: 'Huge Property',
    baseWeeklyTax: 750, // 500-1000 range
    minValue: 15000,
    maxValue: 50000,
  },
} as const;

/**
 * Tax types
 */
export enum TaxType {
  PROPERTY_TAX = 'property_tax', // Based on property value
  INCOME_TAX = 'income_tax', // Based on production income
  UPKEEP = 'upkeep', // Maintenance costs
  FRONTIER_TAX = 'frontier_tax', // Protection money in lawless areas
  COALITION_TRIBUTE = 'coalition_tribute', // Payment to Native lands
  MILITARY_LEVY = 'military_levy', // Fort Ashford war tax
}

/**
 * Special tax types based on location
 */
export enum SpecialTaxType {
  NONE = 'none',
  FRONTIER = 'frontier', // Lawless areas
  COALITION = 'coalition', // Native lands
  MILITARY = 'military', // Fort Ashford during conflicts
}

/**
 * Tax payment status
 */
export enum TaxPaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  LATE = 'late',
  DELINQUENT = 'delinquent',
  FORECLOSED = 'foreclosed',
}

/**
 * Delinquency stage
 */
export enum DelinquencyStage {
  CURRENT = 'current', // No issues
  GRACE_PERIOD = 'grace_period', // Days 1-7: 5% late fee
  LATE_PAYMENT = 'late_payment', // Days 8-14: 15% penalty
  DELINQUENT = 'delinquent', // Days 15-21: 25% penalty
  FORECLOSURE = 'foreclosure', // Day 22+: Property seized
}

/**
 * Delinquency stage configurations
 */
export const DELINQUENCY_CONFIG = {
  [DelinquencyStage.CURRENT]: {
    name: 'Current',
    dayRange: [0, 0],
    penaltyPercent: 0,
    productionMultiplier: 1.0,
    workersLeave: false,
    propertyLocked: false,
    canUpgrade: true,
    description: 'All taxes paid on time',
  },
  [DelinquencyStage.GRACE_PERIOD]: {
    name: 'Grace Period',
    dayRange: [1, 7],
    penaltyPercent: 5,
    productionMultiplier: 1.0,
    workersLeave: false,
    propertyLocked: false,
    canUpgrade: true,
    description: 'Warning notices sent. 5% late fee.',
  },
  [DelinquencyStage.LATE_PAYMENT]: {
    name: 'Late Payment',
    dayRange: [8, 14],
    penaltyPercent: 15,
    productionMultiplier: 0.5,
    workersLeave: true,
    propertyLocked: false,
    canUpgrade: false,
    description: 'Production reduced 50%. Workers may leave. Cannot upgrade.',
  },
  [DelinquencyStage.DELINQUENT]: {
    name: 'Delinquent',
    dayRange: [15, 21],
    penaltyPercent: 25,
    productionMultiplier: 0.0,
    workersLeave: true,
    propertyLocked: true,
    canUpgrade: false,
    description: 'Production halted. Property locked. Auction notice posted.',
  },
  [DelinquencyStage.FORECLOSURE]: {
    name: 'Foreclosure',
    dayRange: [22, 999],
    penaltyPercent: 0, // Property seized, no more penalties
    productionMultiplier: 0.0,
    workersLeave: true,
    propertyLocked: true,
    canUpgrade: false,
    description: 'Property seized and auctioned. Permanent reputation damage.',
  },
} as const;

/**
 * Auction status
 */
export enum AuctionStatus {
  PENDING = 'pending', // Not yet started
  ACTIVE = 'active', // Accepting bids
  COMPLETED = 'completed', // Winner determined
  CANCELLED = 'cancelled', // Owner paid debt
  FAILED = 'failed', // No bids, property returned to bank
}

/**
 * Bankruptcy status
 */
export enum BankruptcyStatus {
  NONE = 'none',
  ACTIVE = 'active', // Currently in bankruptcy protection
  RESOLVED = 'resolved', // Successfully resolved
  FAILED = 'failed', // Could not pay, forced sale
}

/**
 * Tax calculation breakdown
 */
export interface TaxCalculation {
  propertyTax: number;
  incomeTax: number;
  upkeepCosts: number;
  specialTax: number;
  totalTax: number;
  dueDate: Date;
}

/**
 * Property tax record
 */
export interface PropertyTaxRecord {
  _id: string;
  propertyId: string; // Could be GangBase ID or future property ID
  propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other';
  ownerId: string; // Gang ID or Character ID
  ownerName: string;
  propertySize: PropertySize;
  propertyValue: number;
  propertyTier: number;
  weeklyIncome: number;
  taxCalculation: TaxCalculation;
  paymentStatus: TaxPaymentStatus;
  dueDate: Date;
  paidDate?: Date;
  amountPaid?: number;
  autoPayEnabled: boolean;
  specialTaxType: SpecialTaxType;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tax delinquency record
 */
export interface TaxDelinquencyRecord {
  _id: string;
  propertyId: string;
  ownerId: string;
  ownerName: string;
  originalDebtAmount: number;
  currentDebtAmount: number; // With penalties
  daysOverdue: number;
  delinquencyStage: DelinquencyStage;
  penaltyAmount: number;
  firstMissedPayment: Date;
  lastWarningDate?: Date;
  warningsSent: number;
  productionReduced: boolean;
  workersLeft: boolean;
  propertyLocked: boolean;
  auctionScheduled: boolean;
  auctionId?: string;
  bankruptcyStatus: BankruptcyStatus;
  bankruptcyFiledDate?: Date;
  bankruptcyEndsDate?: Date;
  reputationPenalty: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auction bid
 */
export interface AuctionBid {
  bidderId: string;
  bidderName: string;
  bidAmount: number;
  bidTime: Date;
  isValid: boolean;
}

/**
 * Property auction
 */
export interface PropertyAuction {
  _id: string;
  propertyId: string;
  propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other';
  originalOwnerId: string;
  originalOwnerName: string;
  delinquencyId: string;
  propertyValue: number;
  minimumBid: number; // 50% of property value
  currentBid: number;
  currentBidderId?: string;
  currentBidderName?: string;
  bids: AuctionBid[];
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  completedTime?: Date;
  winnerId?: string;
  winnerName?: string;
  finalPrice?: number;
  debtOwed: number;
  proceedsToOwner: number; // Amount after paying debt
  reputationImpact: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tax payment request
 */
export interface TaxPaymentRequest {
  propertyId: string;
  payerId: string;
  amount: number;
  paymentMethod: 'manual' | 'auto';
}

/**
 * Enable auto-pay request
 */
export interface EnableAutoPayRequest {
  propertyId: string;
  ownerId: string;
  enabled: boolean;
}

/**
 * Declare bankruptcy request
 */
export interface DeclareBankruptcyRequest {
  propertyId: string;
  ownerId: string;
}

/**
 * Place auction bid request
 */
export interface PlaceAuctionBidRequest {
  auctionId: string;
  bidderId: string;
  bidAmount: number;
}

/**
 * Tax system constants
 */
export const TAX_CONSTANTS = {
  // Tax rates
  INCOME_TAX_RATE: 0.1, // 10% of weekly income
  MINIMUM_INCOME_TAX: 25, // Minimum gold
  TIER_MULTIPLIER_MIN: 1.0,
  TIER_MULTIPLIER_MAX: 2.5,
  TIER_MULTIPLIER_INCREMENT: 0.3, // Per tier above 1

  // Special tax rates
  FRONTIER_TAX_RATE: 0.15, // 15% of property value (protection money)
  COALITION_TRIBUTE_MULTIPLIER: 1.2, // 20% more than normal tax
  MILITARY_LEVY_RATE: 0.25, // 25% surcharge during war

  // Upkeep costs per week
  WORKER_WAGE_PER_LEVEL: 10, // 10 gold per worker level per week
  MATERIAL_COST_BASE: 25, // Base material costs
  MATERIAL_COST_PER_TIER: 25, // Additional per tier
  REPAIR_COST_CONDITION_MULTIPLIER: 2, // Multiplier based on poor condition
  INSURANCE_COST_PERCENT: 0.05, // 5% of property value (optional)

  // Payment timing
  COLLECTION_DAY: 0, // Sunday (0 = Sunday in JS)
  GRACE_PERIOD_DAYS: 3,
  LATE_PAYMENT_DAYS: 7,
  DELINQUENT_DAYS: 14,
  FORECLOSURE_DAYS: 22,
  WARNING_BEFORE_DUE: 24, // Hours

  // Penalties
  LATE_FEE_PERCENT: 0.05, // 5%
  LATE_PENALTY_PERCENT: 0.15, // 15%
  DELINQUENT_PENALTY_PERCENT: 0.25, // 25%
  REPUTATION_PENALTY_PER_WEEK: -5,
  FORECLOSURE_REPUTATION_PENALTY: -50,

  // Auction settings
  AUCTION_NOTICE_HOURS: 48, // 48 hours before auction starts
  AUCTION_DURATION_HOURS: 24, // 24 hours to bid
  MINIMUM_BID_PERCENT: 0.5, // 50% of property value
  BID_INCREMENT_PERCENT: 0.05, // Must bid 5% more than current
  AUCTION_TIER_RESET: 1, // Property resets to tier 1

  // Bankruptcy
  BANKRUPTCY_COOLDOWN_DAYS: 30, // Can only declare once per 30 days
  BANKRUPTCY_FREEZE_DAYS: 14, // 14 days to resolve
  BANKRUPTCY_FORCED_SALE_PERCENT: 0.3, // Sell at 30% value if can't pay
  BANKRUPTCY_REPUTATION_PENALTY: -25,
} as const;

/**
 * Tax notification types
 */
export enum TaxNotificationType {
  PAYMENT_DUE_SOON = 'payment_due_soon', // 24h before due
  PAYMENT_OVERDUE = 'payment_overdue', // Entered grace period
  ENTERING_DELINQUENCY = 'entering_delinquency', // About to become delinquent
  AUCTION_NOTICE = 'auction_notice', // Auction scheduled
  AUCTION_OUTBID = 'auction_outbid', // Someone outbid you
  AUCTION_WON = 'auction_won', // You won the auction
  AUCTION_LOST = 'auction_lost', // You lost the auction
  FORECLOSURE_COMPLETE = 'foreclosure_complete', // Property seized
  BANKRUPTCY_APPROVED = 'bankruptcy_approved', // Bankruptcy protection granted
  BANKRUPTCY_ENDING = 'bankruptcy_ending', // Bankruptcy period ending soon
}

/**
 * Weekly tax summary for a property
 */
export interface WeeklyTaxSummary {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  totalTaxDue: number;
  breakdown: {
    propertyTax: number;
    incomeTax: number;
    upkeep: number;
    specialTax: number;
  };
  dueDate: Date;
  isPaid: boolean;
  autoPayEnabled: boolean;
  delinquencyStatus?: DelinquencyStage;
  daysOverdue?: number;
}

/**
 * Owner tax summary (all properties)
 */
export interface OwnerTaxSummary {
  ownerId: string;
  ownerName: string;
  ownerType: 'gang' | 'character';
  properties: WeeklyTaxSummary[];
  totalTaxDue: number;
  totalPaid: number;
  totalOverdue: number;
  propertiesAtRisk: number;
  bankruptcyAvailable: boolean;
  lastBankruptcy?: Date;
}
