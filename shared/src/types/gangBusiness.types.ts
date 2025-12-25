/**
 * Gang Business Types
 *
 * Phase 15: Gang Businesses
 *
 * Types for gang-owned businesses, protection rackets, and revenue sharing.
 */


/**
 * Business ownership type
 */
export type BusinessOwnerType = 'individual' | 'gang';

/**
 * Gang business role - how the business is operated
 */
export type GangBusinessRole = 'operated' | 'subsidiary';

/**
 * Protection contract status lifecycle
 */
export enum ProtectionStatus {
  OFFERED = 'offered',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  REFUSED = 'refused',
}

/**
 * Protection tier levels
 */
export enum ProtectionTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

/**
 * Gang business actions for permission checking
 */
export enum GangBusinessAction {
  VIEW = 'view',
  WORK = 'work',
  COLLECT = 'collect',
  SET_PRICES = 'set_prices',
  ASSIGN_STAFF = 'assign_staff',
  PURCHASE = 'purchase',
  SELL = 'sell',
  TRANSFER = 'transfer',
  SET_MANAGER = 'set_manager',
}

/**
 * Business ownership info returned by getOwnershipInfo()
 */
export interface IBusinessOwnershipInfo {
  type: BusinessOwnerType;
  ownerId: string;
  ownerName?: string;
  managerId?: string;
  managerName?: string;
  gangRole?: GangBusinessRole;
  revenueSharePercent?: number;
}

/**
 * Revenue share calculation result
 */
export interface IGangRevenueShare {
  gangShare: number;
  managerShare: number;
  totalAmount: number;
}

/**
 * Gang business summary for dashboard
 */
export interface IGangBusinessSummary {
  total: number;
  byType: Record<string, number>;
  byZone: Record<string, number>;
  totalPendingRevenue: number;
  weeklyRevenue: number;
  businesses: IGangBusinessListItem[];
}

/**
 * Individual business in gang business list
 */
export interface IGangBusinessListItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  pendingRevenue: number;
  reputation: number;
  managerId?: string;
  managerName?: string;
  gangRole: GangBusinessRole;
  revenueSharePercent: number;
}

/**
 * Protection contract interface
 */
export interface IProtectionContract {
  _id: string;
  businessId: string;
  businessName: string;
  businessOwnerId: string;
  businessOwnerName: string;
  gangId: string;
  gangName: string;

  // Terms
  tier: ProtectionTier;
  protectionFeePercent: number;
  weeklyMinimum: number;
  status: ProtectionStatus;

  // Benefits
  incidentReduction: number;
  raidProtection: boolean;
  reputationBoost: number;

  // Timing
  startedAt: Date;
  renewsAt: Date;
  terminatedAt?: Date;
  terminatedBy?: 'business' | 'gang' | 'war_loss';

  // Tracking
  totalPaid: number;
  weeksActive: number;
  lastPaymentAt?: Date;
  missedPayments: number;
}

/**
 * Protection offer request
 */
export interface IProtectionOfferRequest {
  businessId: string;
  tier: ProtectionTier;
}

/**
 * Protection offer response from business owner
 */
export interface IProtectionOfferResponse {
  contractId: string;
  accept: boolean;
}

/**
 * Protection tier configuration
 */
export interface IProtectionTierConfig {
  feePercent: number;
  weeklyMinimum: number;
  incidentReduction: number;
  raidProtection: boolean;
  reputationBoost: number;
}

/**
 * Gang business purchase request
 */
export interface IGangBusinessPurchaseRequest {
  propertyId: string;
  businessType: string;
  customName?: string;
}

/**
 * Business transfer to gang request
 */
export interface IBusinessTransferRequest {
  businessId: string;
  gangId: string;
  revenueSharePercent?: number; // Defaults to 100 (full gang ownership)
}

/**
 * Revenue collection result
 */
export interface IRevenueCollectionResult {
  collected: number;
  gangShare: number;
  managerShare: number;
  destination: 'character' | 'gang_treasury' | 'split';
  businessId: string;
  businessName: string;
}

/**
 * Gang business bonuses from territory
 */
export interface IGangBusinessBonuses {
  baseBonus: number;
  gangOwnershipBonus: number;
  highInfluenceBonus: number;
  totalMultiplier: number;
  isInGangTerritory: boolean;
  zoneInfluence: number;
}

/**
 * Protection payment processing result
 */
export interface IProtectionPaymentResult {
  processed: number;
  totalCollected: number;
  suspended: number;
  failed: number;
}

/**
 * Gang business requirement by type
 */
export interface IGangBusinessRequirement {
  minGangLevel: number;
  establishmentCost: number;
}

/**
 * Business protection status on a business
 */
export interface IBusinessProtectionStatus {
  isProtected: boolean;
  gangId?: string;
  gangName?: string;
  tier?: ProtectionTier;
  incidentReduction: number;
  reputationBoost: number;
  raidProtection: boolean;
  nextPaymentDue?: Date;
  weeklyPayment?: number;
}

/**
 * Gang business event types for notifications
 */
export enum GangBusinessEventType {
  BUSINESS_PURCHASED = 'business_purchased',
  BUSINESS_SOLD = 'business_sold',
  BUSINESS_TRANSFERRED = 'business_transferred',
  REVENUE_COLLECTED = 'revenue_collected',
  MANAGER_ASSIGNED = 'manager_assigned',
  PROTECTION_OFFERED = 'protection_offered',
  PROTECTION_ACCEPTED = 'protection_accepted',
  PROTECTION_REFUSED = 'protection_refused',
  PROTECTION_SUSPENDED = 'protection_suspended',
  PROTECTION_TERMINATED = 'protection_terminated',
  PROTECTION_PAYMENT_RECEIVED = 'protection_payment_received',
  PROTECTION_PAYMENT_MISSED = 'protection_payment_missed',
}

/**
 * Gang business notification payload
 */
export interface IGangBusinessNotification {
  eventType: GangBusinessEventType;
  gangId: string;
  businessId?: string;
  businessName?: string;
  characterId?: string;
  characterName?: string;
  amount?: number;
  tier?: ProtectionTier;
  timestamp: Date;
}
