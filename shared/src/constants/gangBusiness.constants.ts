/**
 * Gang Business Constants
 *
 * Phase 15: Gang Businesses
 *
 * Balance constants for gang-owned businesses and protection rackets.
 */

import { PlayerBusinessType } from '../types/business.types';
import {
  GangBusinessAction,
  ProtectionTier,
  IProtectionTierConfig,
  IGangBusinessRequirement,
} from '../types/gangBusiness.types';

/**
 * Core gang business constants
 */
export const GANG_BUSINESS_CONSTANTS = {
  // Ownership transfer constraints
  MAX_PENDING_FOR_TRANSFER: 10000, // Max pending revenue to allow transfer
  MIN_REVENUE_SHARE_PERCENT: 50, // Minimum gang share for subsidiaries

  // Territory bonuses for gang-owned businesses
  OWN_TERRITORY_BONUS: 0.20, // +20% in gang's own territory
  HIGH_INFLUENCE_BONUS: 0.10, // +10% additional at 80%+ influence
  HIGH_INFLUENCE_THRESHOLD: 80, // Influence level to qualify for high bonus
  MAX_BONUS: 1.55, // Cap total multiplier at 155%

  // Business limits
  MAX_BUSINESSES_PER_GANG_LEVEL: 2, // 2 businesses per gang level
  MAX_BUSINESSES_TOTAL: 50, // Hard cap on gang businesses

  // Revenue collection
  MIN_COLLECTION_AMOUNT: 10, // Minimum to allow collection
  COLLECTION_COOLDOWN_MS: 60 * 1000, // 1 minute between collections

  // Notifications
  NOTIFY_REVENUE_THRESHOLD: 100, // Notify gang when collection exceeds this
} as const;

/**
 * Gang level requirements and costs by business type
 */
export const GANG_BUSINESS_REQUIREMENTS: Record<PlayerBusinessType, IGangBusinessRequirement> = {
  // Service businesses - lower requirements
  [PlayerBusinessType.SALOON]: {
    minGangLevel: 5,
    establishmentCost: 2000,
  },
  [PlayerBusinessType.GENERAL_STORE]: {
    minGangLevel: 3,
    establishmentCost: 1500,
  },
  [PlayerBusinessType.BLACKSMITH]: {
    minGangLevel: 8,
    establishmentCost: 4000,
  },
  [PlayerBusinessType.STABLE]: {
    minGangLevel: 4,
    establishmentCost: 2500,
  },
  [PlayerBusinessType.DOCTOR_OFFICE]: {
    minGangLevel: 10,
    establishmentCost: 5000,
  },
  [PlayerBusinessType.BANK_BRANCH]: {
    minGangLevel: 15,
    establishmentCost: 15000,
  },

  // Production businesses - higher requirements
  [PlayerBusinessType.BREWERY]: {
    minGangLevel: 12,
    establishmentCost: 8000,
  },
  [PlayerBusinessType.TANNERY]: {
    minGangLevel: 6,
    establishmentCost: 3000,
  },
  [PlayerBusinessType.GUNSMITH]: {
    minGangLevel: 10,
    establishmentCost: 6000,
  },
  [PlayerBusinessType.RANCH]: {
    minGangLevel: 8,
    establishmentCost: 5000,
  },
  [PlayerBusinessType.MINING_OPERATION]: {
    minGangLevel: 12,
    establishmentCost: 10000,
  },
};

/**
 * Protection tier configurations
 */
export const PROTECTION_TIERS: Record<ProtectionTier, IProtectionTierConfig> = {
  [ProtectionTier.BASIC]: {
    feePercent: 5,
    weeklyMinimum: 50,
    incidentReduction: 0.25, // -25% incident chance
    raidProtection: false,
    reputationBoost: 5,
  },
  [ProtectionTier.STANDARD]: {
    feePercent: 10,
    weeklyMinimum: 150,
    incidentReduction: 0.50, // -50% incident chance
    raidProtection: true,
    reputationBoost: 10,
  },
  [ProtectionTier.PREMIUM]: {
    feePercent: 20,
    weeklyMinimum: 400,
    incidentReduction: 0.75, // -75% incident chance
    raidProtection: true,
    reputationBoost: 15,
  },
};

/**
 * Protection racket constants
 */
export const PROTECTION_CONSTANTS = {
  // Payment timing
  PAYMENT_DAY: 0, // Sunday (0 = Sunday in JS Date.getDay())
  PAYMENT_HOUR: 12, // Noon UTC
  MAX_MISSED_PAYMENTS: 2, // Suspends after 2 missed payments

  // Offer timing
  OFFER_EXPIRY_HOURS: 48, // Offer expires after 48 hours
  COOLDOWN_AFTER_REFUSAL_DAYS: 7, // Can't re-offer for 7 days after refusal

  // Consequences
  SUSPENSION_PENALTY_REPUTATION: -5, // Reputation loss when suspended
  TERMINATION_WAR_LOSS_COOLDOWN_DAYS: 30, // Can't re-protect if gang lost territory in war

  // Benefits application
  REPUTATION_BOOST_IMMEDIATE: true, // Apply rep boost immediately on acceptance
  INCIDENT_REDUCTION_STACKS: false, // Protection doesn't stack with other reductions
} as const;

/**
 * Gang role permissions for business actions
 */
export const GANG_BUSINESS_PERMISSIONS: Record<GangBusinessAction, string[]> = {
  [GangBusinessAction.VIEW]: ['MEMBER', 'OFFICER', 'LEADER'],
  [GangBusinessAction.WORK]: ['MEMBER', 'OFFICER', 'LEADER'],
  [GangBusinessAction.COLLECT]: ['OFFICER', 'LEADER'],
  [GangBusinessAction.SET_PRICES]: ['OFFICER', 'LEADER'],
  [GangBusinessAction.ASSIGN_STAFF]: ['OFFICER', 'LEADER'],
  [GangBusinessAction.PURCHASE]: ['LEADER'],
  [GangBusinessAction.SELL]: ['LEADER'],
  [GangBusinessAction.TRANSFER]: ['LEADER'],
  [GangBusinessAction.SET_MANAGER]: ['LEADER'],
};

/**
 * Protection-related permissions
 */
export const PROTECTION_PERMISSIONS = {
  OFFER_PROTECTION: ['OFFICER', 'LEADER'],
  TERMINATE_PROTECTION: ['LEADER'],
  VIEW_CONTRACTS: ['MEMBER', 'OFFICER', 'LEADER'],
  MODIFY_TIER: ['LEADER'],
} as const;

/**
 * Get the next Sunday at noon UTC for payment scheduling
 */
export function getNextPaymentDate(): Date {
  const now = new Date();
  const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7; // If today is Sunday, next Sunday
  const nextSunday = new Date(now);
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
  nextSunday.setUTCHours(PROTECTION_CONSTANTS.PAYMENT_HOUR, 0, 0, 0);
  return nextSunday;
}

/**
 * Calculate maximum businesses a gang can own
 */
export function getMaxGangBusinesses(gangLevel: number): number {
  const calculated = gangLevel * GANG_BUSINESS_CONSTANTS.MAX_BUSINESSES_PER_GANG_LEVEL;
  return Math.min(calculated, GANG_BUSINESS_CONSTANTS.MAX_BUSINESSES_TOTAL);
}

/**
 * Check if a gang can purchase a specific business type
 */
export function canGangPurchaseBusinessType(
  gangLevel: number,
  businessType: PlayerBusinessType
): { canPurchase: boolean; reason?: string } {
  const requirement = GANG_BUSINESS_REQUIREMENTS[businessType];

  if (!requirement) {
    return { canPurchase: false, reason: 'Unknown business type' };
  }

  if (gangLevel < requirement.minGangLevel) {
    return {
      canPurchase: false,
      reason: `Gang must be level ${requirement.minGangLevel} to purchase ${businessType}`,
    };
  }

  return { canPurchase: true };
}

/**
 * Calculate gang business territory bonus
 */
export function calculateGangBusinessBonus(
  isInOwnTerritory: boolean,
  zoneInfluence: number
): number {
  let bonus = 1.0; // Base multiplier

  if (isInOwnTerritory) {
    bonus += GANG_BUSINESS_CONSTANTS.OWN_TERRITORY_BONUS;

    if (zoneInfluence >= GANG_BUSINESS_CONSTANTS.HIGH_INFLUENCE_THRESHOLD) {
      bonus += GANG_BUSINESS_CONSTANTS.HIGH_INFLUENCE_BONUS;
    }
  }

  return Math.min(bonus, GANG_BUSINESS_CONSTANTS.MAX_BONUS);
}

/**
 * Calculate protection payment for a week
 */
export function calculateProtectionPayment(
  weeklyRevenue: number,
  tier: ProtectionTier
): number {
  const config = PROTECTION_TIERS[tier];
  const percentPayment = Math.floor(weeklyRevenue * (config.feePercent / 100));
  return Math.max(percentPayment, config.weeklyMinimum);
}
