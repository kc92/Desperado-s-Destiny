/**
 * Competition Types
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * NPC businesses competing for customer traffic, resource scarcity mechanics,
 * and market saturation effects.
 */

/**
 * NPC business personality traits that affect behavior
 */
export enum NPCBusinessPersonality {
  PASSIVE = 'passive',           // Rarely competes, focuses on quality
  BALANCED = 'balanced',         // Normal competitive behavior
  AGGRESSIVE = 'aggressive',     // Price wars, expansion-focused
  QUALITY_FOCUSED = 'quality_focused', // High prices, premium service
}

/**
 * NPC business status
 */
export enum NPCBusinessStatus {
  THRIVING = 'thriving',         // High revenue, expanding
  STABLE = 'stable',             // Normal operation
  STRUGGLING = 'struggling',     // Revenue declining
  CLOSING = 'closing',           // About to close
  CLOSED = 'closed',             // No longer operating
}

/**
 * Resource vein status
 */
export enum ResourceVeinStatus {
  ABUNDANT = 'abundant',         // 100% yield
  NORMAL = 'normal',             // 85% yield
  SCARCE = 'scarce',             // 70% yield
  DEPLETED = 'depleted',         // 50% yield
  EXHAUSTED = 'exhausted',       // 25% yield, may regenerate
}

/**
 * Market saturation levels
 */
export enum MarketSaturationLevel {
  UNDERSATURATED = 'undersaturated', // < 50% capacity, bonus traffic
  BALANCED = 'balanced',             // 50-80% capacity, normal
  SATURATED = 'saturated',           // 80-100% capacity, reduced traffic
  OVERSATURATED = 'oversaturated',   // > 100% capacity, heavy reduction
}

/**
 * Business type categories for capacity tracking
 */
export enum BusinessTypeCategory {
  SALOON = 'saloon',
  GENERAL_STORE = 'general_store',
  BLACKSMITH = 'blacksmith',
  STABLE = 'stable',
  HOTEL = 'hotel',
  BANK = 'bank',
  DOCTOR = 'doctor',
  LAWYER = 'lawyer',
  BARBER = 'barber',
  RESTAURANT = 'restaurant',
  RANCH = 'ranch',
  FARM = 'farm',
  MINE = 'mine',
  LUMBER_MILL = 'lumber_mill',
  TEXTILE = 'textile',
}

/**
 * Zone type for capacity limits
 */
export enum ZoneBusinessType {
  TOWN_CENTER = 'town_center',
  COMMERCIAL = 'commercial',
  FRONTIER = 'frontier',
  INDUSTRIAL = 'industrial',
  RESIDENTIAL = 'residential',
}

/**
 * Resource types that can be scarce
 */
export enum ScarcityResourceType {
  // Mining resources
  GOLD_ORE = 'gold_ore',
  SILVER_ORE = 'silver_ore',
  COPPER_ORE = 'copper_ore',
  IRON_ORE = 'iron_ore',
  COAL = 'coal',
  QUICKSILVER = 'quicksilver',
  DEEP_IRON = 'deep_iron',
  MITHRIL = 'mithril',
  STAR_METAL = 'star_metal',
  VOID_CRYSTAL = 'void_crystal',
  ELDRITCH_ORE = 'eldritch_ore',

  // Other resources
  TIMBER = 'timber',
  WATER = 'water',
  CATTLE = 'cattle',
  GRAIN = 'grain',
}

/**
 * NPC Business document interface
 */
export interface INPCBusiness {
  _id: string;

  // Identity
  name: string;
  ownerName: string;
  businessType: BusinessTypeCategory;

  // Location
  zoneId: string;
  locationId: string;

  // Status
  status: NPCBusinessStatus;
  personality: NPCBusinessPersonality;

  // Economic attributes
  baseQuality: number;           // 1-10 base quality level
  currentQuality: number;        // Current quality (can fluctuate)
  priceModifier: number;         // 0.7-1.3 price modifier (1.0 = standard)
  reputation: number;            // 0-100 reputation score

  // Financial tracking
  weeklyRevenue: number;         // Last week's revenue
  averageRevenue: number;        // Rolling average revenue
  consecutiveLossWeeks: number;  // Weeks of declining revenue
  consecutiveGainWeeks: number;  // Weeks of increasing revenue

  // Competition behavior
  aggressiveness: number;        // 0-100, how likely to start price wars
  resilience: number;            // 0-100, resistance to closing
  expansionTendency: number;     // 0-100, likelihood to expand

  // Protection
  gangProtected: boolean;
  protectingGangId?: string;
  protectionFee: number;         // Weekly fee paid

  // Competition tracking
  lastPriceChangeAt?: Date;
  lastQualityChangeAt?: Date;
  competingWithPlayerBusinesses: string[];  // Player business IDs

  // Timing
  establishedAt: Date;
  closedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Resource vein document interface
 */
export interface IResourceVein {
  _id: string;

  // Identity
  name: string;
  resourceType: ScarcityResourceType;

  // Location
  zoneId: string;
  coordinates?: {
    x: number;
    y: number;
  };

  // Yield tracking
  status: ResourceVeinStatus;
  baseYield: number;             // Base extraction amount per operation
  currentYieldMultiplier: number; // 0.25-1.0 based on status

  // Depletion tracking
  totalCapacity: number;         // Total extractable resources
  extractedAmount: number;       // Amount already extracted
  remainingPercent: number;      // Calculated remaining percentage

  // Competition
  claimCount: number;            // Number of claims on this vein
  claimIds: string[];            // MiningClaim IDs
  competitionPenalty: number;    // 0-0.6 yield reduction from competition

  // Regeneration
  isRenewable: boolean;          // Does it regenerate?
  regenerationRate: number;      // Units per day (if renewable)
  lastRegenerationAt?: Date;

  // Timing
  discoveredAt: Date;
  exhaustedAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Zone capacity configuration
 */
export interface IZoneCapacity {
  zoneId: string;
  zoneType: ZoneBusinessType;
  capacities: Record<BusinessTypeCategory, number>;
  currentCounts: Record<BusinessTypeCategory, number>;
  saturationLevels: Record<BusinessTypeCategory, MarketSaturationLevel>;
}

/**
 * Traffic share calculation result
 */
export interface ITrafficShareResult {
  businessId: string;
  businessName: string;
  isPlayerOwned: boolean;

  // Score components
  reputationScore: number;       // 35% weight
  priceScore: number;            // 30% weight
  qualityScore: number;          // 20% weight
  territoryScore: number;        // 15% weight
  totalScore: number;

  // Final share
  rawShare: number;              // Calculated share before constraints
  finalShare: number;            // After min/max constraints (5-60%)

  // Modifiers applied
  saturationModifier: number;
  territoryBonus: number;
  gangProtectionEffect: number;
}

/**
 * NPC behavior decision
 */
export interface INPCBehaviorDecision {
  businessId: string;
  businessName: string;

  // Decision type
  action: 'price_change' | 'quality_change' | 'expand' | 'contract' | 'close' | 'none';

  // Action details
  priceChange?: number;          // New price modifier
  qualityChange?: number;        // New quality level

  // Reasoning
  trigger: string;               // What triggered the decision
  confidence: number;            // 0-100 confidence in decision
}

/**
 * Market saturation calculation
 */
export interface IMarketSaturationResult {
  zoneId: string;
  businessType: BusinessTypeCategory;
  capacity: number;
  currentCount: number;
  saturationPercent: number;
  level: MarketSaturationLevel;
  trafficModifier: number;       // 0.5-1.25 based on saturation
}

/**
 * Resource scarcity calculation
 */
export interface IResourceScarcityResult {
  veinId: string;
  resourceType: ScarcityResourceType;
  status: ResourceVeinStatus;

  // Yield modifiers
  statusModifier: number;        // Based on vein status (0.25-1.0)
  competitionModifier: number;   // Based on competing claims (0.4-1.0)
  finalYieldMultiplier: number;  // Combined modifier

  // Depletion info
  remainingPercent: number;
  estimatedExhaustionDate?: Date;

  // Claims info
  claimCount: number;
  isOvercrowded: boolean;        // 5+ claims
}

/**
 * Competition update job result
 */
export interface ICompetitionUpdateResult {
  // NPC behavior
  npcBusinessesProcessed: number;
  priceChanges: number;
  qualityChanges: number;
  expansions: number;
  contractions: number;
  closures: number;

  // Resource updates
  veinsProcessed: number;
  veinsRegenerated: number;
  veinsExhausted: number;

  // Market updates
  zonesProcessed: number;
  saturationChanges: number;

  // Performance
  durationMs: number;
  errors: number;
}

/**
 * Protection racket demand from NPC gang
 */
export interface IProtectionRacketDemand {
  businessId: string;
  businessName: string;
  demandingGangId: string;
  demandingGangName: string;
  weeklyFee: number;
  deadline: Date;
  consequences: {
    trafficPenalty: number;      // -15% typical
    sabotageChance: number;      // 10% daily typical
    reputationLoss: number;      // -2/day typical
  };
}

/**
 * Player business competition status
 */
export interface IBusinessCompetitionStatus {
  businessId: string;
  businessName: string;
  businessType: BusinessTypeCategory;
  zoneId: string;

  // Your position
  currentTrafficShare: number;
  currentRank: number;           // Among all businesses of this type
  totalCompetitors: number;

  // Score breakdown
  yourScores: {
    reputation: number;
    price: number;
    quality: number;
    territory: number;
    total: number;
  };

  // Top competitor
  topCompetitor?: {
    name: string;
    isNPC: boolean;
    trafficShare: number;
    strengthReason: string;      // e.g., "Lower prices", "Higher quality"
  };

  // Market conditions
  saturation: MarketSaturationLevel;
  saturationModifier: number;

  // Recommendations
  recommendations: string[];
}

/**
 * DTO for NPC business creation
 */
export interface ICreateNPCBusinessDTO {
  name: string;
  ownerName: string;
  businessType: BusinessTypeCategory;
  zoneId: string;
  locationId: string;
  personality?: NPCBusinessPersonality;
  baseQuality?: number;
  priceModifier?: number;
  aggressiveness?: number;
  resilience?: number;
}

/**
 * DTO for resource vein creation
 */
export interface ICreateResourceVeinDTO {
  name: string;
  resourceType: ScarcityResourceType;
  zoneId: string;
  coordinates?: { x: number; y: number };
  totalCapacity: number;
  baseYield: number;
  isRenewable?: boolean;
  regenerationRate?: number;
}

/**
 * Socket event payloads for real-time updates
 */
export interface ICompetitionSocketEvents {
  'competition:traffic_update': {
    zoneId: string;
    businessType: BusinessTypeCategory;
    shares: ITrafficShareResult[];
  };
  'competition:npc_action': {
    businessId: string;
    businessName: string;
    action: INPCBehaviorDecision['action'];
    details: string;
  };
  'competition:saturation_change': {
    zoneId: string;
    businessType: BusinessTypeCategory;
    oldLevel: MarketSaturationLevel;
    newLevel: MarketSaturationLevel;
  };
  'competition:vein_exhausted': {
    veinId: string;
    veinName: string;
    resourceType: ScarcityResourceType;
    zoneId: string;
  };
  'competition:protection_demand': IProtectionRacketDemand;
}

/**
 * Helper type for zone capacity configuration
 */
export type ZoneCapacityConfig = Record<ZoneBusinessType, Partial<Record<BusinessTypeCategory, number>>>;

/**
 * Helper type for saturation modifiers
 */
export type SaturationModifiers = Record<MarketSaturationLevel, number>;

/**
 * Competition modifier applied to traffic
 */
export interface ICompetitionModifier {
  businessId: string;
  baseTraffic: number;
  saturationModifier: number;
  competitionModifier: number;
  territoryModifier: number;
  gangModifier: number;
  finalTraffic: number;
  modifierBreakdown: string;
}
