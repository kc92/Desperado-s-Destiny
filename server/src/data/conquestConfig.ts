/**
 * Conquest Configuration
 *
 * Configuration and rules for territory conquest system
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import {
  TerritoryFactionId,
  ConquestStage,
  FortificationType,
  OccupationStatus,
  ResistanceActivityType,
} from '@desperados/shared';

/**
 * Conquest stage configurations
 */
export const CONQUEST_STAGE_CONFIG = {
  [ConquestStage.CONTESTED]: {
    name: 'Contested',
    description: 'Multiple factions vie for control',
    influenceGap: 20,
    effects: {
      stabilityPenalty: -20,
      priceVolatility: 0.15,
      crimeDifficultyModifier: -10,
      npcMoraleEffect: 'nervous',
    },
    canDeclareSiege: false,
  },
  [ConquestStage.SIEGE_DECLARED]: {
    name: 'Siege Declared',
    description: 'A faction has declared intent to conquer',
    warningPeriodHours: 36,
    effects: {
      stabilityPenalty: -40,
      priceVolatility: 0.25,
      trafficReduction: 0.3,
      npcMoraleEffect: 'fearful',
    },
    canDeclareSiege: false,
  },
  [ConquestStage.ASSAULT]: {
    name: 'Active Assault',
    description: 'War event in progress',
    effects: {
      stabilityPenalty: -60,
      priceVolatility: 0.4,
      accessRestriction: 'combat_zones',
      trafficReduction: 0.7,
      npcMoraleEffect: 'panicked',
    },
    canDeclareSiege: false,
  },
  [ConquestStage.CONTROL_CHANGE]: {
    name: 'Control Transfer',
    description: 'New faction taking control',
    effects: {
      stabilityPenalty: -50,
      priceVolatility: 0.3,
      npcMoraleEffect: 'uncertain',
    },
    canDeclareSiege: false,
  },
  [ConquestStage.CONSOLIDATION]: {
    name: 'Consolidation',
    description: 'New controller establishing order',
    durationDays: 7,
    effects: {
      stabilityPenalty: -30,
      efficiencyPenalty: 0.5,
      npcMoraleEffect: 'wary',
    },
    canDeclareSiege: false,
  },
  [ConquestStage.STABLE]: {
    name: 'Stable',
    description: 'Normal territory control',
    effects: {
      stabilityPenalty: 0,
      priceVolatility: 0,
      npcMoraleEffect: 'normal',
    },
    canDeclareSiege: true,
  },
} as const;

/**
 * Siege requirement configurations
 */
export const SIEGE_REQUIREMENTS = {
  influence: {
    minimum: 40,
    description: 'Must have at least 40% influence in the territory',
    priority: 1,
  },
  resources: {
    minimumGold: 2000,
    minimumSupplies: 500,
    minimumTroops: 50,
    description: 'Requires significant resources to mount a siege',
    priority: 2,
  },
  cooldown: {
    days: 7,
    description: 'Cannot declare siege within 7 days of last attempt',
    priority: 3,
  },
  participants: {
    minimumPlayers: 10,
    minimumFactionReputation: 50,
    description: 'Requires minimum faction member participation',
    priority: 4,
  },
  territory: {
    cannotBeCapital: true,
    cannotBeImmune: true,
    description: 'Some territories cannot be sieged',
    priority: 5,
  },
} as const;

/**
 * Conquest war event configurations
 */
export const CONQUEST_WAR_CONFIG = {
  objectives: {
    hold_position: {
      name: 'Hold Strategic Position',
      points: 100,
      description: 'Maintain control of key location for duration',
      timeRequired: 3600, // 1 hour in seconds
    },
    destroy_fortification: {
      name: 'Destroy Fortification',
      points: 150,
      description: 'Destroy enemy defensive structure',
      fortificationDamage: 50,
    },
    capture_flag: {
      name: 'Capture Territory Flag',
      points: 200,
      description: 'Seize the symbolic flag of territory',
      isVictoryObjective: true,
    },
    eliminate_defenders: {
      name: 'Eliminate Defenders',
      points: 50,
      description: 'Defeat defending forces',
      perKill: 10,
    },
  },
  scoring: {
    objectiveCompletion: 200,
    fortificationDestroyed: 150,
    enemyEliminated: 10,
    positionHeld: 100,
    supplyLinesCut: 75,
    victoryThreshold: 1000,
  },
  duration: {
    minimumHours: 12,
    maximumHours: 72,
    defaultHours: 48,
  },
} as const;

/**
 * Control transfer calculations
 */
export const CONTROL_TRANSFER_CONFIG = {
  winner: {
    minimumInfluenceGain: 25,
    maximumInfluenceGain: 40,
    baseInfluenceGain: 30,
    scoreMultiplier: 0.01, // Additional influence per 100 score points
  },
  loser: {
    influenceFloor: 20,
    influenceReduction: 0.5, // Lose 50% of current influence
    minimumLoss: 30,
  },
  neutral: {
    smallReduction: 5,
    influenceRedistribution: true,
  },
} as const;

/**
 * Occupation status configurations
 */
export const OCCUPATION_CONFIG = {
  [OccupationStatus.NONE]: {
    name: 'Not Occupied',
    efficiency: 1.0,
    resistanceMultiplier: 0,
    durationDays: 0,
  },
  [OccupationStatus.FRESH]: {
    name: 'Fresh Occupation',
    efficiency: 0.5,
    resistanceMultiplier: 2.0,
    durationDays: 3,
    effects: {
      incomeReduction: 0.5,
      npcLoyalty: 'hostile',
      crimeIncrease: 50,
      stabilityPenalty: 40,
    },
  },
  [OccupationStatus.STABILIZING]: {
    name: 'Stabilizing',
    efficiency: 0.75,
    resistanceMultiplier: 1.5,
    durationDays: 4,
    effects: {
      incomeReduction: 0.25,
      npcLoyalty: 'wary',
      crimeIncrease: 25,
      stabilityPenalty: 20,
    },
  },
  [OccupationStatus.STABLE]: {
    name: 'Stable Occupation',
    efficiency: 1.0,
    resistanceMultiplier: 1.0,
    durationDays: 0,
    effects: {
      incomeReduction: 0,
      npcLoyalty: 'neutral',
      crimeIncrease: 0,
      stabilityPenalty: 0,
    },
  },
} as const;

/**
 * Post-conquest effects by control level
 */
export const POST_CONQUEST_EFFECTS = {
  winner: {
    benefits: {
      fullFactionBenefits: true,
      canSetLaws: true,
      canSetTaxes: true,
      territoryIncome: true,
      npcLoyalty: true,
      playerBonuses: {
        shopDiscount: 15,
        reputationBonus: 10,
        energyRegen: 5,
        crimeHeatReduction: 15,
      },
    },
    immunityDays: 7,
  },
  loser: {
    penalties: {
      influenceReduction: 0.5,
      npcsFleeOrHide: 0.6,
      propertiesAtRisk: 0.3,
      playerPenalties: {
        shopPriceIncrease: 25,
        reputationLoss: 20,
        restrictedAccess: true,
      },
    },
    immunityDays: 7,
  },
  neutral: {
    effects: {
      priceFluctuation: 0.15,
      newQuestsAvailable: true,
      oldQuestsRemoved: 0.5,
      reputationAdjustment: 'moderate',
      propertyTaxChange: 0.1,
    },
  },
} as const;

/**
 * Fortification bonus calculations
 */
export const FORTIFICATION_BONUS_CONFIG = {
  baseBonus: {
    [FortificationType.WALLS]: 2.0,
    [FortificationType.WATCHTOWERS]: 1.5,
    [FortificationType.BARRACKS]: 2.0,
    [FortificationType.SUPPLY_DEPOT]: 1.5,
    [FortificationType.ARTILLERY]: 3.0,
  },
  levelMultiplier: 1.0,
  maxTotalBonus: 50, // Maximum combined defense bonus
  damageReduction: {
    light: 0.9,  // 10% damage in siege
    moderate: 0.7, // 30% damage
    heavy: 0.5,  // 50% damage
    destroyed: 0, // No bonus
  },
  healthThresholds: {
    light: 70,
    moderate: 40,
    heavy: 20,
  },
} as const;

/**
 * Resistance activity configurations
 */
export const RESISTANCE_ACTIVITIES = {
  [ResistanceActivityType.SABOTAGE]: {
    name: 'Sabotage',
    description: 'Damage infrastructure and reduce efficiency',
    cost: 500,
    influenceDamage: 5,
    efficiencyDamage: 0.1,
    successRate: 0.6,
    cooldownHours: 12,
    detectability: 'medium',
    consequences: {
      ifCaught: 'arrest',
      reputationLoss: 30,
    },
  },
  [ResistanceActivityType.GUERRILLA]: {
    name: 'Guerrilla Attack',
    description: 'Small-scale attacks on occupying forces',
    cost: 1000,
    influenceDamage: 8,
    moraleDamage: 15,
    successRate: 0.5,
    cooldownHours: 24,
    detectability: 'high',
    consequences: {
      ifCaught: 'combat',
      reputationLoss: 50,
    },
  },
  [ResistanceActivityType.PROPAGANDA]: {
    name: 'Propaganda Campaign',
    description: 'Spread anti-occupation sentiment',
    cost: 800,
    influenceGain: 3,
    resistanceStrength: 5,
    successRate: 0.7,
    cooldownHours: 8,
    detectability: 'low',
    consequences: {
      ifCaught: 'fine',
      reputationLoss: 15,
    },
  },
  [ResistanceActivityType.SMUGGLING]: {
    name: 'Smuggling Operation',
    description: 'Steal resources from occupiers',
    cost: 600,
    resourceTheft: 200,
    successRate: 0.65,
    cooldownHours: 16,
    detectability: 'medium',
    consequences: {
      ifCaught: 'jail',
      reputationLoss: 40,
    },
  },
  [ResistanceActivityType.RECRUITMENT]: {
    name: 'Recruit Supporters',
    description: 'Build resistance network',
    cost: 1200,
    resistanceStrength: 10,
    influenceGain: 2,
    successRate: 0.75,
    cooldownHours: 48,
    detectability: 'low',
    consequences: {
      ifCaught: 'surveillance',
      reputationLoss: 20,
    },
  },
} as const;

/**
 * Liberation campaign thresholds
 */
export const LIBERATION_CONFIG = {
  influenceThreshold: 40,
  minimumResistanceStrength: 30,
  minimumSupporters: 25,
  resourceRequirements: {
    gold: 5000,
    supplies: 1000,
    troops: 75,
  },
  timeEstimate: {
    minimumDays: 14,
    maximumDays: 60,
    perInfluencePoint: 1.5, // Days per point of influence needed
  },
} as const;

/**
 * Diplomatic solution configurations
 */
export const DIPLOMATIC_SOLUTIONS = {
  partial_return: {
    name: 'Partial Territory Return',
    description: 'Return some control in exchange for peace',
    influenceReturn: 30,
    goldCost: 10000,
    duration: 30, // Days
    acceptanceChance: 0.4,
  },
  power_sharing: {
    name: 'Power Sharing Agreement',
    description: 'Share control of territory',
    influenceShare: 40,
    goldCost: 5000,
    duration: 60,
    acceptanceChance: 0.6,
  },
  tribute: {
    name: 'Tributary Status',
    description: 'Pay tribute to avoid conflict',
    goldPerDay: 500,
    influenceDrain: 2,
    duration: 90,
    acceptanceChance: 0.7,
  },
  truce: {
    name: 'Temporary Truce',
    description: 'Cease hostilities temporarily',
    goldCost: 3000,
    duration: 14,
    acceptanceChance: 0.8,
  },
} as const;

/**
 * NPC behavior during conquest stages
 */
export const NPC_CONQUEST_BEHAVIOR = {
  contested: {
    merchantsPriceIncrease: 0.1,
    merchantsLeaveChance: 0.05,
    guardsAlert: 'medium',
    questAvailability: 0.9,
  },
  siege_declared: {
    merchantsPriceIncrease: 0.25,
    merchantsLeaveChance: 0.2,
    guardsAlert: 'high',
    questAvailability: 0.6,
  },
  assault: {
    merchantsPriceIncrease: 0.5,
    merchantsLeaveChance: 0.5,
    guardsAlert: 'maximum',
    questAvailability: 0.2,
  },
  occupation_fresh: {
    oldFactionNpcsLeave: 0.7,
    oldFactionNpcsConvert: 0.2,
    oldFactionNpcsHide: 0.1,
    newFactionNpcsArrive: 0.3,
    neutralNpcsBehavior: 'fearful',
  },
  occupation_stabilizing: {
    oldFactionNpcsLeave: 0.3,
    oldFactionNpcsConvert: 0.4,
    oldFactionNpcsHide: 0.3,
    newFactionNpcsArrive: 0.6,
    neutralNpcsBehavior: 'cautious',
  },
  occupation_stable: {
    oldFactionNpcsLeave: 0.1,
    oldFactionNpcsConvert: 0.7,
    oldFactionNpcsHide: 0.2,
    newFactionNpcsArrive: 1.0,
    neutralNpcsBehavior: 'normal',
  },
} as const;

/**
 * Player property effects during conquest
 */
export const PROPERTY_CONQUEST_EFFECTS = {
  underSiege: {
    accessRestricted: true,
    incomeReduction: 0.5,
    damageRisk: 0.2,
  },
  controlChanged: {
    winnerFaction: {
      noEffect: true,
    },
    loserFaction: {
      seizureRisk: 0.3,
      taxIncrease: 0.5,
      accessRestricted: true,
    },
    neutralFaction: {
      taxIncrease: 0.2,
      accessNormal: true,
    },
  },
  occupation: {
    loyalistProperties: {
      protected: false,
      seizureRisk: 0.4,
    },
    collaboratorProperties: {
      protected: true,
      bonuses: true,
    },
  },
} as const;

/**
 * Conquest timeline configurations
 */
export const CONQUEST_TIMELINE = {
  stages: {
    contested: {
      minDuration: 0,
      maxDuration: Infinity,
      autoAdvance: false,
    },
    siegeDeclared: {
      minDuration: 24, // Hours
      maxDuration: 48, // Hours
      autoAdvance: true,
      advanceTo: ConquestStage.ASSAULT,
    },
    assault: {
      minDuration: 12, // Hours
      maxDuration: 72, // Hours
      autoAdvance: true,
      advanceTo: ConquestStage.CONTROL_CHANGE,
    },
    controlChange: {
      minDuration: 1, // Hours
      maxDuration: 24, // Hours
      autoAdvance: true,
      advanceTo: ConquestStage.CONSOLIDATION,
    },
    consolidation: {
      minDuration: 168, // Hours (7 days)
      maxDuration: 168,
      autoAdvance: true,
      advanceTo: ConquestStage.STABLE,
    },
    stable: {
      minDuration: 0,
      maxDuration: Infinity,
      autoAdvance: false,
    },
  },
} as const;

/**
 * Faction-specific conquest bonuses
 */
export const FACTION_CONQUEST_BONUSES = {
  [TerritoryFactionId.SETTLER_ALLIANCE]: {
    defenseBonus: 10,
    fortificationCostReduction: 0.15,
    npcLoyaltyBonus: 0.2,
    specialAbility: 'Rapid Fortification',
  },
  [TerritoryFactionId.NAHI_COALITION]: {
    guerrillaEffectiveness: 1.5,
    resistanceBonus: 0.25,
    wildernessDefense: 20,
    specialAbility: 'Sacred Ground Defense',
  },
  [TerritoryFactionId.FRONTERA_CARTEL]: {
    resourceTheft: 1.3,
    corruptionResistance: 0.3,
    smugglingBonus: 0.2,
    specialAbility: 'Bribe Officials',
  },
  [TerritoryFactionId.US_MILITARY]: {
    assaultBonus: 15,
    siegeSpeed: 1.2,
    troopEfficiency: 1.25,
    specialAbility: 'Artillery Barrage',
  },
  [TerritoryFactionId.RAILROAD_BARONS]: {
    resourceGeneration: 1.3,
    economicWarfare: 0.25,
    fortificationSpeed: 1.5,
    specialAbility: 'Economic Pressure',
  },
  [TerritoryFactionId.INDEPENDENT_OUTLAWS]: {
    flexibilityBonus: 0.2,
    unpredictability: 1.2,
    raidEffectiveness: 1.3,
    specialAbility: 'Opportunistic Strike',
  },
} as const;

/**
 * Export all configurations
 */
export const CONQUEST_CONFIG = {
  stages: CONQUEST_STAGE_CONFIG,
  requirements: SIEGE_REQUIREMENTS,
  war: CONQUEST_WAR_CONFIG,
  controlTransfer: CONTROL_TRANSFER_CONFIG,
  occupation: OCCUPATION_CONFIG,
  postConquest: POST_CONQUEST_EFFECTS,
  fortifications: FORTIFICATION_BONUS_CONFIG,
  resistance: RESISTANCE_ACTIVITIES,
  liberation: LIBERATION_CONFIG,
  diplomatic: DIPLOMATIC_SOLUTIONS,
  npcBehavior: NPC_CONQUEST_BEHAVIOR,
  propertyEffects: PROPERTY_CONQUEST_EFFECTS,
  timeline: CONQUEST_TIMELINE,
  factionBonuses: FACTION_CONQUEST_BONUSES,
} as const;
