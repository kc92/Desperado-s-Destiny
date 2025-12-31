/**
 * Divine Struggle Mechanics Types - PRIMARY SOURCE
 * Angels & Demons System (Wild West MMORPG)
 *
 * Type definitions for the sin system, blessed/cursed relics, rituals,
 * and divine intervention mechanics of The Rift region.
 *
 * This is the canonical source for all Divine Struggle types.
 * For backwards compatibility with old code, see cosmicHorror.types.ts
 */

/**
 * Sin levels (spiritual corruption)
 */
export enum SinLevel {
  PURE = 'pure',           // 0-20: No effects, in God's grace
  TEMPTED = 'tempted',     // 21-40: Minor visions, slight bonuses
  TAINTED = 'tainted',     // 41-60: Significant visions, power/cost
  FALLEN = 'fallen',       // 61-80: Major changes, NPC reactions
  DAMNED = 'damned',       // 81-100: Near transformation, final stage

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use TAINTED */
  STAINED = 'tainted',
  /** @deprecated Use TEMPTED */
  TOUCHED = 'tempted',
  /** @deprecated Use FALLEN */
  CORRUPTED = 'fallen',
  /** @deprecated Use DAMNED */
  LOST = 'damned',
  /** @deprecated Use PURE */
  CLEAN = 'pure'
}

/**
 * Spiritual torment types that can afflict characters
 */
export enum TormentType {
  PARANOIA = 'paranoia',           // Others seem hostile
  OBSESSION = 'obsession',         // Must complete certain actions
  DREAD = 'dread',                 // Terror of divine judgment
  VISIONS = 'visions',             // See things from beyond
  COMPULSION = 'compulsion',       // Repeat specific behaviors
  PRIDE = 'pride',                 // Delusions of grandeur
  DESPAIR = 'despair',             // Loss of hope and self

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use VISIONS */
  DELUSION = 'visions'
}

/**
 * Sacred knowledge types
 */
export enum SacredKnowledgeType {
  DIVINE_TONGUE = 'divine_tongue',       // Speak with celestial beings
  REALITY_SHAPING = 'reality_shaping',   // Minor miracles
  SPIRIT_SIGHT = 'spirit_sight',         // See beyond death
  SUMMONING = 'summoning',               // Call angels or demons
  EXORCISM = 'exorcism',                 // Banish demons
  BLOOD_COVENANT = 'blood_covenant',     // Power through sacrifice
  PROPHECY = 'prophecy',                 // Glimpse past/future
  REALM_WALKING = 'realm_walking',       // Move between planes

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use DIVINE_TONGUE */
  VOID_SPEECH = 'divine_tongue',
  /** @deprecated Use SPIRIT_SIGHT */
  SOUL_SIGHT = 'spirit_sight',
  /** @deprecated Use PROPHECY */
  TIME_SIGHT = 'prophecy',
  /** @deprecated Use BLOOD_COVENANT */
  BLOOD_MAGIC = 'blood_covenant',
  /** @deprecated Use REALM_WALKING */
  VOID_WALKING = 'realm_walking',
  /** @deprecated Use EXORCISM */
  BANISHMENT = 'exorcism'
}

/**
 * Divine intervention event types
 */
export enum ManifestationType {
  SPATIAL_MIRACLE = 'spatial_miracle',       // Locations change
  TIME_BLESSING = 'time_blessing',           // Different time passage
  FATE_INTERVENTION = 'fate_intervention',   // Unexpected outcomes
  MEMORY_TRIAL = 'memory_trial',             // Forgotten knowledge
  SPIRIT_ECHO = 'spirit_echo',               // Entities duplicated
  PATH_GUIDANCE = 'path_guidance',           // Paths lead elsewhere
  RELIC_AWAKENING = 'relic_awakening',       // Items change properties

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use SPATIAL_MIRACLE */
  SPATIAL_SHIFT = 'spatial_miracle',
  /** @deprecated Use TIME_BLESSING */
  TIME_DILATION = 'time_blessing',
  /** @deprecated Use FATE_INTERVENTION */
  PROBABILITY_FLUX = 'fate_intervention',
  /** @deprecated Use MEMORY_TRIAL */
  MEMORY_CORRUPTION = 'memory_trial',
  /** @deprecated Use SPIRIT_ECHO */
  DUPLICATE_ENTITY = 'spirit_echo',
  /** @deprecated Use PATH_GUIDANCE */
  PATH_ALTERATION = 'path_guidance',
  /** @deprecated Use RELIC_AWAKENING */
  PROPERTY_CHANGE = 'relic_awakening'
}

/**
 * Celestial entity types (Angels and Demons)
 */
export enum CelestialEntityType {
  LESSER_DEMON = 'lesser_demon',           // Minor infernal beings
  WATER_SPIRIT = 'water_spirit',           // River and lake entities
  SHADOW_FIEND = 'shadow_fiend',           // Darkness dwellers
  SOUL_HUNTER = 'soul_hunter',             // Invisible collectors
  REALM_WALKER = 'realm_walker',           // Between-world travelers
  CHAOS_BEAST = 'chaos_beast',             // Formless demons
  ANCIENT_DEMON = 'ancient_demon',         // Pre-human evil
  ARCHDEMON = 'archdemon',                 // Most powerful demons
  GUARDIAN_ANGEL = 'guardian_angel',       // Protective spirits
  SERAPH = 'seraph',                       // High angels
  FALLEN_ANGEL = 'fallen_angel'            // Angels turned dark
}

/**
 * Ritual types
 */
export enum RitualType {
  PROTECTION = 'protection',     // Temporary divine shield
  SUMMONING = 'summoning',       // Call celestial beings
  BINDING = 'binding',           // Trap demons
  REVELATION = 'revelation',     // Gain sacred knowledge
  SACRIFICE = 'sacrifice',       // Power at cost
  EXORCISM = 'exorcism',         // Banish demons
  COMMUNION = 'communion',       // Speak with divine
  TRANSFORMATION = 'transformation', // Change self

  // Backwards compatibility alias (old cosmic horror name)
  /** @deprecated Use EXORCISM */
  BANISHMENT = 'exorcism'
}

/**
 * Sin effects at each level
 */
export interface SinEffects {
  level: SinLevel;
  sinRange: { min: number; max: number };

  // Positive effects (demonic power)
  damageBonus: number;              // % increase to damage
  demonicResistance?: number;       // % resistance to holy damage
  spiritSight: boolean;             // Can see hidden spirits
  fate_manipulation?: number;       // % chance to alter fate

  // Negative effects
  faithDrainMultiplier: number;     // Multiplier to faith loss
  healingPenalty: number;           // % reduction to healing
  npcReactionPenalty: number;       // Negative to NPC interactions
  damnationRisk: number;            // % chance of damnation per day

  // Visual/behavioral changes
  appearance: string;
  behaviorChanges: string[];

  // Special abilities unlocked
  abilities: string[];

  // Backwards compatibility (alias for data files using old name)
  /** @deprecated Use demonicResistance */
  divineResistance?: number;
  /** @deprecated Use fate_manipulation */
  faithManipulation?: number;
}

/**
 * Torment effect
 */
export interface TormentEffect {
  id: string;
  type: TormentType;
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
 * Divine relic (blessed or cursed)
 */
export interface DivineRelic {
  id: string;
  name: string;
  description: string;
  revelationDescription?: string;   // Divine truth revealed (optional for backwards compat)

  // Power
  abilities: DivineAbility[];
  passiveEffects: RelicPassiveEffect[];
  equipSlot?: string;               // null if not equipment

  // Cost
  sinPerUse?: number;
  faithPerUse?: number;
  permanentCost?: PermanentCost;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sinPerUse */
  corruptionPerUse?: number;
  /** @deprecated Use faithPerUse */
  sanityPerUse?: number;

  // Curse
  curseEffect: CurseEffect;
  curseTrigger: string;
  canRemove: boolean;               // Can it be unequipped?

  // Origin and lore
  origin: string;
  entityLinked?: string;            // Celestial being it's tied to
  acquisition: string;              // How to obtain

  // Requirements
  sinRequired?: number;             // Min sin to use - optional for backwards compat
  faithRequired?: number;           // Min faith to use - optional for backwards compat
  levelRequired?: number;           // Optional for backwards compat
  knowledgeRequired?: SacredKnowledgeType[];

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sinRequired */
  corruptionRequired?: number;
  /** @deprecated Use revelationDescription */
  horrorDescription?: string;

  // Rarity and value
  rarity: 'blessed' | 'sanctified' | 'cursed' | 'damned' | 'divine' |
          'abyssal' | 'void-touched' | 'star-forged';  // Backwards compat cosmic horror values
  goldValue: number;
}

/**
 * Divine ability granted by relic
 */
export interface DivineAbility {
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

  // Divine aspect
  faithCost?: number;
  sinGain?: number;
  revelationDescription?: string;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sinGain */
  sanityLoss?: number;
  /** @deprecated Use sinGain */
  corruptionGain?: number;
  /** @deprecated Use revelationDescription */
  horrorDescription?: string;
}

/**
 * Passive effect from divine relic
 */
export interface RelicPassiveEffect {
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
 * Permanent cost of using relic
 */
export interface PermanentCost {
  type: 'stat_loss' | 'max_faith_reduction' | 'physical_change' | 'soul_damage' |
        'max_sanity_reduction';  // Backwards compat cosmic horror value
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
  trigger: 'always' | 'combat' | 'night' | 'full_moon' | 'low_faith' | 'death';

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
  sacredDescription?: string;  // Optional for backwards compat

  // Requirements
  location: string;                 // Where it must be performed
  components: RitualComponent[];
  participantsRequired: number;     // 1 for solo rituals
  timeRequired: number;             // Real-time minutes

  // Costs
  energyCost: number;
  faithCost?: number;   // Optional for backwards compat
  sinCost?: number;     // Optional for backwards compat
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
  sinRequired?: number;      // Optional for backwards compat
  faithRequired?: number;    // Optional for backwards compat
  knowledgeRequired: SacredKnowledgeType[];

  // Lore
  origin: string;
  discoveryMethod: string;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sacredDescription */
  horrorDescription?: string;
  /** @deprecated Use faithCost */
  sanityCost?: number;
  /** @deprecated Use sinRequired */
  corruptionRequired?: number;
  /** @deprecated Use sinCost */
  corruptionCost?: number;
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
  type: 'divine_wrath' | 'sin_gain' | 'summon_hostile' | 'reality_tear' | 'torment' |
        'corruption' | 'backlash' | 'madness';  // Backwards compat cosmic horror values
  description: string;
  effect: {
    damage?: number;
    faithLoss?: number;
    sinGain?: number;
    tormentGained?: TormentType;
    entitySummoned?: string;
    otherEffect?: string;
    /** @deprecated Use faithLoss */
    sanityLoss?: number;  // Backwards compat
    /** @deprecated Use sinGain */
    corruptionGain?: number;  // Backwards compat
    /** @deprecated Use tormentGained */
    madnessGained?: TormentType;  // Backwards compat
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
 * Divine intervention event
 */
export interface DivineIntervention {
  id: string;
  type: ManifestationType;
  name: string;
  description: string;

  // When it occurs
  location: string;
  sinLevelTrigger?: SinLevel;       // Optional for backwards compat
  chance: number;                   // 0-1 per hour in The Rift

  // Effect
  effect: {
    description: string;
    mechanicalEffect: any;
    duration?: number;              // Minutes
  };

  // Severity
  severity: number;                 // 1-10
  faithCost?: number;               // Optional for backwards compat

  // Can it be resisted?
  resistible: boolean;
  resistCheck?: {
    stat: string;
    difficulty: number;
  };

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sinLevelTrigger */
  corruptionLevelTrigger?: SinLevel;
  /** @deprecated Use faithCost */
  sanityLoss?: number;
}

/**
 * Celestial entity definition
 */
export interface CelestialEntity {
  id: string;
  name: string;
  type: CelestialEntityType;
  title: string;                    // "The Tempter in Shadows"

  // Description
  description: string;
  divineDescription: string;
  trueFormDescription?: string;     // Seen at high sin/faith

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
  knowledgeGranted?: SacredKnowledgeType[];
  relicsLinked: string[];
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

  // Effects on The Rift
  areaEffect?: {
    radius: number;
    faithDrain: number;
    divineIntervention: ManifestationType[];
    weatherChange?: string;
    creatureSpawnBonus?: number;
  };

  // Effects on characters
  characterEffect?: {
    sinPerHour: number;
    faithPerHour: number;
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
    type: 'faith' | 'sin' | 'soul_fragment' | 'service' | 'sacrifice';
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
 * Sacred scripture/tome
 */
export interface SacredScripture {
  id: string;
  name: string;
  description: string;

  // Content
  knowledgeType: SacredKnowledgeType;
  knowledgeDescription: string;
  ritualsContained: string[];

  // Cost to read
  faithCost: number;
  sinGain: number;
  timeToRead: number;               // Real-time minutes

  // Requirements
  sinRequired: number;              // For dark texts
  faithRequired: number;            // For holy texts
  languageBarrier?: string;         // Special requirement

  // Discovery
  location: string;
  discoveryMethod: string;
  rarity: 'sacred' | 'apocryphal' | 'forbidden' | 'divine';
}

/**
 * Character sin tracker
 */
export interface CharacterSin {
  _id?: string;
  characterId: string;

  // Sin level
  currentSin: number;               // 0-100
  sinLevel: SinLevel;
  totalSinAccumulated: number;
  totalSinAbsolved: number;

  // Exposure tracking
  timeInRift: number;               // Total minutes
  lastRiftEntry?: Date;
  consecutiveDaysInRift: number;

  // Knowledge
  sacredKnowledge: SacredKnowledgeType[];
  scripturesRead: string[];
  ritualsLearned: string[];
  entitiesEncountered: string[];

  // Torment
  activeTorments: TormentEffect[];
  permanentTorments: TormentType[];
  tormentResistance: number;        // Built up over time

  // Relics
  divineRelics: string[];
  cursedItems: string[];

  // Physical changes
  physicalMarks: string[];          // Stigmata, burns, etc.
  voiceChanges: boolean;
  eyeChanges: boolean;
  skinChanges: boolean;

  // Social effects
  npcFearLevel: number;             // How afraid NPCs are
  divineAwareness: number;          // How much character understands

  // History
  sinEvents: SinEvent[];
  deathsToSin: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sin event record
 */
export interface SinEvent {
  timestamp: Date;
  source: string;
  sinChange: number;
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
 * Rift region instance (formerly The Scar)
 */
export interface RiftInstance {
  _id?: string;

  // State
  sinLevel: number;                 // 0-100, affects whole region
  realityStability: number;         // 0-100, lower = more interventions

  // Active entities
  manifestedEntities: {
    entityId: string;
    presenceLevel: number;
    location: string;
    manifestedAt: Date;
  }[];

  // Active interventions
  activeInterventions: {
    interventionId: string;
    location: string;
    severity: number;
    startedAt: Date;
    expiresAt?: Date;
  }[];

  // Characters present
  charactersInRift: string[];

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
 * Divine struggle constants
 */
export const DIVINE_STRUGGLE_CONSTANTS = {
  // Sin thresholds
  SIN_PURE_MAX: 20,
  SIN_TEMPTED_MAX: 40,
  SIN_TAINTED_MAX: 60,
  SIN_FALLEN_MAX: 80,
  SIN_DAMNED_MAX: 100,

  // Sin gain rates
  RIFT_BASE_SIN_PER_HOUR: 2,
  RIFT_DEEP_SIN_PER_HOUR: 5,
  RITUAL_BASE_SIN: 10,
  RELIC_USE_SIN: 5,
  ENTITY_ENCOUNTER_SIN: 15,
  SCRIPTURE_READING_SIN: 20,

  // Sin absolution
  DEATH_SIN_RESET: 25,              // Lose 25 sin on death
  ABSOLUTION_BASE_REDUCTION: 10,
  MAX_DAILY_ABSOLUTION: 15,

  // Torment
  TORMENT_CHANCE_PER_SIN_10: 0.05,
  TORMENT_DURATION_BASE: 60,        // Minutes
  MAX_ACTIVE_TORMENTS: 3,
  TORMENT_RESISTANCE_PER_EPISODE: 2,

  // Divine intervention
  INTERVENTION_BASE_CHANCE: 0.1,    // Per hour in Rift
  INTERVENTION_HIGH_SIN_CHANCE: 0.3,
  INTERVENTION_DURATION_MIN: 15,
  INTERVENTION_DURATION_MAX: 60,

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

  // Relics
  RELIC_CURSE_TRIGGER_CHANCE: 0.2,
  RELIC_REMOVAL_FAITH_COST: 20,
  RELIC_MAX_EQUIPPED: 1,            // Only one divine relic at a time

  // Knowledge
  KNOWLEDGE_MAX_PER_CHARACTER: 5,
  SCRIPTURE_READ_TIME_MIN: 30,
  SCRIPTURE_COMPREHENSION_CHECK: 0.7,

  // Social penalties
  NPC_FEAR_THRESHOLD_FALLEN: 60,
  NPC_FLEE_THRESHOLD_DAMNED: 80,
  NPC_ATTACK_THRESHOLD_DAMNED: 90,

  // Damnation
  DAMNATION_ROLL_PER_DAY: true,
  DAMNATION_BASE_CHANCE_DAMNED: 0.05,
  DAMNATION_IRREVERSIBLE: true,

  // Energy costs
  RIFT_ENTRY_COST: 20,
  RITUAL_ENERGY_BASE: 30,
  RELIC_USE_ENERGY: 15,
  ENTITY_BARGAIN_ENERGY: 25,

  // Cooldowns (hours)
  ABSOLUTION_COOLDOWN: 48,
  SCRIPTURE_READ_COOLDOWN: 24,
  ENTITY_CONTACT_COOLDOWN: 72
};

/**
 * Helper function to get sin level from numeric value
 */
export function getSinLevel(sin: number): SinLevel {
  if (sin <= DIVINE_STRUGGLE_CONSTANTS.SIN_PURE_MAX) return SinLevel.PURE;
  if (sin <= DIVINE_STRUGGLE_CONSTANTS.SIN_TEMPTED_MAX) return SinLevel.TEMPTED;
  if (sin <= DIVINE_STRUGGLE_CONSTANTS.SIN_TAINTED_MAX) return SinLevel.TAINTED;
  if (sin <= DIVINE_STRUGGLE_CONSTANTS.SIN_FALLEN_MAX) return SinLevel.FALLEN;
  return SinLevel.DAMNED;
}

/**
 * Helper function to calculate sin penalty
 */
export function calculateSinPenalty(sin: number, baseValue: number): number {
  const level = getSinLevel(sin);
  const penalties = {
    [SinLevel.PURE]: 0,
    [SinLevel.TEMPTED]: 0.05,
    [SinLevel.TAINTED]: 0.15,
    [SinLevel.FALLEN]: 0.30,
    [SinLevel.DAMNED]: 0.50
  };

  return baseValue * (1 - penalties[level]);
}

