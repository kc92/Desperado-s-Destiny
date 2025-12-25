/**
 * Competition Constants
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Configuration for NPC business behavior, market saturation, resource scarcity,
 * and traffic share calculations.
 */

import {
  NPCBusinessPersonality,
  NPCBusinessStatus,
  ResourceVeinStatus,
  MarketSaturationLevel,
  BusinessTypeCategory,
  ZoneBusinessType,
  ZoneCapacityConfig,
  SaturationModifiers,
  ScarcityResourceType,
} from '../types/competition.types';

/**
 * Job timing constants
 */
export const COMPETITION_TIMING = {
  // Update frequency (milliseconds)
  UPDATE_INTERVAL_MS: 60 * 60 * 1000,  // 1 hour

  // NPC decision frequency
  NPC_PRICE_CHANGE_COOLDOWN_HOURS: 24,
  NPC_QUALITY_CHANGE_COOLDOWN_HOURS: 48,

  // Resource regeneration check frequency
  REGENERATION_CHECK_HOURS: 6,

  // Protection racket timing
  PROTECTION_DEMAND_FREQUENCY_DAYS: 7,
  PROTECTION_DEADLINE_DAYS: 3,
} as const;

/**
 * Traffic share weights
 */
export const TRAFFIC_SHARE_WEIGHTS = {
  REPUTATION: 0.35,      // 35%
  PRICE: 0.30,           // 30%
  QUALITY: 0.20,         // 20%
  TERRITORY: 0.15,       // 15%
} as const;

/**
 * Traffic share constraints
 */
export const TRAFFIC_SHARE_CONSTRAINTS = {
  MIN_SHARE: 0.05,       // 5% minimum (even bad businesses get some traffic)
  MAX_SHARE: 0.60,       // 60% maximum (no monopolies)
  NPC_TUTORIAL_MIN: 0.10, // 10% minimum for NPC in tutorial zones
} as const;

/**
 * Market saturation thresholds and modifiers
 */
export const SATURATION_THRESHOLDS = {
  UNDERSATURATED_MAX: 0.50,   // < 50% capacity
  BALANCED_MAX: 0.80,         // 50-80% capacity
  SATURATED_MAX: 1.00,        // 80-100% capacity
  // > 100% is oversaturated
} as const;

export const SATURATION_MODIFIERS: SaturationModifiers = {
  [MarketSaturationLevel.UNDERSATURATED]: 1.25,  // +25% traffic
  [MarketSaturationLevel.BALANCED]: 1.00,        // Normal
  [MarketSaturationLevel.SATURATED]: 0.75,       // -25% traffic
  [MarketSaturationLevel.OVERSATURATED]: 0.50,   // -50% traffic
} as const;

/**
 * Zone capacity by business type
 */
export const ZONE_CAPACITIES: ZoneCapacityConfig = {
  [ZoneBusinessType.TOWN_CENTER]: {
    [BusinessTypeCategory.SALOON]: 4,
    [BusinessTypeCategory.GENERAL_STORE]: 3,
    [BusinessTypeCategory.BLACKSMITH]: 2,
    [BusinessTypeCategory.STABLE]: 2,
    [BusinessTypeCategory.HOTEL]: 3,
    [BusinessTypeCategory.BANK]: 2,
    [BusinessTypeCategory.DOCTOR]: 2,
    [BusinessTypeCategory.LAWYER]: 2,
    [BusinessTypeCategory.BARBER]: 2,
    [BusinessTypeCategory.RESTAURANT]: 3,
  },
  [ZoneBusinessType.COMMERCIAL]: {
    [BusinessTypeCategory.SALOON]: 3,
    [BusinessTypeCategory.GENERAL_STORE]: 4,
    [BusinessTypeCategory.BLACKSMITH]: 3,
    [BusinessTypeCategory.STABLE]: 1,
    [BusinessTypeCategory.HOTEL]: 2,
    [BusinessTypeCategory.RESTAURANT]: 4,
  },
  [ZoneBusinessType.FRONTIER]: {
    [BusinessTypeCategory.SALOON]: 2,
    [BusinessTypeCategory.GENERAL_STORE]: 2,
    [BusinessTypeCategory.STABLE]: 3,
    [BusinessTypeCategory.RANCH]: 5,
    [BusinessTypeCategory.FARM]: 4,
  },
  [ZoneBusinessType.INDUSTRIAL]: {
    [BusinessTypeCategory.BLACKSMITH]: 4,
    [BusinessTypeCategory.LUMBER_MILL]: 3,
    [BusinessTypeCategory.MINE]: 5,
    [BusinessTypeCategory.TEXTILE]: 2,
  },
  [ZoneBusinessType.RESIDENTIAL]: {
    [BusinessTypeCategory.GENERAL_STORE]: 2,
    [BusinessTypeCategory.DOCTOR]: 1,
    [BusinessTypeCategory.BARBER]: 1,
    [BusinessTypeCategory.RESTAURANT]: 2,
  },
} as const;

/**
 * NPC personality defaults
 */
export const PERSONALITY_DEFAULTS = {
  [NPCBusinessPersonality.PASSIVE]: {
    aggressiveness: 15,
    resilience: 70,
    expansionTendency: 10,
    priceChangeThreshold: 0.4,   // Only responds to 40%+ market shifts
    qualityFocus: 0.8,
  },
  [NPCBusinessPersonality.BALANCED]: {
    aggressiveness: 50,
    resilience: 50,
    expansionTendency: 30,
    priceChangeThreshold: 0.25,
    qualityFocus: 0.5,
  },
  [NPCBusinessPersonality.AGGRESSIVE]: {
    aggressiveness: 85,
    resilience: 40,
    expansionTendency: 60,
    priceChangeThreshold: 0.10,  // Responds to 10% market shifts
    qualityFocus: 0.3,
  },
  [NPCBusinessPersonality.QUALITY_FOCUSED]: {
    aggressiveness: 25,
    resilience: 60,
    expansionTendency: 20,
    priceChangeThreshold: 0.35,
    qualityFocus: 0.9,
  },
} as const;

/**
 * NPC behavior thresholds
 */
export const NPC_BEHAVIOR = {
  // Revenue decline triggers
  REVENUE_DECLINE_THRESHOLD: 0.40,  // 40% decline triggers response
  WEEKS_BEFORE_CLOSING: 4,          // 4 consecutive loss weeks

  // Price change bounds
  MIN_PRICE_MODIFIER: 0.70,         // -30% maximum discount
  MAX_PRICE_MODIFIER: 1.30,         // +30% maximum premium
  PRICE_CHANGE_STEP: 0.05,          // 5% price changes at a time

  // Quality bounds
  MIN_QUALITY: 1,
  MAX_QUALITY: 10,
  QUALITY_CHANGE_STEP: 1,

  // Expansion thresholds
  EXPANSION_REVENUE_THRESHOLD: 1.5, // 150% of average revenue
  EXPANSION_WEEKS_REQUIRED: 4,      // 4 consecutive gain weeks

  // Closing thresholds
  CLOSING_REVENUE_THRESHOLD: 0.3,   // Below 30% of average revenue
  MIN_NPC_BUSINESSES_PER_ZONE: 1,   // Always keep at least 1 NPC per type per zone

  // Competition response
  UNDERCUT_THRESHOLD: 0.20,         // Respond if player undercuts by 20%+
  MATCH_PROBABILITY: 0.60,          // 60% chance to match competitor prices
} as const;

/**
 * Resource vein status multipliers
 */
export const VEIN_STATUS_MULTIPLIERS = {
  [ResourceVeinStatus.ABUNDANT]: 1.00,
  [ResourceVeinStatus.NORMAL]: 0.85,
  [ResourceVeinStatus.SCARCE]: 0.70,
  [ResourceVeinStatus.DEPLETED]: 0.50,
  [ResourceVeinStatus.EXHAUSTED]: 0.25,
} as const;

/**
 * Vein status thresholds (based on remaining percentage)
 */
export const VEIN_STATUS_THRESHOLDS = {
  ABUNDANT_MIN: 75,   // 75-100% remaining
  NORMAL_MIN: 50,     // 50-74% remaining
  SCARCE_MIN: 25,     // 25-49% remaining
  DEPLETED_MIN: 10,   // 10-24% remaining
  // < 10% is exhausted
} as const;

/**
 * Competition yield penalty for multiple claims on same vein
 */
export const COMPETITION_YIELD_PENALTY = {
  1: 1.00,    // 1 claim = 100%
  2: 0.85,    // 2 claims = 85% each
  3: 0.70,    // 3 claims = 70% each
  4: 0.55,    // 4 claims = 55% each
  5: 0.40,    // 5+ claims = 40% each (floor)
} as const;

/**
 * Resource regeneration rates (units per day)
 */
export const REGENERATION_RATES: Partial<Record<ScarcityResourceType, number>> = {
  [ScarcityResourceType.TIMBER]: 50,
  [ScarcityResourceType.WATER]: 100,
  [ScarcityResourceType.CATTLE]: 5,
  [ScarcityResourceType.GRAIN]: 20,
  // Minerals don't regenerate
} as const;

/**
 * Territory control effects on competition
 */
export const TERRITORY_EFFECTS = {
  // Business traffic
  PLAYER_GANG_CONTROL_BONUS: 0.20,     // +20% traffic if player's gang controls zone
  NPC_GANG_CONTROL_RESILIENCE: 0.20,   // +20% NPC resilience if NPC gang controls

  // Contested effects
  CONTESTED_BONUS_REDUCTION: 0.50,     // 50% of normal bonuses in contested zones

  // Protection effects
  PROTECTION_SABOTAGE_REDUCTION: 0.80, // 80% less sabotage if paying protection
  PROTECTION_TRAFFIC_PENALTY: 0.15,    // -15% traffic if not paying protection (gang zone)
  PROTECTION_REPUTATION_LOSS: 2,       // -2 reputation per day if not paying
  PROTECTION_SABOTAGE_CHANCE: 0.10,    // 10% daily sabotage chance if not paying
} as const;

/**
 * Gang protection fee calculation
 */
export const PROTECTION_FEE = {
  BASE_FEE: 50,                        // Base weekly fee
  REVENUE_PERCENT: 0.10,               // 10% of weekly revenue
  MIN_FEE: 25,
  MAX_FEE: 500,
} as const;

/**
 * Score calculation formulas
 */
export const SCORE_CALCULATION = {
  // Reputation score (0-100 reputation maps to 0-100 score)
  REPUTATION_WEIGHT: 1.0,

  // Price score (1.3 modifier = 0 score, 0.7 modifier = 100 score)
  PRICE_BASE: 100,
  PRICE_PENALTY_PER_POINT: 166.67,     // Score reduction per 0.1 above 1.0

  // Quality score (1-10 quality maps to 0-100 score)
  QUALITY_MULTIPLIER: 10,

  // Territory score
  TERRITORY_CONTROL_BONUS: 100,        // Full control
  TERRITORY_CONTESTED_BONUS: 50,       // Contested
} as const;

/**
 * Default values for new NPC businesses
 */
export const NPC_BUSINESS_DEFAULTS = {
  baseQuality: 5,
  priceModifier: 1.0,
  reputation: 50,
  aggressiveness: 50,
  resilience: 50,
  expansionTendency: 30,
} as const;

/**
 * Status change thresholds for NPC businesses
 */
export const STATUS_THRESHOLDS = {
  [NPCBusinessStatus.THRIVING]: {
    minRevenueFactor: 1.3,            // 130% of average
    minConsecutiveGainWeeks: 3,
  },
  [NPCBusinessStatus.STABLE]: {
    minRevenueFactor: 0.7,            // 70-130% of average
    maxRevenueFactor: 1.3,
  },
  [NPCBusinessStatus.STRUGGLING]: {
    maxRevenueFactor: 0.7,            // Below 70%
    minLossWeeks: 2,
  },
  [NPCBusinessStatus.CLOSING]: {
    maxRevenueFactor: 0.3,            // Below 30%
    minLossWeeks: 4,
  },
} as const;

/**
 * Helper function to calculate price score
 */
export function calculatePriceScore(priceModifier: number): number {
  if (priceModifier <= 0.7) return 100;
  if (priceModifier >= 1.3) return 0;

  // Linear interpolation: 0.7 -> 100, 1.3 -> 0
  return Math.round((1.3 - priceModifier) / 0.6 * 100);
}

/**
 * Helper function to calculate quality score
 */
export function calculateQualityScore(quality: number): number {
  return Math.round((quality / 10) * 100);
}

/**
 * Helper function to get saturation level from percentage
 */
export function getSaturationLevel(saturationPercent: number): MarketSaturationLevel {
  if (saturationPercent < SATURATION_THRESHOLDS.UNDERSATURATED_MAX) {
    return MarketSaturationLevel.UNDERSATURATED;
  }
  if (saturationPercent < SATURATION_THRESHOLDS.BALANCED_MAX) {
    return MarketSaturationLevel.BALANCED;
  }
  if (saturationPercent <= SATURATION_THRESHOLDS.SATURATED_MAX) {
    return MarketSaturationLevel.SATURATED;
  }
  return MarketSaturationLevel.OVERSATURATED;
}

/**
 * Helper function to get vein status from remaining percentage
 */
export function getVeinStatus(remainingPercent: number): ResourceVeinStatus {
  if (remainingPercent >= VEIN_STATUS_THRESHOLDS.ABUNDANT_MIN) {
    return ResourceVeinStatus.ABUNDANT;
  }
  if (remainingPercent >= VEIN_STATUS_THRESHOLDS.NORMAL_MIN) {
    return ResourceVeinStatus.NORMAL;
  }
  if (remainingPercent >= VEIN_STATUS_THRESHOLDS.SCARCE_MIN) {
    return ResourceVeinStatus.SCARCE;
  }
  if (remainingPercent >= VEIN_STATUS_THRESHOLDS.DEPLETED_MIN) {
    return ResourceVeinStatus.DEPLETED;
  }
  return ResourceVeinStatus.EXHAUSTED;
}

/**
 * Helper function to get competition yield penalty
 */
export function getCompetitionYieldPenalty(claimCount: number): number {
  if (claimCount <= 1) return 1.0;
  if (claimCount >= 5) return COMPETITION_YIELD_PENALTY[5];
  return COMPETITION_YIELD_PENALTY[claimCount as keyof typeof COMPETITION_YIELD_PENALTY] ?? 0.40;
}

/**
 * Helper function to calculate protection fee
 */
export function calculateProtectionFee(weeklyRevenue: number): number {
  const fee = PROTECTION_FEE.BASE_FEE + (weeklyRevenue * PROTECTION_FEE.REVENUE_PERCENT);
  return Math.max(PROTECTION_FEE.MIN_FEE, Math.min(PROTECTION_FEE.MAX_FEE, Math.floor(fee)));
}

/**
 * Helper function to determine if NPC should respond to player pricing
 */
export function shouldNPCRespondToCompetitor(
  npcPriceModifier: number,
  competitorPriceModifier: number,
  personality: NPCBusinessPersonality
): boolean {
  const priceDifference = npcPriceModifier - competitorPriceModifier;
  const threshold = PERSONALITY_DEFAULTS[personality].priceChangeThreshold;

  // Respond if being undercut by more than personality threshold
  return priceDifference >= threshold;
}
