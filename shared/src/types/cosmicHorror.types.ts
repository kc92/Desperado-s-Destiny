/**
 * Cosmic Horror Mechanics Types - Phase 14, Wave 14.1
 *
 * Type definitions for the corruption system, eldritch artifacts, rituals,
 * and reality distortion mechanics of The Scar region
 */

/**
 * Corruption levels
 */
export enum CorruptionLevel {
  CLEAN = 'clean',           // 0-20: No effects
  TOUCHED = 'touched',       // 21-40: Minor visions, slight bonuses
  TAINTED = 'tainted',       // 41-60: Significant visions, power/cost
  CORRUPTED = 'corrupted',   // 61-80: Major changes, NPC reactions
  LOST = 'lost'              // 81-100: Near transformation, final stage
}

/**
 * Madness types that can afflict characters
 */
export enum MadnessType {
  PARANOIA = 'paranoia',           // NPCs seem hostile
  OBSESSION = 'obsession',         // Must complete certain actions
  PHOBIA = 'phobia',               // Terror of specific things
  DELUSION = 'delusion',           // See things that aren't there
  COMPULSION = 'compulsion',       // Repeat specific behaviors
  MEGALOMANIA = 'megalomania',     // Delusions of grandeur
  DISSOCIATION = 'dissociation'    // Loss of sense of self
}

/**
 * Forbidden knowledge types
 */
export enum ForbiddenKnowledgeType {
  VOID_SPEECH = 'void_speech',         // Communicate with entities
  REALITY_SHAPING = 'reality_shaping', // Minor reality changes
  SOUL_SIGHT = 'soul_sight',           // See beyond death
  SUMMONING = 'summoning',             // Call minor entities
  BANISHMENT = 'banishment',           // Repel cosmic horrors
  BLOOD_MAGIC = 'blood_magic',         // Power through sacrifice
  TIME_SIGHT = 'time_sight',           // Glimpse past/future
  VOID_WALKING = 'void_walking'        // Move through non-space
}

/**
 * Reality distortion event types
 */
export enum DistortionType {
  SPATIAL_SHIFT = 'spatial_shift',       // Locations change
  TIME_DILATION = 'time_dilation',       // Different time passage
  PROBABILITY_FLUX = 'probability_flux', // Unexpected outcomes
  MEMORY_CORRUPTION = 'memory_corruption', // Forgotten knowledge
  DUPLICATE_ENTITY = 'duplicate_entity', // NPCs/items duplicated
  PATH_ALTERATION = 'path_alteration',   // Paths lead elsewhere
  PROPERTY_CHANGE = 'property_change'    // Items change properties
}

/**
 * Cosmic entity types
 */
export enum CosmicEntityType {
  LESSER_HORROR = 'lesser_horror',       // Minor manifestations
  DEEP_ONE = 'deep_one',                 // Ocean horrors
  VOID_SPAWN = 'void_spawn',             // Space creatures
  STAR_VAMPIRE = 'star_vampire',         // Invisible bloodsuckers
  DIMENSIONAL_SHAMBLER = 'dimensional_shambler', // Reality walkers
  SHOGGOTH = 'shoggoth',                 // Protoplasmic masses
  ELDER_THING = 'elder_thing',           // Ancient intelligence
  GREAT_OLD_ONE = 'great_old_one'        // Most powerful
}

/**
 * Ritual types
 */
export enum RitualType {
  PROTECTION = 'protection',     // Temporary safety
  SUMMONING = 'summoning',       // Call entities
  BINDING = 'binding',           // Trap entities
  REVELATION = 'revelation',     // Gain knowledge
  SACRIFICE = 'sacrifice',       // Power at cost
  BANISHMENT = 'banishment',     // Repel horrors
  COMMUNION = 'communion',       // Communicate with beyond
  TRANSFORMATION = 'transformation' // Change self
}

/**
 * Corruption effects at each level
 */
export interface CorruptionEffects {
  level: CorruptionLevel;
  corruptionRange: { min: number; max: number };

  // Positive effects
  damageBonus: number;              // % increase to damage
  cosmicResistance: number;         // % resistance to cosmic damage
  voidSight: boolean;               // Can see hidden things
  reality_manipulation: number;     // % chance to bend reality

  // Negative effects
  sanityDrainMultiplier: number;    // Multiplier to sanity loss
  healingPenalty: number;           // % reduction to healing
  npcReactionPenalty: number;       // Negative to NPC interactions
  transformationRisk: number;       // % chance of transformation per day

  // Visual/behavioral changes
  appearance: string;
  behaviorChanges: string[];

  // Special abilities unlocked
  abilities: string[];
}

/**
 * Madness effect
 */
export interface MadnessEffect {
  id: string;
  type: MadnessType;
  name: string;
  description: string;

  // Duration
  duration: number;                 // Minutes, -1 for permanent
  startedAt: Date;
  expiresAt?: Date;

  // Effects
  severity: number;                 // 1-10
  gameplayEffects: {
    visionImpairment?: number;      // 0-1, reduces accuracy
    statPenalty?: number;           // Flat stat reduction
    actionRestrictions?: string[];  // Actions that are blocked
    forcedActions?: string[];       // Actions character must take
    npcHostility?: number;          // Increased aggression
  };

  // Triggers and symptoms
  triggerConditions: string[];      // What makes it worse
  symptoms: string[];               // What player experiences

  // Treatment
  curedBy: string[];                // Methods to remove it
}

/**
 * Eldritch artifact
 */
export interface EldritchArtifact {
  id: string;
  name: string;
  description: string;
  horrorDescription: string;        // Disturbing revelation

  // Power
  abilities: EldritchAbility[];
  passiveEffects: ArtifactPassiveEffect[];
  equipSlot?: string;               // null if not equipment

  // Cost
  corruptionPerUse: number;
  sanityPerUse: number;
  permanentCost?: PermanentCost;

  // Curse
  curseEffect: CurseEffect;
  curseTrigger: string;
  canRemove: boolean;               // Can it be unequipped?

  // Origin and lore
  origin: string;
  entityLinked?: string;            // Cosmic entity it's tied to
  acquisition: string;              // How to obtain

  // Requirements
  corruptionRequired: number;       // Min corruption to use
  levelRequired: number;
  knowledgeRequired?: ForbiddenKnowledgeType[];

  // Rarity and value
  rarity: 'cursed' | 'damned' | 'abyssal' | 'void-touched' | 'star-forged';
  goldValue: number;
}

/**
 * Eldritch ability granted by artifact
 */
export interface EldritchAbility {
  id: string;
  name: string;
  description: string;

  // Mechanics
  type: 'active' | 'passive' | 'triggered';
  energyCost?: number;
  cooldown?: number;                // Minutes

  // Effects
  damage?: number;
  damageType?: string;
  healing?: number;
  buffs?: { stat: string; amount: number; duration: number }[];
  debuffs?: { stat: string; amount: number; duration: number }[];

  // Horror aspect
  sanityLoss: number;
  corruptionGain: number;
  horrorDescription: string;
}

/**
 * Passive effect from eldritch artifact
 */
export interface ArtifactPassiveEffect {
  id: string;
  name: string;
  description: string;

  // Stat modifications
  statBonus?: { [stat: string]: number };
  resistanceBonus?: { [type: string]: number };

  // Special effects
  specialEffect?: string;
  alwaysActive: boolean;
}

/**
 * Permanent cost of using artifact
 */
export interface PermanentCost {
  type: 'stat_loss' | 'max_sanity_reduction' | 'physical_change' | 'soul_damage';
  description: string;
  effect: any;                      // Varies by type
}

/**
 * Curse effect
 */
export interface CurseEffect {
  id: string;
  name: string;
  description: string;

  // When it triggers
  trigger: 'always' | 'combat' | 'night' | 'full_moon' | 'low_sanity' | 'death';

  // Effect
  effect: {
    type: string;
    severity: number;
    description: string;
  };

  // Can it be removed?
  removable: boolean;
  removalMethod?: string;
}

/**
 * Ritual definition
 */
export interface Ritual {
  id: string;
  name: string;
  type: RitualType;
  description: string;
  horrorDescription: string;

  // Requirements
  location: string;                 // Where it must be performed
  components: RitualComponent[];
  participantsRequired: number;     // 1 for solo rituals
  timeRequired: number;             // Real-time minutes

  // Costs
  energyCost: number;
  sanityCost: number;
  corruptionCost: number;
  goldCost?: number;
  permanentCost?: string;

  // Mechanics
  difficulty: number;               // 1-10
  successChance: number;            // Base 0-1
  canFail: boolean;
  failureConsequence: RitualFailure;

  // Results
  successResults: RitualResult[];
  criticalSuccess?: RitualResult[];

  // Restrictions
  cooldown: number;                 // Hours
  maxUsesPerCharacter?: number;
  corruptionRequired: number;
  knowledgeRequired: ForbiddenKnowledgeType[];

  // Lore
  origin: string;
  discoveryMethod: string;
}

/**
 * Ritual component
 */
export interface RitualComponent {
  itemId: string;
  name: string;
  quantity: number;
  consumed: boolean;                // Destroyed in ritual?
  description: string;
}

/**
 * Ritual failure consequence
 */
export interface RitualFailure {
  type: 'backlash' | 'corruption' | 'summon_hostile' | 'reality_tear' | 'madness';
  description: string;
  effect: {
    damage?: number;
    sanityLoss?: number;
    corruptionGain?: number;
    madnessGained?: MadnessType;
    entitySummoned?: string;
    otherEffect?: string;
  };
}

/**
 * Ritual result
 */
export interface RitualResult {
  type: 'knowledge' | 'power' | 'summon' | 'protection' | 'transformation' | 'item';
  description: string;
  effect: any;                      // Varies by type
  duration?: number;                // Minutes, if temporary
}

/**
 * Reality distortion event
 */
export interface RealityDistortion {
  id: string;
  type: DistortionType;
  name: string;
  description: string;

  // When it occurs
  location: string;
  corruptionLevelTrigger: CorruptionLevel;
  chance: number;                   // 0-1 per hour in The Scar

  // Effect
  effect: {
    description: string;
    mechanicalEffect: any;
    duration?: number;              // Minutes
  };

  // Severity
  severity: number;                 // 1-10
  sanityLoss: number;

  // Can it be resisted?
  resistible: boolean;
  resistCheck?: {
    stat: string;
    difficulty: number;
  };
}

/**
 * Cosmic entity definition
 */
export interface CosmicEntity {
  id: string;
  name: string;
  type: CosmicEntityType;
  title: string;                    // "The Whisperer in Darkness"

  // Description
  description: string;
  horrorDescription: string;
  trueFormDescription?: string;     // Seen at high corruption

  // Presence system
  minPresence: number;              // 0-100, minimum to manifest
  maxPresence: number;
  currentPresence: number;
  presenceEffects: PresenceEffect[];

  // Combat (if manifestable)
  canBeFought: boolean;
  health?: number;
  attackPower?: number;
  defense?: number;
  specialAbilities?: string[];

  // Interaction
  canBargain: boolean;
  bargainRequirements?: string[];
  bargainOffers?: EntityBargain[];

  // Banishment
  canBanish: boolean;
  banishmentMethod?: string;
  banishmentDifficulty?: number;

  // Knowledge
  knowledgeGranted?: ForbiddenKnowledgeType[];
  artifactsLinked: string[];
  ritualsLinked: string[];

  // Lore
  origin: string;
  goals: string;
  weakness?: string;
}

/**
 * Entity presence effect
 */
export interface PresenceEffect {
  presenceLevel: number;            // At what presence this occurs
  name: string;
  description: string;

  // Effects on The Scar
  areaEffect?: {
    radius: number;
    sanityDrain: number;
    realityDistortion: DistortionType[];
    weatherChange?: string;
    creatureSpawnBonus?: number;
  };

  // Effects on characters
  characterEffect?: {
    corruptionPerHour: number;
    sanityPerHour: number;
    visions: string[];
    forcedActions?: string[];
  };
}

/**
 * Entity bargain offer
 */
export interface EntityBargain {
  id: string;
  name: string;
  description: string;

  // What entity offers
  rewards: {
    type: string;
    value: any;
    description: string;
  }[];

  // What entity demands
  cost: {
    type: 'sanity' | 'corruption' | 'soul_fragment' | 'service' | 'sacrifice';
    amount: number;
    description: string;
    permanent?: boolean;
  }[];

  // Long-term consequences
  consequences: string[];
  canBreak: boolean;
  breakConsequence?: string;
}

/**
 * Forbidden knowledge tome
 */
export interface EldritchTome {
  id: string;
  name: string;
  description: string;

  // Content
  knowledgeType: ForbiddenKnowledgeType;
  knowledgeDescription: string;
  ritualsContained: string[];

  // Cost to read
  sanityCost: number;
  corruptionGain: number;
  timeToRead: number;               // Real-time minutes

  // Requirements
  corruptionRequired: number;
  languageBarrier?: string;         // Special requirement

  // Discovery
  location: string;
  discoveryMethod: string;
  rarity: 'forbidden' | 'profane' | 'blasphemous' | 'unnameable';
}

/**
 * Character corruption tracker
 */
export interface CharacterCorruption {
  _id?: string;
  characterId: string;

  // Corruption level
  currentCorruption: number;        // 0-100
  corruptionLevel: CorruptionLevel;
  totalCorruptionGained: number;
  totalCorruptionPurged: number;

  // Exposure tracking
  timeInScar: number;               // Total minutes
  lastScarEntry?: Date;
  consecutiveDaysInScar: number;

  // Knowledge
  forbiddenKnowledge: ForbiddenKnowledgeType[];
  tomesRead: string[];
  ritualsLearned: string[];
  entitiesEncountered: string[];

  // Madness
  activeMadness: MadnessEffect[];
  permanentMadness: MadnessType[];
  madnessResistance: number;        // Built up over time

  // Artifacts
  eldritchArtifacts: string[];
  cursedItems: string[];

  // Physical changes
  physicalMutations: string[];
  voiceChanges: boolean;
  eyeChanges: boolean;
  skinChanges: boolean;

  // Social effects
  npcFearLevel: number;             // How afraid NPCs are
  cosmicAwareness: number;          // How much character understands

  // History
  corruptionEvents: CorruptionEvent[];
  deathsToCorruption: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Corruption event record
 */
export interface CorruptionEvent {
  timestamp: Date;
  source: string;
  corruptionChange: number;
  description: string;
  location?: string;
}

/**
 * Active ritual state
 */
export interface ActiveRitual {
  _id?: string;
  characterId: string;
  ritualId: string;

  // State
  status: 'preparing' | 'in_progress' | 'completed' | 'failed' | 'interrupted';
  progress: number;                 // 0-100

  // Details
  location: string;
  startedAt: Date;
  completesAt: Date;

  // Participants (for group rituals)
  participants: string[];

  // Components used
  componentsProvided: { itemId: string; quantity: number }[];

  // Result (when completed)
  result?: RitualResult[];
  failure?: RitualFailure;
}

/**
 * Scar region instance
 */
export interface ScarInstance {
  _id?: string;

  // State
  corruptionLevel: number;          // 0-100, affects whole region
  realityStability: number;         // 0-100, lower = more distortions

  // Active entities
  manifestedEntities: {
    entityId: string;
    presenceLevel: number;
    location: string;
    manifestedAt: Date;
  }[];

  // Active distortions
  activeDistortions: {
    distortionId: string;
    location: string;
    severity: number;
    startedAt: Date;
    expiresAt?: Date;
  }[];

  // Characters present
  charactersInScar: string[];

  // History
  majorEvents: {
    timestamp: Date;
    type: string;
    description: string;
  }[];

  // Timestamps
  lastUpdate: Date;
}

/**
 * Cosmic horror constants
 */
export const COSMIC_HORROR_CONSTANTS = {
  // Corruption thresholds
  CORRUPTION_CLEAN_MAX: 20,
  CORRUPTION_TOUCHED_MAX: 40,
  CORRUPTION_TAINTED_MAX: 60,
  CORRUPTION_CORRUPTED_MAX: 80,
  CORRUPTION_LOST_MAX: 100,

  // Corruption gain rates
  SCAR_BASE_CORRUPTION_PER_HOUR: 2,
  SCAR_DEEP_CORRUPTION_PER_HOUR: 5,
  RITUAL_BASE_CORRUPTION: 10,
  ARTIFACT_USE_CORRUPTION: 5,
  ENTITY_ENCOUNTER_CORRUPTION: 15,
  TOME_READING_CORRUPTION: 20,

  // Corruption purging
  DEATH_CORRUPTION_RESET: 25,       // Lose 25 corruption on death
  PURIFICATION_BASE_REDUCTION: 10,
  MAX_DAILY_PURGE: 15,

  // Madness
  MADNESS_CHANCE_PER_CORRUPTION_10: 0.05,
  MADNESS_DURATION_BASE: 60,        // Minutes
  MAX_ACTIVE_MADNESS: 3,
  MADNESS_RESISTANCE_PER_EPISODE: 2,

  // Reality distortion
  DISTORTION_BASE_CHANCE: 0.1,      // Per hour in Scar
  DISTORTION_HIGH_CORRUPTION_CHANCE: 0.3,
  DISTORTION_DURATION_MIN: 15,
  DISTORTION_DURATION_MAX: 60,

  // Entity presence
  ENTITY_PRESENCE_GAIN_PER_HOUR: 1,
  ENTITY_PRESENCE_RITUAL_BOOST: 20,
  ENTITY_MANIFESTATION_THRESHOLD: 50,
  ENTITY_FULL_POWER_THRESHOLD: 80,

  // Rituals
  RITUAL_SUCCESS_BASE: 0.5,
  RITUAL_SUCCESS_PER_KNOWLEDGE: 0.1,
  RITUAL_CRITICAL_CHANCE: 0.1,
  RITUAL_COOLDOWN_BASE: 24,         // Hours

  // Artifacts
  ARTIFACT_CURSE_TRIGGER_CHANCE: 0.2,
  ARTIFACT_REMOVAL_SANITY_COST: 20,
  ARTIFACT_MAX_EQUIPPED: 1,         // Only one eldritch artifact at a time

  // Knowledge
  KNOWLEDGE_MAX_PER_CHARACTER: 5,
  TOME_READ_TIME_MIN: 30,
  TOME_COMPREHENSION_CHECK: 0.7,

  // Social penalties
  NPC_FEAR_THRESHOLD_CORRUPTED: 60,
  NPC_FLEE_THRESHOLD_LOST: 80,
  NPC_ATTACK_THRESHOLD_LOST: 90,

  // Transformation
  TRANSFORMATION_ROLL_PER_DAY: true,
  TRANSFORMATION_BASE_CHANCE_LOST: 0.05,
  TRANSFORMATION_IRREVERSIBLE: true,

  // Energy costs
  SCAR_ENTRY_COST: 20,
  RITUAL_ENERGY_BASE: 30,
  ARTIFACT_USE_ENERGY: 15,
  ENTITY_BARGAIN_ENERGY: 25,

  // Cooldowns (hours)
  PURIFICATION_COOLDOWN: 48,
  TOME_READ_COOLDOWN: 24,
  ENTITY_CONTACT_COOLDOWN: 72
};

/**
 * Helper function to get corruption level from numeric value
 */
export function getCorruptionLevel(corruption: number): CorruptionLevel {
  if (corruption <= COSMIC_HORROR_CONSTANTS.CORRUPTION_CLEAN_MAX) return CorruptionLevel.CLEAN;
  if (corruption <= COSMIC_HORROR_CONSTANTS.CORRUPTION_TOUCHED_MAX) return CorruptionLevel.TOUCHED;
  if (corruption <= COSMIC_HORROR_CONSTANTS.CORRUPTION_TAINTED_MAX) return CorruptionLevel.TAINTED;
  if (corruption <= COSMIC_HORROR_CONSTANTS.CORRUPTION_CORRUPTED_MAX) return CorruptionLevel.CORRUPTED;
  return CorruptionLevel.LOST;
}

/**
 * Helper function to calculate corruption effects
 */
export function calculateCorruptionPenalty(corruption: number, baseValue: number): number {
  const level = getCorruptionLevel(corruption);
  const penalties = {
    [CorruptionLevel.CLEAN]: 0,
    [CorruptionLevel.TOUCHED]: 0.05,
    [CorruptionLevel.TAINTED]: 0.15,
    [CorruptionLevel.CORRUPTED]: 0.30,
    [CorruptionLevel.LOST]: 0.50
  };

  return baseValue * (1 - penalties[level]);
}
