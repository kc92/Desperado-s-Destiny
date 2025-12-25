/**
 * Deep Mining Types
 *
 * Phase 13: Deep Mining System
 *
 * Types for:
 * - Prospecting skill system
 * - Illegal/unregistered claims
 * - Underground mining shafts
 * - Fence operations and black market
 * - Gang integration for smuggling
 */

// ============================================================================
// CLAIM LEGAL STATUS
// ============================================================================

/**
 * Legal status of a mining claim
 */
export enum ClaimLegalStatus {
  LEGAL = 'legal',                   // Registered, taxed, no risk
  UNREGISTERED = 'unregistered',     // No permit, moderate risk
  ILLEGAL = 'illegal',               // Active search, high risk
  GANG_PROTECTED = 'gang_protected', // Gang territory, reduced risk
  CONDEMNED = 'condemned',           // Seized by authorities, claim lost
}

/**
 * Suspicion alert level thresholds
 */
export enum SuspicionLevel {
  UNKNOWN = 'unknown',           // 0-25: No attention from authorities
  SUSPICIOUS = 'suspicious',     // 26-50: Random inspections
  ACTIVE_SEARCH = 'active_search', // 51-75: Marshals patrolling
  WARRANT_ISSUED = 'warrant_issued', // 76-100: Arrest on sight
}

// ============================================================================
// DEEP MINING SHAFTS
// ============================================================================

/**
 * Underground shaft levels (1-10)
 */
export type ShaftLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Mining hazard types
 */
export enum HazardType {
  GAS_POCKET = 'gas_pocket',         // Explosive, requires ventilation
  FLOODING = 'flooding',             // Water ingress, requires pumps
  COLLAPSE_RISK = 'collapse_risk',   // Structural failure, requires supports
  TOXIC_FUMES = 'toxic_fumes',       // Health damage, requires mask
  UNSTABLE_CEILING = 'unstable_ceiling', // Random rockfall
}

/**
 * Hazard severity levels
 */
export enum HazardSeverity {
  MINOR = 'minor',       // Small penalty, no equipment needed
  MODERATE = 'moderate', // Medium penalty, basic equipment helps
  SEVERE = 'severe',     // Large penalty, advanced equipment required
  CRITICAL = 'critical', // Dangerous, full equipment required
}

/**
 * Mining equipment types
 */
export enum MiningEquipmentType {
  // Ventilation
  BASIC_VENTILATION = 'basic_ventilation',
  ADVANCED_VENTILATION = 'advanced_ventilation',

  // Structural
  MINE_SUPPORTS = 'mine_supports',
  REINFORCED_SUPPORTS = 'reinforced_supports',

  // Pumping
  DRAINAGE_PUMP = 'drainage_pump',
  STEAM_PUMP = 'steam_pump',

  // Personal Safety
  SAFETY_CANARY = 'safety_canary',
  MINERS_HELMET = 'miners_helmet',
  BREATHING_MASK = 'breathing_mask',
}

/**
 * Mining equipment definition
 */
export interface IMiningEquipment {
  type: MiningEquipmentType;
  name: string;
  description: string;
  cost: number;
  hazardMitigation: {
    hazardType: HazardType;
    reductionPercent: number; // 0-100
  }[];
  requiredForLevel?: ShaftLevel; // Required for this level and above
  maintenanceCostPerDay: number;
}

/**
 * Hazard instance in a shaft
 */
export interface IShaftHazard {
  type: HazardType;
  severity: HazardSeverity;
  level: ShaftLevel;
  mitigatedBy: MiningEquipmentType[];
  currentMitigation: number; // 0-100 based on installed equipment
  lastTriggered?: Date;
}

// ============================================================================
// TIER 6-8 RESOURCES
// ============================================================================

/**
 * Deep mining resource tiers
 */
export enum DeepResourceTier {
  TIER_6 = 6, // Deep Iron, Mithril
  TIER_7 = 7, // Star Metal, Void Crystal
  TIER_8 = 8, // Eldritch Ore (The Scar only)
}

/**
 * Deep resource types
 */
export enum DeepResourceType {
  // Tier 6
  DEEP_IRON = 'deep_iron',
  MITHRIL = 'mithril',

  // Tier 7
  STAR_METAL = 'star_metal',
  VOID_CRYSTAL = 'void_crystal',

  // Tier 8
  ELDRITCH_ORE = 'eldritch_ore',
}

/**
 * Deep resource definition
 */
export interface IDeepResource {
  type: DeepResourceType;
  name: string;
  description: string;
  tier: DeepResourceTier;
  baseValue: number;
  rarity: 'rare' | 'epic' | 'legendary' | 'cosmic';
  minShaftLevel: ShaftLevel;
  locationRestriction?: string; // e.g., 'the_scar' for Eldritch Ore
  isContraband: boolean; // True for illegal-only ores
}

// ============================================================================
// FENCE OPERATIONS
// ============================================================================

/**
 * Fence location identifiers
 */
export enum FenceLocationId {
  FRONTERA_SLIM = 'frontera_slim',       // General goods
  THE_SCAR_HOLLOW = 'the_scar_hollow',   // Exotic/eldritch
  RED_GULCH_ASSAY = 'red_gulch_assay',   // Ore specialist
  KAIOWA_MESA_NIGHT = 'kaiowa_mesa_night', // Rare gems
}

/**
 * Fence trust level thresholds
 */
export enum FenceTrustLevel {
  STRANGER = 'stranger',     // 0-20: Worst rates, high risk
  ACQUAINTANCE = 'acquaintance', // 21-40: Poor rates, moderate risk
  ASSOCIATE = 'associate',   // 41-60: Fair rates, low risk
  TRUSTED = 'trusted',       // 61-80: Good rates, minimal risk
  PARTNER = 'partner',       // 81-100: Best rates, no risk
}

/**
 * Fence specialization
 */
export enum FenceSpecialization {
  GENERAL = 'general',       // All goods, average rates
  ORE = 'ore',               // Mining resources, better rates
  GEMS = 'gems',             // Precious gems, better rates
  EXOTIC = 'exotic',         // Exotic/eldritch materials, better rates
  CONTRABAND = 'contraband', // Illegal goods, accepts everything
}

/**
 * Fence location definition
 */
export interface IFenceLocation {
  id: FenceLocationId;
  name: string;
  npcName: string;
  locationId: string;
  specialization: FenceSpecialization;
  baseRatePercent: number;     // Base value percentage (e.g., 70)
  trustBonus: number;          // Additional % per trust level
  maxCapacityPerDay: number;   // Max items per day
  acceptsContraband: boolean;
  stingRiskAtLowTrust: number; // % chance of sting at STRANGER level
}

/**
 * Fence transaction record
 */
export interface IFenceTransaction {
  transactionId: string;
  characterId: string;
  fenceLocationId: FenceLocationId;
  itemsSold: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    marketValue: number;
    salePrice: number;
    isContraband: boolean;
  }>;
  totalMarketValue: number;
  totalSalePrice: number;
  fenceRatePercent: number;
  trustLevelAtTime: number;
  wasStingOperation: boolean;
  timestamp: Date;
}

/**
 * Character's fence trust data
 */
export interface IFenceTrust {
  fenceLocationId: FenceLocationId;
  trustLevel: number;          // 0-100
  totalTransactions: number;
  totalValueTraded: number;
  lastTransactionAt?: Date;
  stingOperationsTriggered: number;
}

// ============================================================================
// ILLEGAL CLAIMS
// ============================================================================

/**
 * Suspicion change event types
 */
export enum SuspicionEventType {
  ORE_COLLECTED = 'ore_collected',
  LEGAL_SALE = 'legal_sale',
  NPC_PATROL_SPOTTED = 'npc_patrol_spotted',
  BRIBE_FAILED = 'bribe_failed',
  BRIBE_SUCCESS = 'bribe_success',
  GANG_PROTECTION = 'gang_protection',
  TIME_DECAY = 'time_decay',
  INSPECTION_PASSED = 'inspection_passed',
  INSPECTION_FAILED = 'inspection_failed',
}

/**
 * Suspicion change record
 */
export interface ISuspicionChange {
  eventType: SuspicionEventType;
  change: number;              // + or - amount
  previousLevel: number;
  newLevel: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Illegal claim data
 */
export interface IIllegalClaim {
  claimId: string;
  characterId: string;
  locationId: string;
  zoneName: string;

  // Legal status
  legalStatus: ClaimLegalStatus;
  suspicionLevel: number;      // 0-100
  currentAlertLevel: SuspicionLevel;

  // Yield tracking
  totalOreCollected: number;
  totalValueCollected: number;
  lastCollectionAt?: Date;

  // Protection
  gangId?: string;
  protectionStartedAt?: Date;
  protectionFeesPaid: number;

  // History
  suspicionHistory: ISuspicionChange[];
  inspectionHistory: Array<{
    inspectorType: 'inspector' | 'marshal';
    result: 'passed' | 'bribed' | 'caught';
    timestamp: Date;
    bribeAmount?: number;
    fineAmount?: number;
  }>;

  // Status
  isActive: boolean;
  condemnedAt?: Date;
  condemnedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MINING SHAFT
// ============================================================================

/**
 * Mining shaft data
 */
export interface IMiningShaft {
  shaftId: string;
  claimId: string;
  characterId: string;

  // Shaft progression
  currentLevel: ShaftLevel;
  maxLevelReached: ShaftLevel;
  levelProgress: number;       // 0-100 towards next level

  // Equipment
  installedEquipment: Array<{
    type: MiningEquipmentType;
    installedAt: Date;
    condition: number;         // 0-100
    lastMaintenanceAt?: Date;
  }>;

  // Hazards
  activeHazards: IShaftHazard[];
  hazardMitigation: number;    // Overall % mitigation

  // Resources discovered
  discoveredResources: Array<{
    resourceType: DeepResourceType;
    tier: DeepResourceTier;
    quantity: number;
    discoveredAt: Date;
  }>;

  // Statistics
  totalResourcesExtracted: number;
  totalHazardsEncountered: number;
  hazardIncidents: Array<{
    hazardType: HazardType;
    severity: HazardSeverity;
    outcome: 'avoided' | 'minor_damage' | 'major_damage' | 'injury';
    timestamp: Date;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MINING INSPECTIONS
// ============================================================================

/**
 * Inspector types
 */
export enum InspectorType {
  INSPECTOR = 'inspector',   // Regular inspections, can be bribed
  MARSHAL = 'marshal',       // Law enforcement, harder to bribe
  FEDERAL_AGENT = 'federal_agent', // Federal level, cannot be bribed
}

/**
 * Inspection result
 */
export enum InspectionResult {
  NOT_FOUND = 'not_found',   // Claim not discovered
  PASSED = 'passed',         // Passed inspection (legal or bribed)
  BRIBED = 'bribed',         // Successfully bribed inspector
  WARNED = 'warned',         // Warning issued, suspicion increased
  CITATION = 'citation',     // Fine issued
  ARRESTED = 'arrested',     // Character arrested
  CONDEMNED = 'condemned',   // Claim seized
}

/**
 * Mining inspection record
 */
export interface IMiningInspection {
  inspectionId: string;
  claimId: string;
  characterId: string;

  // Inspector info
  inspectorType: InspectorType;
  inspectorName: string;

  // Result
  result: InspectionResult;
  suspicionAtTime: number;
  wasClaimDiscovered: boolean;

  // Bribery
  bribeAttempted: boolean;
  bribeAmount?: number;
  bribeSuccess?: boolean;

  // Consequences
  fineAmount?: number;
  jailTimeMinutes?: number;
  wantedLevelIncrease?: number;
  claimCondemned: boolean;
  oreSeized: number;

  // Timing
  scheduledAt: Date;
  occurredAt: Date;
}

// ============================================================================
// PROSPECTING SKILL UNLOCKS
// ============================================================================

/**
 * Prospecting skill unlock types
 */
export enum ProspectingUnlockType {
  VEIN_DETECTION = 'vein_detection',
  QUALITY_ASSESSMENT = 'quality_assessment',
  RARE_ORE_SENSE = 'rare_ore_sense',
  DEEP_SURVEY = 'deep_survey',
  ILLEGAL_PROSPECTING = 'illegal_prospecting',
  MASTER_ASSESSOR = 'master_assessor',
  VEIN_MAPPING = 'vein_mapping',
  DEEP_EARTH_READING = 'deep_earth_reading',
  GHOST_PROSPECTOR = 'ghost_prospector',
  LEGENDARY_PROSPECTOR = 'legendary_prospector',
}

/**
 * Prospecting skill unlock definition
 */
export interface IProspectingUnlock {
  type: ProspectingUnlockType;
  name: string;
  description: string;
  requiredLevel: number;
  effect: string;
  bonusValue?: number;         // Numeric bonus if applicable
}

// ============================================================================
// GANG SMUGGLING INTEGRATION
// ============================================================================

/**
 * Smuggling channel status
 */
export enum SmugglingChannelStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  COMPROMISED = 'compromised',
  CLOSED = 'closed',
}

/**
 * Gang smuggling channel
 */
export interface ISmugglingChannel {
  channelId: string;
  gangId: string;
  name: string;
  status: SmugglingChannelStatus;

  // Capacity
  dailyCapacity: number;
  usedToday: number;

  // Rates
  baseRatePercent: number;     // e.g., 85%
  gangCutPercent: number;      // e.g., 15%

  // Risk
  compromiseRisk: number;      // 0-100
  lastCompromisedAt?: Date;

  // Stats
  totalTransactions: number;
  totalValueSmuggled: number;
}

/**
 * Smuggling transaction
 */
export interface ISmugglingTransaction {
  transactionId: string;
  channelId: string;
  characterId: string;
  gangId: string;

  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    marketValue: number;
  }>;

  totalMarketValue: number;
  characterReceived: number;   // After gang cut
  gangReceived: number;        // Gang cut
  ratePercent: number;

  wasCompromised: boolean;
  timestamp: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Illegal claim status response
 */
export interface IIllegalClaimStatusResponse {
  claim: IIllegalClaim;
  currentAlertLevel: SuspicionLevel;
  nextInspectionRisk: number;  // % chance in next period
  gangProtectionActive: boolean;
  recommendedActions: string[];
}

/**
 * Deep mining status response
 */
export interface IDeepMiningStatusResponse {
  shaft: IMiningShaft;
  availableResources: IDeepResource[];
  currentHazards: IShaftHazard[];
  requiredEquipment: IMiningEquipment[];
  canDescend: boolean;
  descendBlockedReason?: string;
}

/**
 * Fence listing response
 */
export interface IFenceListingResponse {
  fences: Array<{
    location: IFenceLocation;
    characterTrust: IFenceTrust | null;
    currentCapacity: number;
    estimatedRateForItems: number;
  }>;
}

/**
 * Prospecting skill status response
 */
export interface IProspectingSkillResponse {
  currentLevel: number;
  xp: number;
  xpToNextLevel: number;
  unlockedAbilities: IProspectingUnlock[];
  nextUnlock: IProspectingUnlock | null;
  activeEffects: Array<{
    type: ProspectingUnlockType;
    currentBonus: number;
  }>;
}
