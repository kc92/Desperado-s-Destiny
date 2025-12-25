/**
 * Incident Constants
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Configuration for incident generation, prevention, effects, and responses.
 */

import {
  IncidentType,
  IncidentCategory,
  IncidentSeverity,
  IncidentTargetType,
  IncidentResponseType,
  IncidentEffectType,
  InsuranceLevel,
  IIncidentTypeConfig,
  IIncidentInsuranceTierConfig,
  IIncidentEffect,
  IIncidentResponse,
} from '../types/incident.types';

/**
 * Timing constants for incident system
 */
export const INCIDENT_TIMING = {
  // Spawn check frequency (milliseconds)
  SPAWN_CHECK_INTERVAL_MS: 30 * 60 * 1000,  // 30 minutes

  // Default response window (hours)
  DEFAULT_RESPONSE_WINDOW_HOURS: 4,

  // Default cooldown between incidents on same target (hours)
  DEFAULT_COOLDOWN_HOURS: 48,

  // Immunity after being hit by incident (hours)
  POST_INCIDENT_IMMUNITY_HOURS: 4,

  // Reminder notification timing (minutes before expiry)
  REMINDER_MINUTES_BEFORE: 30,

  // Auto-resolve threshold for minor incidents (hours)
  AUTO_RESOLVE_MINOR_AFTER_HOURS: 2,
} as const;

/**
 * Base incident chances per target type (daily percentage)
 */
export const BASE_INCIDENT_CHANCES = {
  [IncidentTargetType.PROPERTY]: 5,      // 5% per day
  [IncidentTargetType.BUSINESS]: 6,      // 6% per day
  [IncidentTargetType.MINING_CLAIM]: 8,  // 8% per day
} as const;

/**
 * Severity distribution (must sum to 100)
 */
export const SEVERITY_DISTRIBUTION = {
  [IncidentSeverity.MINOR]: 50,
  [IncidentSeverity.MODERATE]: 30,
  [IncidentSeverity.SEVERE]: 15,
  [IncidentSeverity.CATASTROPHIC]: 5,
} as const;

/**
 * Severity damage multipliers
 */
export const SEVERITY_MULTIPLIERS = {
  [IncidentSeverity.MINOR]: 0.5,
  [IncidentSeverity.MODERATE]: 1.0,
  [IncidentSeverity.SEVERE]: 1.5,
  [IncidentSeverity.CATASTROPHIC]: 2.5,
} as const;

/**
 * Prevention factor reductions
 */
export const PREVENTION_FACTORS = {
  // High condition (per 10 points above 50)
  CONDITION_PER_10_POINTS: 2,
  CONDITION_THRESHOLD: 50,

  // Guards (per guard)
  GUARD_REDUCTION_PER: 5,
  MAX_GUARD_REDUCTION: 25,

  // Territory control
  TERRITORY_CONTROL_REDUCTION: 15,
  CONTESTED_TERRITORY_REDUCTION: 7,

  // Security upgrades (per level)
  SECURITY_UPGRADE_PER_LEVEL: 3,
  MAX_SECURITY_REDUCTION: 15,

  // Insurance (just having it)
  INSURANCE_PRESENCE_REDUCTION: 5,

  // Gang protection
  GANG_PROTECTION_REDUCTION: 10,

  // Maximum total prevention
  MAX_TOTAL_PREVENTION: 60,
} as const;

/**
 * Insurance tier configurations for incidents
 * (Named differently to avoid conflict with raid insurance tiers)
 */
export const INCIDENT_INSURANCE_TIERS: Record<InsuranceLevel, IIncidentInsuranceTierConfig> = {
  [InsuranceLevel.NONE]: {
    level: InsuranceLevel.NONE,
    recoveryPercent: 0,
    weeklyPremium: 0,
    maxClaimPerIncident: 0,
    claimsPerMonth: 0,
    coveredIncidentTypes: [],
  },
  [InsuranceLevel.BASIC]: {
    level: InsuranceLevel.BASIC,
    recoveryPercent: 25,
    weeklyPremium: 50,
    maxClaimPerIncident: 500,
    claimsPerMonth: 2,
    coveredIncidentTypes: [
      IncidentType.FIRE,
      IncidentType.THEFT,
      IncidentType.STRUCTURAL_DAMAGE,
    ],
  },
  [InsuranceLevel.STANDARD]: {
    level: InsuranceLevel.STANDARD,
    recoveryPercent: 50,
    weeklyPremium: 150,
    maxClaimPerIncident: 2000,
    claimsPerMonth: 4,
    coveredIncidentTypes: [
      IncidentType.FIRE,
      IncidentType.THEFT,
      IncidentType.STRUCTURAL_DAMAGE,
      IncidentType.INFESTATION,
      IncidentType.EQUIPMENT_THEFT,
      IncidentType.ENVIRONMENTAL_HAZARD,
    ],
  },
  [InsuranceLevel.PREMIUM]: {
    level: InsuranceLevel.PREMIUM,
    recoveryPercent: 75,
    weeklyPremium: 400,
    maxClaimPerIncident: 10000,
    claimsPerMonth: 8,
    coveredIncidentTypes: Object.values(IncidentType),
  },
} as const;

/**
 * Response option base configurations
 */
export const RESPONSE_OPTIONS: Record<IncidentResponseType, Omit<IIncidentResponse, 'description'>> = {
  [IncidentResponseType.IGNORE]: {
    type: IncidentResponseType.IGNORE,
    cost: 0,
    successChance: 100,
    damageReduction: 0,
    timeRequired: 0,
  },
  [IncidentResponseType.PAY_TO_FIX]: {
    type: IncidentResponseType.PAY_TO_FIX,
    cost: 0, // Calculated dynamically based on damage
    successChance: 95,
    damageReduction: 90,
    timeRequired: 5,
  },
  [IncidentResponseType.INSURANCE_CLAIM]: {
    type: IncidentResponseType.INSURANCE_CLAIM,
    cost: 0,
    successChance: 100,
    damageReduction: 0, // Based on insurance tier
    timeRequired: 0,
  },
  [IncidentResponseType.CALL_FIRE_BRIGADE]: {
    type: IncidentResponseType.CALL_FIRE_BRIGADE,
    cost: 100,
    successChance: 85,
    damageReduction: 70,
    timeRequired: 15,
  },
  [IncidentResponseType.HIRE_GUARDS]: {
    type: IncidentResponseType.HIRE_GUARDS,
    cost: 150,
    successChance: 75,
    damageReduction: 60,
    timeRequired: 30,
  },
  [IncidentResponseType.EMERGENCY_REPAIRS]: {
    type: IncidentResponseType.EMERGENCY_REPAIRS,
    cost: 200,
    successChance: 90,
    damageReduction: 80,
    timeRequired: 60,
  },
  [IncidentResponseType.EXTERMINATOR]: {
    type: IncidentResponseType.EXTERMINATOR,
    cost: 75,
    successChance: 95,
    damageReduction: 85,
    timeRequired: 120,
  },
  [IncidentResponseType.NEGOTIATE]: {
    type: IncidentResponseType.NEGOTIATE,
    cost: 50,
    successChance: 60,
    damageReduction: 50,
    timeRequired: 30,
    requirements: {
      requiredSkill: { skillId: 'charisma', minLevel: 20 },
    },
  },
  [IncidentResponseType.DEFEND_CLAIM]: {
    type: IncidentResponseType.DEFEND_CLAIM,
    cost: 0,
    successChance: 70,
    damageReduction: 100,
    timeRequired: 60,
    requirements: {
      minLevel: 15,
    },
  },
  [IncidentResponseType.BRIBE_INSPECTOR]: {
    type: IncidentResponseType.BRIBE_INSPECTOR,
    cost: 300,
    successChance: 65,
    damageReduction: 100,
    timeRequired: 10,
  },
  [IncidentResponseType.EVACUATE]: {
    type: IncidentResponseType.EVACUATE,
    cost: 50,
    successChance: 100,
    damageReduction: 40,
    timeRequired: 15,
  },
};

/**
 * Base effects for each incident type
 */
export const INCIDENT_BASE_EFFECTS: Record<IncidentType, IIncidentEffect[]> = {
  [IncidentType.FIRE]: [
    { type: IncidentEffectType.CONDITION_DAMAGE, value: 15, description: 'Fire damage to structure' },
    { type: IncidentEffectType.INVENTORY_LOSS, value: 20, description: 'Inventory destroyed by fire' },
  ],
  [IncidentType.THEFT]: [
    { type: IncidentEffectType.GOLD_LOSS, value: 15, description: 'Gold stolen from safe' },
    { type: IncidentEffectType.INVENTORY_LOSS, value: 10, description: 'Items stolen' },
  ],
  [IncidentType.STRUCTURAL_DAMAGE]: [
    { type: IncidentEffectType.CONDITION_DAMAGE, value: 20, description: 'Structural damage' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 12, duration: 12, description: 'Operations halted for repairs' },
  ],
  [IncidentType.INFESTATION]: [
    { type: IncidentEffectType.REPUTATION_LOSS, value: 10, description: 'Reputation damage from pest reports' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 8, duration: 8, description: 'Closure for fumigation' },
  ],
  [IncidentType.WORKER_STRIKE]: [
    { type: IncidentEffectType.PRODUCTION_HALT, value: 24, duration: 24, description: 'Workers on strike' },
  ],
  [IncidentType.CUSTOMER_COMPLAINT]: [
    { type: IncidentEffectType.REPUTATION_LOSS, value: 5, description: 'Bad review circulating' },
  ],
  [IncidentType.SUPPLY_SHORTAGE]: [
    { type: IncidentEffectType.PRODUCTION_HALT, value: 8, duration: 8, description: 'Awaiting supplies' },
    { type: IncidentEffectType.GOLD_LOSS, value: 50, description: 'Emergency supply purchase' },
  ],
  [IncidentType.COMPETITION_UNDERCUT]: [
    { type: IncidentEffectType.REPUTATION_LOSS, value: 8, description: 'Customers lured away' },
  ],
  [IncidentType.HEALTH_INSPECTION_FAILURE]: [
    { type: IncidentEffectType.PRODUCTION_HALT, value: 24, duration: 24, description: 'Closed for inspection' },
    { type: IncidentEffectType.FINE, value: 100, description: 'Health code fine' },
    { type: IncidentEffectType.REPUTATION_LOSS, value: 15, description: 'Public health notice' },
  ],
  [IncidentType.STAFF_TURNOVER]: [
    { type: IncidentEffectType.WORKER_LOSS, value: 1, description: 'Worker quit unexpectedly' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 4, duration: 4, description: 'Training replacement' },
  ],
  [IncidentType.CLAIM_JUMPER]: [
    { type: IncidentEffectType.STATUS_CHANGE, value: 1, description: 'Claim now contested' },
    { type: IncidentEffectType.INVENTORY_LOSS, value: 25, description: 'Resources stolen' },
  ],
  [IncidentType.EQUIPMENT_THEFT]: [
    { type: IncidentEffectType.EQUIPMENT_DAMAGE, value: 1, description: 'Equipment stolen' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 24, duration: 24, description: 'Cannot operate without equipment' },
  ],
  [IncidentType.ENVIRONMENTAL_HAZARD]: [
    { type: IncidentEffectType.CONDITION_DAMAGE, value: 25, description: 'Environmental damage to claim' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 48, duration: 48, description: 'Area unsafe' },
  ],
  [IncidentType.INSPECTOR_CRACKDOWN]: [
    { type: IncidentEffectType.FINE, value: 200, description: 'Mining violation fine' },
    { type: IncidentEffectType.PRODUCTION_HALT, value: 72, duration: 72, description: 'Under investigation' },
  ],
};

/**
 * Complete incident type configurations
 */
export const INCIDENT_TYPE_CONFIGS: Record<IncidentType, IIncidentTypeConfig> = {
  [IncidentType.FIRE]: {
    type: IncidentType.FIRE,
    category: IncidentCategory.PROPERTY,
    applicableTargets: [IncidentTargetType.PROPERTY, IncidentTargetType.BUSINESS],
    baseChance: 2,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.FIRE],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.CALL_FIRE_BRIGADE,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.INSURANCE_CLAIM,
    ],
    responseWindowHours: 2,
    cooldownHours: 72,
    description: 'A fire has broken out at your property!',
    flavorText: 'Smoke rises from the building as flames lick at the wooden beams.',
  },
  [IncidentType.THEFT]: {
    type: IncidentType.THEFT,
    category: IncidentCategory.PROPERTY,
    applicableTargets: [IncidentTargetType.PROPERTY, IncidentTargetType.BUSINESS],
    baseChance: 3,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.THEFT],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.HIRE_GUARDS,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.INSURANCE_CLAIM,
    ],
    responseWindowHours: 4,
    cooldownHours: 48,
    description: 'Thieves have broken into your property!',
    flavorText: 'The lock is broken and the safe stands empty.',
  },
  [IncidentType.STRUCTURAL_DAMAGE]: {
    type: IncidentType.STRUCTURAL_DAMAGE,
    category: IncidentCategory.PROPERTY,
    applicableTargets: [IncidentTargetType.PROPERTY, IncidentTargetType.BUSINESS],
    baseChance: 2,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.STRUCTURAL_DAMAGE],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.EMERGENCY_REPAIRS,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.INSURANCE_CLAIM,
    ],
    responseWindowHours: 6,
    cooldownHours: 96,
    description: 'Structural damage has been discovered!',
    flavorText: 'A support beam has cracked, and the roof sags dangerously.',
  },
  [IncidentType.INFESTATION]: {
    type: IncidentType.INFESTATION,
    category: IncidentCategory.PROPERTY,
    applicableTargets: [IncidentTargetType.PROPERTY, IncidentTargetType.BUSINESS],
    baseChance: 4,
    severityDistribution: { ...SEVERITY_DISTRIBUTION, [IncidentSeverity.CATASTROPHIC]: 2, [IncidentSeverity.MINOR]: 53 },
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.INFESTATION],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.EXTERMINATOR,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 8,
    cooldownHours: 48,
    description: 'Pests have infested your property!',
    flavorText: 'Rats scurry in the corners and cockroaches scatter from the light.',
  },
  [IncidentType.WORKER_STRIKE]: {
    type: IncidentType.WORKER_STRIKE,
    category: IncidentCategory.PROPERTY,
    applicableTargets: [IncidentTargetType.PROPERTY, IncidentTargetType.BUSINESS],
    baseChance: 1,
    severityDistribution: { ...SEVERITY_DISTRIBUTION, [IncidentSeverity.CATASTROPHIC]: 10, [IncidentSeverity.MINOR]: 45 },
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.WORKER_STRIKE],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.NEGOTIATE,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 4,
    cooldownHours: 168, // 1 week
    description: 'Your workers have gone on strike!',
    flavorText: 'They demand better wages and working conditions.',
  },
  [IncidentType.CUSTOMER_COMPLAINT]: {
    type: IncidentType.CUSTOMER_COMPLAINT,
    category: IncidentCategory.BUSINESS,
    applicableTargets: [IncidentTargetType.BUSINESS],
    baseChance: 5,
    severityDistribution: { ...SEVERITY_DISTRIBUTION, [IncidentSeverity.CATASTROPHIC]: 1, [IncidentSeverity.MINOR]: 60 },
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.CUSTOMER_COMPLAINT],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 2,
    cooldownHours: 24,
    description: 'An unhappy customer is spreading bad reviews!',
    flavorText: 'Word travels fast in a small town.',
  },
  [IncidentType.SUPPLY_SHORTAGE]: {
    type: IncidentType.SUPPLY_SHORTAGE,
    category: IncidentCategory.BUSINESS,
    applicableTargets: [IncidentTargetType.BUSINESS],
    baseChance: 4,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.SUPPLY_SHORTAGE],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 4,
    cooldownHours: 48,
    description: 'Supply shipment delayed - you\'re running low!',
    flavorText: 'The stagecoach was robbed and your supplies are gone.',
  },
  [IncidentType.COMPETITION_UNDERCUT]: {
    type: IncidentType.COMPETITION_UNDERCUT,
    category: IncidentCategory.BUSINESS,
    applicableTargets: [IncidentTargetType.BUSINESS],
    baseChance: 3,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.COMPETITION_UNDERCUT],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 6,
    cooldownHours: 72,
    description: 'A competitor is undercutting your prices!',
    flavorText: 'Customers are flocking to the new deals across town.',
  },
  [IncidentType.HEALTH_INSPECTION_FAILURE]: {
    type: IncidentType.HEALTH_INSPECTION_FAILURE,
    category: IncidentCategory.BUSINESS,
    applicableTargets: [IncidentTargetType.BUSINESS],
    baseChance: 2,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.HEALTH_INSPECTION_FAILURE],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.BRIBE_INSPECTOR,
    ],
    responseWindowHours: 1,
    cooldownHours: 168, // 1 week
    description: 'Health inspector found violations!',
    flavorText: 'The inspector shakes his head, scribbling notes furiously.',
  },
  [IncidentType.STAFF_TURNOVER]: {
    type: IncidentType.STAFF_TURNOVER,
    category: IncidentCategory.BUSINESS,
    applicableTargets: [IncidentTargetType.BUSINESS],
    baseChance: 3,
    severityDistribution: { ...SEVERITY_DISTRIBUTION, [IncidentSeverity.CATASTROPHIC]: 3, [IncidentSeverity.MINOR]: 55 },
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.STAFF_TURNOVER],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 4,
    cooldownHours: 48,
    description: 'A key employee has quit!',
    flavorText: 'They\'ve taken a job with a competitor.',
  },
  [IncidentType.CLAIM_JUMPER]: {
    type: IncidentType.CLAIM_JUMPER,
    category: IncidentCategory.MINING,
    applicableTargets: [IncidentTargetType.MINING_CLAIM],
    baseChance: 4,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.CLAIM_JUMPER],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.DEFEND_CLAIM,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 2,
    cooldownHours: 72,
    description: 'Someone is trying to jump your claim!',
    flavorText: 'Armed men are setting up equipment on your land.',
  },
  [IncidentType.EQUIPMENT_THEFT]: {
    type: IncidentType.EQUIPMENT_THEFT,
    category: IncidentCategory.MINING,
    applicableTargets: [IncidentTargetType.MINING_CLAIM],
    baseChance: 3,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.EQUIPMENT_THEFT],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.INSURANCE_CLAIM,
    ],
    responseWindowHours: 4,
    cooldownHours: 48,
    description: 'Mining equipment has been stolen!',
    flavorText: 'The tool shed stands empty, locks broken.',
  },
  [IncidentType.ENVIRONMENTAL_HAZARD]: {
    type: IncidentType.ENVIRONMENTAL_HAZARD,
    category: IncidentCategory.MINING,
    applicableTargets: [IncidentTargetType.MINING_CLAIM],
    baseChance: 2,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.ENVIRONMENTAL_HAZARD],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.EVACUATE,
      IncidentResponseType.PAY_TO_FIX,
      IncidentResponseType.INSURANCE_CLAIM,
    ],
    responseWindowHours: 1,
    cooldownHours: 96,
    description: 'Environmental hazard detected at your claim!',
    flavorText: 'Toxic gas seeps from a newly opened fissure.',
  },
  [IncidentType.INSPECTOR_CRACKDOWN]: {
    type: IncidentType.INSPECTOR_CRACKDOWN,
    category: IncidentCategory.MINING,
    applicableTargets: [IncidentTargetType.MINING_CLAIM],
    baseChance: 2,
    severityDistribution: SEVERITY_DISTRIBUTION,
    baseEffects: INCIDENT_BASE_EFFECTS[IncidentType.INSPECTOR_CRACKDOWN],
    availableResponses: [
      IncidentResponseType.IGNORE,
      IncidentResponseType.BRIBE_INSPECTOR,
      IncidentResponseType.PAY_TO_FIX,
    ],
    responseWindowHours: 2,
    cooldownHours: 168, // 1 week
    description: 'Mining inspector is investigating your claim!',
    flavorText: 'The federal inspector has questions about your permits.',
  },
};

/**
 * Get incident types for a specific target type
 */
export function getIncidentTypesForTarget(targetType: IncidentTargetType): IncidentType[] {
  return Object.values(INCIDENT_TYPE_CONFIGS)
    .filter(config => config.applicableTargets.includes(targetType))
    .map(config => config.type);
}

/**
 * Get incident config by type
 */
export function getIncidentConfig(type: IncidentType): IIncidentTypeConfig {
  return INCIDENT_TYPE_CONFIGS[type];
}

/**
 * Calculate severity based on weighted distribution
 */
export function rollSeverity(distribution: Record<IncidentSeverity, number> = SEVERITY_DISTRIBUTION): IncidentSeverity {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [severity, chance] of Object.entries(distribution)) {
    cumulative += chance;
    if (roll < cumulative) {
      return severity as IncidentSeverity;
    }
  }

  return IncidentSeverity.MODERATE;
}

/**
 * Calculate effective incident chance with prevention factors
 */
export function calculateEffectiveChance(
  baseChance: number,
  preventionReduction: number
): number {
  const cappedReduction = Math.min(preventionReduction, PREVENTION_FACTORS.MAX_TOTAL_PREVENTION);
  return Math.max(0, baseChance * (1 - cappedReduction / 100));
}

/**
 * Calculate damage estimate for an incident
 */
export function calculateDamageEstimate(
  effects: IIncidentEffect[],
  severity: IncidentSeverity,
  propertyValue: number = 1000
): number {
  const multiplier = SEVERITY_MULTIPLIERS[severity];
  let total = 0;

  for (const effect of effects) {
    switch (effect.type) {
      case IncidentEffectType.CONDITION_DAMAGE:
        // Estimate repair cost
        total += effect.value * 50 * multiplier;
        break;
      case IncidentEffectType.INVENTORY_LOSS:
      case IncidentEffectType.GOLD_LOSS:
        // Percentage of property value
        total += (propertyValue * effect.value / 100) * multiplier;
        break;
      case IncidentEffectType.FINE:
        total += effect.value * multiplier;
        break;
      case IncidentEffectType.PRODUCTION_HALT:
        // Estimate lost income per hour
        total += effect.value * 10 * multiplier;
        break;
      case IncidentEffectType.REPUTATION_LOSS:
        // Reputation has indirect value
        total += effect.value * 20 * multiplier;
        break;
      case IncidentEffectType.WORKER_LOSS:
        // Cost to replace worker
        total += effect.value * 100 * multiplier;
        break;
      case IncidentEffectType.EQUIPMENT_DAMAGE:
        total += effect.value * 500 * multiplier;
        break;
    }
  }

  return Math.floor(total);
}
