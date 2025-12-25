/**
 * Deep Mining Constants
 *
 * Phase 13: Deep Mining System
 *
 * Balance constants and configuration for:
 * - Suspicion mechanics
 * - Equipment costs and effects
 * - Resource values
 * - Fence rates
 * - XP awards
 * - Inspector mechanics
 */

import {
  SuspicionLevel,
  SuspicionEventType,
  HazardType,
  HazardSeverity,
  MiningEquipmentType,
  DeepResourceType,
  DeepResourceTier,
  FenceLocationId,
  FenceTrustLevel,
  FenceSpecialization,
  InspectorType,
  ProspectingUnlockType,
  type IMiningEquipment,
  type IDeepResource,
  type IFenceLocation,
  type IProspectingUnlock,
} from '../types/deepMining.types';

// ============================================================================
// SUSPICION THRESHOLDS
// ============================================================================

/**
 * Suspicion level thresholds
 */
export const SUSPICION_THRESHOLDS = {
  UNKNOWN: { min: 0, max: 25 },
  SUSPICIOUS: { min: 26, max: 50 },
  ACTIVE_SEARCH: { min: 51, max: 75 },
  WARRANT_ISSUED: { min: 76, max: 100 },
} as const;

/**
 * Get suspicion level from numeric value
 */
export function getSuspicionLevel(suspicion: number): SuspicionLevel {
  if (suspicion <= 25) return SuspicionLevel.UNKNOWN;
  if (suspicion <= 50) return SuspicionLevel.SUSPICIOUS;
  if (suspicion <= 75) return SuspicionLevel.ACTIVE_SEARCH;
  return SuspicionLevel.WARRANT_ISSUED;
}

/**
 * Suspicion change amounts by event type
 */
export const SUSPICION_CHANGES: Record<SuspicionEventType, number> = {
  [SuspicionEventType.ORE_COLLECTED]: 10,
  [SuspicionEventType.LEGAL_SALE]: 10,
  [SuspicionEventType.NPC_PATROL_SPOTTED]: 25,
  [SuspicionEventType.BRIBE_FAILED]: 40,
  [SuspicionEventType.BRIBE_SUCCESS]: 30, // Reduction amount (applied as negative)
  [SuspicionEventType.GANG_PROTECTION]: 10, // Daily reduction amount
  [SuspicionEventType.TIME_DECAY]: 5, // Daily decay amount
  [SuspicionEventType.INSPECTION_PASSED]: 15, // Reduction amount
  [SuspicionEventType.INSPECTION_FAILED]: 35,
};

// ============================================================================
// INSPECTION MECHANICS
// ============================================================================

/**
 * Inspection timing (in milliseconds)
 */
export const INSPECTION_TIMING = {
  /** Base patrol check interval */
  PATROL_CHECK_INTERVAL_MS: 2 * 60 * 60 * 1000, // 2 hours

  /** Chance of patrol per check based on suspicion level */
  PATROL_CHANCE_BY_LEVEL: {
    [SuspicionLevel.UNKNOWN]: 0.05,      // 5%
    [SuspicionLevel.SUSPICIOUS]: 0.15,    // 15%
    [SuspicionLevel.ACTIVE_SEARCH]: 0.35, // 35%
    [SuspicionLevel.WARRANT_ISSUED]: 0.60, // 60%
  },

  /** Suspicion decay interval */
  DECAY_INTERVAL_MS: 24 * 60 * 60 * 1000, // Daily
} as const;

/**
 * Inspector bribery costs and success rates
 */
export const INSPECTOR_BRIBERY = {
  [InspectorType.INSPECTOR]: {
    baseCost: 100,
    costPerSuspicionPoint: 5,
    baseSuccessRate: 0.70,
    successRateDecreasePerSuspicion: 0.005,
  },
  [InspectorType.MARSHAL]: {
    baseCost: 500,
    costPerSuspicionPoint: 20,
    baseSuccessRate: 0.40,
    successRateDecreasePerSuspicion: 0.008,
  },
  [InspectorType.FEDERAL_AGENT]: {
    baseCost: 0, // Cannot be bribed
    costPerSuspicionPoint: 0,
    baseSuccessRate: 0,
    successRateDecreasePerSuspicion: 0,
  },
} as const;

/**
 * Consequences when caught
 */
export const CAUGHT_CONSEQUENCES = {
  /** Percentage of ore value as fine */
  FINE_PERCENT_OF_ORE_VALUE: 0.50,
  /** Base fine amount */
  BASE_FINE: 500,
  /** Jail time range in minutes */
  JAIL_TIME_MIN_MINUTES: 15,
  JAIL_TIME_MAX_MINUTES: 60,
  /** Wanted level increase */
  WANTED_LEVEL_MIN: 1,
  WANTED_LEVEL_MAX: 3,
} as const;

// ============================================================================
// MINING EQUIPMENT
// ============================================================================

/**
 * Mining equipment definitions
 */
export const MINING_EQUIPMENT: Record<MiningEquipmentType, IMiningEquipment> = {
  // Ventilation
  [MiningEquipmentType.BASIC_VENTILATION]: {
    type: MiningEquipmentType.BASIC_VENTILATION,
    name: 'Basic Ventilation',
    description: 'Simple air pumps to reduce gas buildup',
    cost: 2000,
    hazardMitigation: [
      { hazardType: HazardType.GAS_POCKET, reductionPercent: 25 },
      { hazardType: HazardType.TOXIC_FUMES, reductionPercent: 15 },
    ],
    maintenanceCostPerDay: 10,
  },
  [MiningEquipmentType.ADVANCED_VENTILATION]: {
    type: MiningEquipmentType.ADVANCED_VENTILATION,
    name: 'Advanced Ventilation',
    description: 'Industrial-grade air circulation system',
    cost: 8000,
    hazardMitigation: [
      { hazardType: HazardType.GAS_POCKET, reductionPercent: 50 },
      { hazardType: HazardType.TOXIC_FUMES, reductionPercent: 40 },
    ],
    maintenanceCostPerDay: 35,
  },

  // Structural
  [MiningEquipmentType.MINE_SUPPORTS]: {
    type: MiningEquipmentType.MINE_SUPPORTS,
    name: 'Mine Supports',
    description: 'Wooden beams to reinforce tunnel walls',
    cost: 3000,
    hazardMitigation: [
      { hazardType: HazardType.COLLAPSE_RISK, reductionPercent: 25 },
      { hazardType: HazardType.UNSTABLE_CEILING, reductionPercent: 20 },
    ],
    maintenanceCostPerDay: 15,
  },
  [MiningEquipmentType.REINFORCED_SUPPORTS]: {
    type: MiningEquipmentType.REINFORCED_SUPPORTS,
    name: 'Reinforced Supports',
    description: 'Steel-reinforced structural supports',
    cost: 12000,
    hazardMitigation: [
      { hazardType: HazardType.COLLAPSE_RISK, reductionPercent: 50 },
      { hazardType: HazardType.UNSTABLE_CEILING, reductionPercent: 45 },
    ],
    maintenanceCostPerDay: 50,
  },

  // Pumping
  [MiningEquipmentType.DRAINAGE_PUMP]: {
    type: MiningEquipmentType.DRAINAGE_PUMP,
    name: 'Drainage Pump',
    description: 'Hand-operated water pump',
    cost: 5000,
    hazardMitigation: [
      { hazardType: HazardType.FLOODING, reductionPercent: 25 },
    ],
    maintenanceCostPerDay: 20,
  },
  [MiningEquipmentType.STEAM_PUMP]: {
    type: MiningEquipmentType.STEAM_PUMP,
    name: 'Steam Pump',
    description: 'Powerful steam-powered water extraction',
    cost: 20000,
    hazardMitigation: [
      { hazardType: HazardType.FLOODING, reductionPercent: 75 },
    ],
    maintenanceCostPerDay: 100,
  },

  // Personal Safety
  [MiningEquipmentType.SAFETY_CANARY]: {
    type: MiningEquipmentType.SAFETY_CANARY,
    name: 'Safety Canary',
    description: 'Alerts to dangerous gases before they harm you',
    cost: 100,
    hazardMitigation: [
      { hazardType: HazardType.GAS_POCKET, reductionPercent: 10 },
      { hazardType: HazardType.TOXIC_FUMES, reductionPercent: 15 },
    ],
    maintenanceCostPerDay: 5,
  },
  [MiningEquipmentType.MINERS_HELMET]: {
    type: MiningEquipmentType.MINERS_HELMET,
    name: "Miner's Helmet",
    description: 'Hardhat with lamp for deep mining',
    cost: 50,
    hazardMitigation: [
      { hazardType: HazardType.UNSTABLE_CEILING, reductionPercent: 10 },
    ],
    requiredForLevel: 5,
    maintenanceCostPerDay: 1,
  },
  [MiningEquipmentType.BREATHING_MASK]: {
    type: MiningEquipmentType.BREATHING_MASK,
    name: 'Breathing Mask',
    description: 'Filters out harmful particles and gases',
    cost: 500,
    hazardMitigation: [
      { hazardType: HazardType.TOXIC_FUMES, reductionPercent: 35 },
      { hazardType: HazardType.GAS_POCKET, reductionPercent: 15 },
    ],
    requiredForLevel: 7,
    maintenanceCostPerDay: 10,
  },
};

// ============================================================================
// SHAFT LEVELS AND HAZARDS
// ============================================================================

/**
 * Shaft level ranges configuration (for reference)
 */
export const SHAFT_LEVEL_RANGES = {
  /** Resources available at each level range */
  LEVEL_RESOURCES: {
    '1-2': ['standard'],           // Standard ores only
    '3-4': ['silver', 'lead'],     // Silver and Lead added
    '5-6': ['gold', 'quicksilver'], // Gold and Quicksilver
    '7-8': ['deep_iron', 'mithril'], // Tier 6 resources
    '9-10': ['star_metal', 'void_crystal'], // Tier 7 resources
  },

  /** Hazards by level range */
  LEVEL_HAZARDS: {
    '1-2': [HazardType.UNSTABLE_CEILING],
    '3-4': [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET],
    '5-6': [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING],
    '7-8': [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK],
    '9-10': [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK, HazardType.TOXIC_FUMES],
  },

  /** Equipment required by level */
  REQUIRED_EQUIPMENT_BY_LEVEL: {
    5: [MiningEquipmentType.MINERS_HELMET],
    7: [MiningEquipmentType.MINERS_HELMET, MiningEquipmentType.BREATHING_MASK],
  },

  /** XP to progress to next level */
  XP_PER_LEVEL: [
    0,     // Level 1 (start)
    100,   // Level 2
    250,   // Level 3
    500,   // Level 4
    1000,  // Level 5
    2000,  // Level 6
    4000,  // Level 7
    8000,  // Level 8
    16000, // Level 9
    32000, // Level 10
  ],
} as const;

/**
 * Per-level shaft configuration (indexed by level number)
 */
export const SHAFT_LEVEL_CONFIG: Record<number, {
  possibleHazards: HazardType[];
  requiredEquipment?: MiningEquipmentType[];
  availableResources: string[];
  xpToNext: number;
}> = {
  1: {
    possibleHazards: [HazardType.UNSTABLE_CEILING],
    availableResources: ['standard'],
    xpToNext: 100,
  },
  2: {
    possibleHazards: [HazardType.UNSTABLE_CEILING],
    availableResources: ['standard'],
    xpToNext: 250,
  },
  3: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET],
    availableResources: ['standard', 'silver', 'lead'],
    xpToNext: 500,
  },
  4: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET],
    availableResources: ['standard', 'silver', 'lead'],
    xpToNext: 1000,
  },
  5: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET],
    availableResources: ['gold', 'quicksilver', 'deep_iron'],
    xpToNext: 2000,
  },
  6: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET],
    availableResources: ['gold', 'quicksilver', 'deep_iron', 'mithril'],
    xpToNext: 4000,
  },
  7: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET, MiningEquipmentType.BREATHING_MASK],
    availableResources: ['deep_iron', 'mithril'],
    xpToNext: 8000,
  },
  8: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET, MiningEquipmentType.BREATHING_MASK],
    availableResources: ['deep_iron', 'mithril', 'star_metal'],
    xpToNext: 16000,
  },
  9: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK, HazardType.TOXIC_FUMES],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET, MiningEquipmentType.BREATHING_MASK],
    availableResources: ['star_metal', 'void_crystal'],
    xpToNext: 32000,
  },
  10: {
    possibleHazards: [HazardType.UNSTABLE_CEILING, HazardType.GAS_POCKET, HazardType.FLOODING, HazardType.COLLAPSE_RISK, HazardType.TOXIC_FUMES],
    requiredEquipment: [MiningEquipmentType.MINERS_HELMET, MiningEquipmentType.BREATHING_MASK],
    availableResources: ['star_metal', 'void_crystal', 'eldritch_ore'],
    xpToNext: 0, // Max level
  },
};

/**
 * Hazard severity chances by level
 */
export const HAZARD_SEVERITY_CHANCES: Record<string, Record<HazardSeverity, number>> = {
  '1-2': { minor: 0.80, moderate: 0.18, severe: 0.02, critical: 0 },
  '3-4': { minor: 0.60, moderate: 0.30, severe: 0.08, critical: 0.02 },
  '5-6': { minor: 0.40, moderate: 0.35, severe: 0.20, critical: 0.05 },
  '7-8': { minor: 0.25, moderate: 0.35, severe: 0.30, critical: 0.10 },
  '9-10': { minor: 0.15, moderate: 0.30, severe: 0.35, critical: 0.20 },
};

/**
 * Hazard damage ranges by severity
 */
export const HAZARD_DAMAGE: Record<HazardSeverity, { min: number; max: number }> = {
  [HazardSeverity.MINOR]: { min: 5, max: 10 },
  [HazardSeverity.MODERATE]: { min: 10, max: 25 },
  [HazardSeverity.SEVERE]: { min: 25, max: 50 },
  [HazardSeverity.CRITICAL]: { min: 50, max: 100 },
};

/**
 * Base inspection chance (multiplied by suspicion level factors)
 */
export const BASE_INSPECTION_CHANCE = 0.10; // 10% base chance

// ============================================================================
// DEEP RESOURCES (TIER 6-8)
// ============================================================================

/**
 * Deep resource definitions
 */
export const DEEP_RESOURCES: Record<DeepResourceType, IDeepResource> = {
  // Tier 6
  [DeepResourceType.DEEP_IRON]: {
    type: DeepResourceType.DEEP_IRON,
    name: 'Deep Iron',
    description: 'Dense iron ore found in the depths, prized for its durability',
    tier: DeepResourceTier.TIER_6,
    baseValue: 50,
    rarity: 'rare',
    minShaftLevel: 5,
    isContraband: false,
  },
  [DeepResourceType.MITHRIL]: {
    type: DeepResourceType.MITHRIL,
    name: 'Mithril',
    description: 'Legendary silver-steel alloy, incredibly light and strong',
    tier: DeepResourceTier.TIER_6,
    baseValue: 300,
    rarity: 'epic',
    minShaftLevel: 6,
    isContraband: false,
  },

  // Tier 7
  [DeepResourceType.STAR_METAL]: {
    type: DeepResourceType.STAR_METAL,
    name: 'Star Metal',
    description: 'Meteoric iron with otherworldly properties',
    tier: DeepResourceTier.TIER_7,
    baseValue: 500,
    rarity: 'legendary',
    minShaftLevel: 8,
    isContraband: true,
  },
  [DeepResourceType.VOID_CRYSTAL]: {
    type: DeepResourceType.VOID_CRYSTAL,
    name: 'Void Crystal',
    description: 'Dark crystalline formation that absorbs light',
    tier: DeepResourceTier.TIER_7,
    baseValue: 750,
    rarity: 'legendary',
    minShaftLevel: 9,
    isContraband: true,
  },

  // Tier 8
  [DeepResourceType.ELDRITCH_ORE]: {
    type: DeepResourceType.ELDRITCH_ORE,
    name: 'Eldritch Ore',
    description: 'Pulsating mineral from beyond reality, found only in The Scar',
    tier: DeepResourceTier.TIER_8,
    baseValue: 1500,
    rarity: 'cosmic',
    minShaftLevel: 10,
    locationRestriction: 'the_scar',
    isContraband: true,
  },
};

// ============================================================================
// FENCE OPERATIONS
// ============================================================================

/**
 * Fence location definitions
 */
export const FENCE_LOCATIONS: Record<FenceLocationId, IFenceLocation> = {
  [FenceLocationId.FRONTERA_SLIM]: {
    id: FenceLocationId.FRONTERA_SLIM,
    name: "Slim's Back Room",
    npcName: '"Slim" Santiago',
    locationId: 'frontera',
    specialization: FenceSpecialization.GENERAL,
    baseRatePercent: 70,
    trustBonus: 0.5,  // +0.5% per trust point
    maxCapacityPerDay: 50,
    acceptsContraband: true,
    stingRiskAtLowTrust: 15,
  },
  [FenceLocationId.THE_SCAR_HOLLOW]: {
    id: FenceLocationId.THE_SCAR_HOLLOW,
    name: 'The Hollow',
    npcName: 'The Whisper',
    locationId: 'the_scar',
    specialization: FenceSpecialization.EXOTIC,
    baseRatePercent: 75,
    trustBonus: 0.6,
    maxCapacityPerDay: 25,
    acceptsContraband: true,
    stingRiskAtLowTrust: 5, // Law barely reaches The Scar
  },
  [FenceLocationId.RED_GULCH_ASSAY]: {
    id: FenceLocationId.RED_GULCH_ASSAY,
    name: 'Behind the Assay Office',
    npcName: 'Crooked Charlie',
    locationId: 'red_gulch',
    specialization: FenceSpecialization.ORE,
    baseRatePercent: 72,
    trustBonus: 0.55,
    maxCapacityPerDay: 100,
    acceptsContraband: true,
    stingRiskAtLowTrust: 20,
  },
  [FenceLocationId.KAIOWA_MESA_NIGHT]: {
    id: FenceLocationId.KAIOWA_MESA_NIGHT,
    name: 'Night Market',
    npcName: 'Silent Moon',
    locationId: 'kaiowa_mesa',
    specialization: FenceSpecialization.GEMS,
    baseRatePercent: 68,
    trustBonus: 0.7,
    maxCapacityPerDay: 30,
    acceptsContraband: true,
    stingRiskAtLowTrust: 10,
  },
};

/**
 * Trust level thresholds
 */
export const TRUST_LEVEL_THRESHOLDS = {
  [FenceTrustLevel.STRANGER]: { min: 0, max: 20 },
  [FenceTrustLevel.ACQUAINTANCE]: { min: 21, max: 40 },
  [FenceTrustLevel.ASSOCIATE]: { min: 41, max: 60 },
  [FenceTrustLevel.TRUSTED]: { min: 61, max: 80 },
  [FenceTrustLevel.PARTNER]: { min: 81, max: 100 },
} as const;

/** Alias for TRUST_LEVEL_THRESHOLDS */
export const FENCE_TRUST_THRESHOLDS = TRUST_LEVEL_THRESHOLDS;

/**
 * Get trust level from numeric value
 */
export function getTrustLevel(trust: number): FenceTrustLevel {
  if (trust <= 20) return FenceTrustLevel.STRANGER;
  if (trust <= 40) return FenceTrustLevel.ACQUAINTANCE;
  if (trust <= 60) return FenceTrustLevel.ASSOCIATE;
  if (trust <= 80) return FenceTrustLevel.TRUSTED;
  return FenceTrustLevel.PARTNER;
}

/**
 * Sale type value percentages
 */
export const SALE_VALUE_PERCENTAGES = {
  /** Legal ore sold legally */
  LEGAL_LEGAL: 100,
  /** Illegal ore sold legally (suspicious buyer discount) */
  ILLEGAL_LEGAL: 50,
  /** Illegal ore sold to fence */
  ILLEGAL_FENCE: 70,
  /** Illegal ore sold through gang channel */
  ILLEGAL_GANG: 85,
  /** Premium for rare ores */
  RARE_PREMIUM: 20,
  /** Premium for contraband-only ores */
  CONTRABAND_PREMIUM: 30,
} as const;

// ============================================================================
// GANG INTEGRATION
// ============================================================================

/**
 * Gang protection constants
 */
export const GANG_PROTECTION = {
  /** Suspicion accumulation reduction with gang protection */
  SUSPICION_REDUCTION_PERCENT: 50,
  /** Weekly protection fee as percentage of earnings */
  WEEKLY_FEE_PERCENT: 10,
  /** Minimum weekly fee */
  MINIMUM_WEEKLY_FEE: 100,
  /** Base weekly fee amount */
  WEEKLY_FEE_BASE: 50,
  /** Fee increase per suspicion point */
  WEEKLY_FEE_PER_SUSPICION: 2,
  /** Daily suspicion reduction amount */
  DAILY_SUSPICION_REDUCTION: 10,
  /** Gang cut from smuggling channels */
  SMUGGLING_CUT_PERCENT: 15,
  /** Base smuggling channel rate */
  SMUGGLING_BASE_RATE: 85,
} as const;

// ============================================================================
// PROSPECTING SKILL UNLOCKS
// ============================================================================

/**
 * Prospecting skill unlock definitions
 */
export const PROSPECTING_UNLOCKS: IProspectingUnlock[] = [
  {
    type: ProspectingUnlockType.VEIN_DETECTION,
    name: 'Vein Detection',
    description: 'Sense hidden ore deposits nearby',
    requiredLevel: 5,
    effect: '+10% chance to find hidden deposits',
    bonusValue: 10,
  },
  {
    type: ProspectingUnlockType.QUALITY_ASSESSMENT,
    name: 'Quality Assessment',
    description: 'Assess ore quality before mining',
    requiredLevel: 10,
    effect: 'See ore quality before mining',
  },
  {
    type: ProspectingUnlockType.RARE_ORE_SENSE,
    name: 'Rare Ore Sense',
    description: 'Heightened awareness of valuable deposits',
    requiredLevel: 15,
    effect: '+15% rare ore discovery rate',
    bonusValue: 15,
  },
  {
    type: ProspectingUnlockType.DEEP_SURVEY,
    name: 'Deep Survey',
    description: 'Survey deep mining shafts before descent',
    requiredLevel: 20,
    effect: 'Can prospect deep mining shafts',
  },
  {
    type: ProspectingUnlockType.ILLEGAL_PROSPECTING,
    name: 'Illegal Prospecting',
    description: 'Knowledge of staking unregistered claims',
    requiredLevel: 25,
    effect: 'Can stake unregistered claims',
  },
  {
    type: ProspectingUnlockType.MASTER_ASSESSOR,
    name: 'Master Assessor',
    description: 'Expert-level ore quality assessment',
    requiredLevel: 30,
    effect: '+25% ore quality accuracy',
    bonusValue: 25,
  },
  {
    type: ProspectingUnlockType.VEIN_MAPPING,
    name: 'Vein Mapping',
    description: 'Map connected ore veins in an area',
    requiredLevel: 35,
    effect: 'Reveals connected ore veins',
  },
  {
    type: ProspectingUnlockType.DEEP_EARTH_READING,
    name: 'Deep Earth Reading',
    description: 'Sense tier 6+ resources from the surface',
    requiredLevel: 40,
    effect: 'Can detect tier 6+ resources',
  },
  {
    type: ProspectingUnlockType.GHOST_PROSPECTOR,
    name: 'Ghost Prospector',
    description: 'Work undetected at illegal claims',
    requiredLevel: 45,
    effect: '-30% detection at illegal claims',
    bonusValue: 30,
  },
  {
    type: ProspectingUnlockType.LEGENDARY_PROSPECTOR,
    name: 'Legendary Prospector',
    description: 'The earth reveals its secrets to you',
    requiredLevel: 50,
    effect: 'Guaranteed rare discovery weekly',
  },
];

/**
 * Prospecting XP awards
 */
export const PROSPECTING_XP_AWARDS = {
  /** XP for prospecting a vein */
  PROSPECT_SHALLOW: 25,
  PROSPECT_DEEP: 50,
  PROSPECT_EXPLOSIVE: 75,
  /** XP for staking a new claim */
  STAKE_CLAIM: 100,
  /** XP for discovering a rare deposit */
  RARE_DISCOVERY: 200,
  /** XP for completing a deep shaft level */
  COMPLETE_SHAFT_LEVEL: 150,
  /** XP for successful ore collection */
  COLLECT_ORE_BASE: 10,
  /** XP multiplier per resource tier */
  TIER_MULTIPLIER: 1.5,
} as const;

// ============================================================================
// TERRITORY BONUS TYPES (for integration)
// ============================================================================

/**
 * New territory bonus types for illegal mining
 */
export const ILLEGAL_MINING_BONUS_TYPES = {
  /** Reduces suspicion accumulation */
  ILLEGAL_MINING_DETECTION: 'illegal_mining_detection',
  /** Increases illegal ore yield */
  ILLEGAL_MINING_YIELD: 'illegal_mining_yield',
  /** More ore per smuggling channel */
  SMUGGLING_CAPACITY: 'smuggling_capacity',
  /** Better fence prices */
  FENCE_RATE: 'fence_rate',
} as const;

/**
 * Territory bonus caps for illegal mining
 */
export const ILLEGAL_MINING_BONUS_CAPS = {
  [ILLEGAL_MINING_BONUS_TYPES.ILLEGAL_MINING_DETECTION]: 0.50, // Max -50% suspicion gain
  [ILLEGAL_MINING_BONUS_TYPES.ILLEGAL_MINING_YIELD]: 0.40,      // Max +40% yield
  [ILLEGAL_MINING_BONUS_TYPES.SMUGGLING_CAPACITY]: 0.50,        // Max +50% capacity
  [ILLEGAL_MINING_BONUS_TYPES.FENCE_RATE]: 0.15,                // Max +15% fence rates
} as const;
