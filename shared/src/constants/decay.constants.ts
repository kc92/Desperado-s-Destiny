/**
 * Decay System Constants
 *
 * Phase 14: Risk Simulation
 *
 * Balance constants and configuration for:
 * - Property condition decay
 * - Mining claim condition
 * - Equipment deterioration
 * - Maintenance costs
 * - Repair mechanics
 */

// ============================================================================
// CONDITION TIERS
// ============================================================================

/**
 * Condition tier thresholds and multipliers
 */
export enum ConditionTier {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DEGRADED = 'degraded',
}

/**
 * Condition tier configuration
 */
export const CONDITION_TIERS: Record<ConditionTier, {
  min: number;
  max: number;
  incomeMultiplier: number;
  upkeepMultiplier: number;
  label: string;
  description: string;
}> = {
  [ConditionTier.EXCELLENT]: {
    min: 90,
    max: 100,
    incomeMultiplier: 1.10,
    upkeepMultiplier: 0.90,
    label: 'Excellent',
    description: 'In pristine condition, generating bonus income',
  },
  [ConditionTier.GOOD]: {
    min: 70,
    max: 89,
    incomeMultiplier: 1.00,
    upkeepMultiplier: 1.00,
    label: 'Good',
    description: 'Well maintained, operating normally',
  },
  [ConditionTier.FAIR]: {
    min: 50,
    max: 69,
    incomeMultiplier: 0.85,
    upkeepMultiplier: 1.10,
    label: 'Fair',
    description: 'Showing wear, reduced efficiency',
  },
  [ConditionTier.POOR]: {
    min: 30,
    max: 49,
    incomeMultiplier: 0.60,
    upkeepMultiplier: 1.30,
    label: 'Poor',
    description: 'Significant deterioration, needs repair',
  },
  [ConditionTier.DEGRADED]: {
    min: 0,
    max: 29,
    incomeMultiplier: 0.25,
    upkeepMultiplier: 2.00,
    label: 'Degraded',
    description: 'Severely damaged, barely functional',
  },
};

/**
 * Get condition tier from numeric value
 */
export function getConditionTier(condition: number): ConditionTier {
  if (condition >= 90) return ConditionTier.EXCELLENT;
  if (condition >= 70) return ConditionTier.GOOD;
  if (condition >= 50) return ConditionTier.FAIR;
  if (condition >= 30) return ConditionTier.POOR;
  return ConditionTier.DEGRADED;
}

/**
 * Get income multiplier for condition value
 */
export function getIncomeMultiplier(condition: number): number {
  const tier = getConditionTier(condition);
  return CONDITION_TIERS[tier].incomeMultiplier;
}

/**
 * Get upkeep multiplier for condition value
 */
export function getUpkeepMultiplier(condition: number): number {
  const tier = getConditionTier(condition);
  return CONDITION_TIERS[tier].upkeepMultiplier;
}

// ============================================================================
// PROPERTY DECAY
// ============================================================================

/**
 * Property decay configuration
 */
export const PROPERTY_DECAY = {
  /** Base daily decay rate (%) */
  BASE_DAILY_DECAY_RATE: 0.5,

  /** Decay rate acceleration when neglected (multiplier per day without maintenance) */
  NEGLECT_DECAY_MULTIPLIER: 1.1,

  /** Days without maintenance before neglect multiplier applies */
  NEGLECT_THRESHOLD_DAYS: 7,

  /** Maintenance action condition improvement (%) */
  MAINTENANCE_CONDITION_GAIN: 2,

  /** Maximum condition from maintenance (can't exceed this without repair) */
  MAX_CONDITION_FROM_MAINTENANCE: 90,

  /** Repair cost per condition point by property tier */
  REPAIR_COST_PER_POINT: {
    1: 50,   // Tier 1: $50 per point
    2: 100,  // Tier 2: $100 per point
    3: 200,  // Tier 3: $200 per point
    4: 400,  // Tier 4: $400 per point
    5: 800,  // Tier 5: $800 per point
  } as Record<number, number>,

  /** Minimum condition before property becomes abandoned */
  ABANDON_THRESHOLD: 10,

  /** Status change at low condition thresholds */
  CONDITION_STATUS_THRESHOLDS: {
    WARNING: 50,      // Show warning at 50%
    CRITICAL: 30,     // Critical warning at 30%
    ABANDONED: 10,    // Auto-abandon at 10%
  },

  /** Decay reduction from upgrades (per upgrade level) */
  UPGRADE_DECAY_REDUCTION: {
    reinforced_structure: 0.15,  // -15% decay per level
    weatherproofing: 0.10,       // -10% decay per level
    quality_materials: 0.12,     // -12% decay per level
  } as Record<string, number>,
} as const;

// ============================================================================
// MINING CLAIM DECAY
// ============================================================================

/**
 * Mining claim decay configuration
 */
export const MINING_CLAIM_DECAY = {
  /** Base daily passive decay rate (%) */
  BASE_DAILY_DECAY_RATE: 0.3,

  /** Decay per collection action (%) */
  COLLECTION_DECAY: 0.1,

  /** Decay per prospecting technique */
  PROSPECTING_DECAY: {
    sample: 0.5,
    pan: 1.0,
    deep_bore: 2.0,
    explosive: 5.0,
  } as Record<string, number>,

  /** Collections per day threshold for overwork penalty */
  OVERWORK_THRESHOLD: 5,

  /** Decay multiplier when overworking claim */
  OVERWORK_DECAY_MULTIPLIER: 2.0,

  /** Rehabilitation cost per condition point by tier */
  REHABILITATION_COST_PER_POINT: {
    1: 25,   // Tier 1: $25 per point
    2: 50,   // Tier 2: $50 per point
    3: 100,  // Tier 3: $100 per point
    4: 200,  // Tier 4: $200 per point
    5: 400,  // Tier 5: $400 per point
  } as Record<number, number>,

  /** Minimum condition before claim becomes exhausted */
  EXHAUSTION_THRESHOLD: 5,

  /** Condition at which yield starts being affected */
  YIELD_REDUCTION_THRESHOLD: 80,

  /** Status change thresholds */
  CONDITION_STATUS_THRESHOLDS: {
    WARNING: 60,       // Show warning at 60%
    CRITICAL: 30,      // Critical warning at 30%
    EXHAUSTED: 5,      // Exhausted at 5%
  },

  /** Time between collection count resets (ms) */
  COLLECTION_COUNT_RESET_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// EQUIPMENT DECAY
// ============================================================================

/**
 * Mining shaft equipment decay configuration
 */
export const EQUIPMENT_DECAY = {
  /** Decay per mining action (%) */
  USE_DECAY_BASE: 2.0,

  /** Additional decay per shaft level (%) */
  LEVEL_DECAY_BONUS: 0.5,

  /** Repair cost as percentage of installation cost */
  REPAIR_COST_PERCENT: 0.30,

  /** Minimum condition before equipment fails */
  FAILURE_THRESHOLD: 10,

  /** Warning condition threshold */
  WARNING_THRESHOLD: 30,

  /** Decay reduction from maintenance level */
  MAINTENANCE_LEVEL_DECAY_REDUCTION: {
    0: 0,      // No maintenance: no reduction
    1: 0.10,   // Basic maintenance: -10%
    2: 0.20,   // Standard maintenance: -20%
    3: 0.30,   // Premium maintenance: -30%
  } as Record<number, number>,
} as const;

// ============================================================================
// BUSINESS CONDITION IMPACT
// ============================================================================

/**
 * Business condition impact configuration
 * (Businesses use underlying property condition)
 */
export const BUSINESS_CONDITION_IMPACT = {
  /** Customer traffic multiplier at each tier */
  TRAFFIC_MULTIPLIER: {
    [ConditionTier.EXCELLENT]: 1.15,
    [ConditionTier.GOOD]: 1.00,
    [ConditionTier.FAIR]: 0.80,
    [ConditionTier.POOR]: 0.50,
    [ConditionTier.DEGRADED]: 0.20,
  },

  /** Reputation impact at low condition (daily) */
  REPUTATION_DECAY_AT_POOR: 0.5,
  REPUTATION_DECAY_AT_DEGRADED: 2.0,

  /** Quality cap based on condition tier */
  QUALITY_CAP: {
    [ConditionTier.EXCELLENT]: 100,
    [ConditionTier.GOOD]: 90,
    [ConditionTier.FAIR]: 70,
    [ConditionTier.POOR]: 50,
    [ConditionTier.DEGRADED]: 30,
  },
} as const;

// ============================================================================
// DECAY SCHEDULE
// ============================================================================

/**
 * Decay processing schedule
 */
export const DECAY_SCHEDULE = {
  /** How often to process decay (ms) */
  PROCESS_INTERVAL_MS: 24 * 60 * 60 * 1000, // Daily at midnight

  /** Time of day to process decay (UTC hour) */
  PROCESS_HOUR_UTC: 4, // 4 AM UTC

  /** Grace period for new assets before decay starts (ms) */
  NEW_ASSET_GRACE_PERIOD_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// ============================================================================
// MAINTENANCE ACTIONS
// ============================================================================

/**
 * Maintenance action types
 */
export enum MaintenanceActionType {
  BASIC_MAINTENANCE = 'basic_maintenance',
  THOROUGH_REPAIR = 'thorough_repair',
  FULL_RESTORATION = 'full_restoration',
  EMERGENCY_PATCH = 'emergency_patch',
}

/**
 * Maintenance action configuration
 */
export const MAINTENANCE_ACTIONS: Record<MaintenanceActionType, {
  name: string;
  description: string;
  conditionGain: number;
  baseCost: number;
  costPerTier: number;
  cooldownHours: number;
  minCondition: number;
  maxConditionResult: number;
}> = {
  [MaintenanceActionType.BASIC_MAINTENANCE]: {
    name: 'Basic Maintenance',
    description: 'Perform routine upkeep to slow decay',
    conditionGain: 2,
    baseCost: 25,
    costPerTier: 10,
    cooldownHours: 24,
    minCondition: 0,
    maxConditionResult: 90,
  },
  [MaintenanceActionType.THOROUGH_REPAIR]: {
    name: 'Thorough Repair',
    description: 'Fix accumulated wear and damage',
    conditionGain: 10,
    baseCost: 100,
    costPerTier: 50,
    cooldownHours: 48,
    minCondition: 20,
    maxConditionResult: 95,
  },
  [MaintenanceActionType.FULL_RESTORATION]: {
    name: 'Full Restoration',
    description: 'Restore to peak condition',
    conditionGain: 100, // Restores to max
    baseCost: 500,
    costPerTier: 250,
    cooldownHours: 168, // 1 week
    minCondition: 30,
    maxConditionResult: 100,
  },
  [MaintenanceActionType.EMERGENCY_PATCH]: {
    name: 'Emergency Patch',
    description: 'Quick fix to prevent critical failure',
    conditionGain: 5,
    baseCost: 50,
    costPerTier: 20,
    cooldownHours: 4,
    minCondition: 0,
    maxConditionResult: 40,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate property repair cost
 */
export function calculatePropertyRepairCost(
  currentCondition: number,
  targetCondition: number,
  propertyTier: number
): number {
  const pointsToRepair = Math.max(0, targetCondition - currentCondition);
  const costPerPoint = PROPERTY_DECAY.REPAIR_COST_PER_POINT[propertyTier] || PROPERTY_DECAY.REPAIR_COST_PER_POINT[1];
  return pointsToRepair * costPerPoint;
}

/**
 * Calculate mining claim rehabilitation cost
 */
export function calculateClaimRehabilitationCost(
  currentCondition: number,
  targetCondition: number,
  claimTier: number
): number {
  const pointsToRepair = Math.max(0, targetCondition - currentCondition);
  const costPerPoint = MINING_CLAIM_DECAY.REHABILITATION_COST_PER_POINT[claimTier] || MINING_CLAIM_DECAY.REHABILITATION_COST_PER_POINT[1];
  return pointsToRepair * costPerPoint;
}

/**
 * Calculate equipment repair cost
 */
export function calculateEquipmentRepairCost(
  currentCondition: number,
  installCost: number
): number {
  const repairPercent = (100 - currentCondition) / 100;
  return Math.ceil(installCost * EQUIPMENT_DECAY.REPAIR_COST_PERCENT * repairPercent);
}

/**
 * Calculate daily decay rate with modifiers
 */
export function calculateDailyDecayRate(
  baseRate: number,
  daysSinceLastMaintenance: number,
  decayReductions: number[] = []
): number {
  let rate = baseRate;

  // Apply neglect multiplier
  if (daysSinceLastMaintenance > PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS) {
    const neglectDays = daysSinceLastMaintenance - PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS;
    rate *= Math.pow(PROPERTY_DECAY.NEGLECT_DECAY_MULTIPLIER, neglectDays);
  }

  // Apply reductions from upgrades/etc
  const totalReduction = decayReductions.reduce((sum, r) => sum + r, 0);
  rate *= Math.max(0.1, 1 - totalReduction); // Minimum 10% of base rate

  return rate;
}

/**
 * Calculate yield modifier based on condition
 */
export function calculateYieldModifier(condition: number): number {
  if (condition >= MINING_CLAIM_DECAY.YIELD_REDUCTION_THRESHOLD) {
    return 1.0; // Full yield above threshold
  }

  // Linear reduction below threshold
  return condition / MINING_CLAIM_DECAY.YIELD_REDUCTION_THRESHOLD;
}
