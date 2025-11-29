/**
 * Weird West Creatures System Types - Phase 10, Wave 10.2
 *
 * Type definitions for supernatural creatures, cryptids, and horror elements
 */

/**
 * Creature category types
 */
export enum CreatureCategory {
  CRYPTID = 'cryptid',           // American folklore creatures
  UNDEAD = 'undead',             // Ghosts, revenants, spectral entities
  LOVECRAFTIAN = 'lovecraftian', // Cosmic horrors from The Scar
  SPIRIT = 'spirit',             // Native American spirits
  BOSS = 'boss'                  // Major endgame horrors
}

/**
 * Damage types for weakness/immunity system
 */
export enum DamageType {
  PHYSICAL = 'physical',
  FIRE = 'fire',
  COLD = 'cold',
  POISON = 'poison',
  SILVER = 'silver',
  HOLY = 'holy',
  PSYCHIC = 'psychic',
  LIGHTNING = 'lightning',
  ACID = 'acid'
}

/**
 * Sanity states
 */
export enum SanityState {
  STABLE = 'stable',             // 75-100 sanity
  RATTLED = 'rattled',           // 50-74 sanity
  SHAKEN = 'shaken',             // 25-49 sanity
  BREAKING = 'breaking',         // 10-24 sanity
  SHATTERED = 'shattered'        // 0-9 sanity
}

/**
 * Hallucination types
 */
export enum HallucinationType {
  VISUAL = 'visual',             // See things that aren't there
  AUDITORY = 'auditory',         // Hear whispers, screams
  PARANOIA = 'paranoia',         // Feel watched, hunted
  DREAD = 'dread',               // Overwhelming fear
  CONFUSION = 'confusion'        // Disorientation
}

/**
 * Spawn condition types
 */
export enum SpawnConditionType {
  TIME_OF_DAY = 'time_of_day',
  WEATHER = 'weather',
  MOON_PHASE = 'moon_phase',
  LOCATION_STATE = 'location_state',
  PLAYER_CONDITION = 'player_condition',
  QUEST_STATE = 'quest_state',
  RITUAL = 'ritual'
}

/**
 * Aura effect types
 */
export enum AuraEffectType {
  SANITY_DRAIN = 'sanity_drain',
  FEAR = 'fear',
  COLD = 'cold',
  MADNESS = 'madness',
  WEAKNESS = 'weakness',
  CONFUSION = 'confusion',
  HYPNOSIS = 'hypnosis',
  SUFFOCATION = 'suffocation'
}

/**
 * Spawn condition definition
 */
export interface SpawnCondition {
  type: SpawnConditionType;
  value: string | number | boolean;
  description: string;
}

/**
 * Creature special attack
 */
export interface CreatureAttack {
  id: string;
  name: string;
  description: string;
  damage: number;
  damageType: DamageType;
  sanityDamage?: number;
  effectChance?: number;
  effect?: {
    type: string;
    duration: number;
    description: string;
  };
  cooldown?: number;
}

/**
 * Weakness definition
 */
export interface Weakness {
  damageType: DamageType;
  multiplier: number;           // 1.5 = 50% extra damage
  description: string;
  requiredItem?: string;        // Specific item needed
}

/**
 * Aura effect
 */
export interface AuraEffect {
  type: AuraEffectType;
  radius: number;               // In game units
  power: number;                // Effect strength
  description: string;
  tickInterval?: number;        // How often it applies (seconds)
}

/**
 * Creature drop item
 */
export interface CreatureDrop {
  itemId: string;
  name: string;
  dropChance: number;           // 0-1
  minQuantity: number;
  maxQuantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  value: number;                // Gold value
}

/**
 * Weird West creature definition
 */
export interface WeirdWestCreature {
  id: string;
  name: string;
  category: CreatureCategory;
  description: string;
  horrorDescription: string;    // Disturbing first encounter text
  lore: string;                 // Background story

  // Location and spawning
  locations: string[];
  spawnConditions: SpawnCondition[];
  encounterChance: number;      // 0-1, base chance when conditions met

  // Requirements to encounter
  levelRequirement: number;
  sanityRequirement?: number;   // Some appear only at low sanity
  questRequirement?: string;

  // Combat statistics
  health: number;
  attackPower: number;
  defense: number;
  specialAttacks: CreatureAttack[];

  // Weakness and immunity system
  weaknesses: Weakness[];
  immunities: DamageType[];
  resistances?: { type: DamageType; multiplier: number }[];

  // Horror mechanics
  sanityDamage: number;         // Per encounter/turn
  auraEffects: AuraEffect[];
  fearLevel: number;            // 1-10, affects encounter descriptions

  // Rewards
  drops: CreatureDrop[];
  xpReward: number;
  goldReward: { min: number; max: number };
  achievementId?: string;

  // Behavioral traits
  behaviorPattern: 'aggressive' | 'territorial' | 'stalking' | 'ambush' | 'summoner';
  canFlee: boolean;
  fleeThreshold?: number;       // HP percentage

  // Visual/atmosphere
  appearance: string;           // Physical description
  soundDescription: string;     // What it sounds like
  omenSigns: string[];          // Environmental warnings
}

/**
 * Sanity tracker for a character
 */
export interface SanityTracker {
  _id?: string;
  characterId: string;

  // Current state
  currentSanity: number;        // 0-100
  maxSanity: number;            // Can be reduced by permanent trauma
  sanityState: SanityState;

  // History
  totalSanityLost: number;
  totalSanityRestored: number;
  encountersWithHorror: number;

  // Effects
  activeHallucinations: Hallucination[];
  permanentTraumas: Trauma[];

  // Resistance
  horrorResistance: number;     // Built up over time, reduces sanity loss

  // Timestamps
  lastSanityDrain: Date;
  lastRestoration: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Active hallucination
 */
export interface Hallucination {
  type: HallucinationType;
  description: string;
  severity: number;             // 1-10
  startedAt: Date;
  duration: number;             // Minutes
  expiresAt: Date;
  effects?: {
    statsDebuff?: number;
    visionImpairment?: boolean;
    controlLoss?: boolean;
  };
}

/**
 * Permanent trauma from sanity breaks
 */
export interface Trauma {
  id: string;
  name: string;
  description: string;
  effect: string;
  maxSanityReduction: number;
  acquiredAt: Date;
  triggeredBy: string;          // Creature ID or event
}

/**
 * Weird West encounter
 */
export interface WeirdWestEncounter {
  _id?: string;
  characterId: string;
  creatureId: string;
  creature?: WeirdWestCreature;

  // Encounter state
  status: 'active' | 'victory' | 'defeat' | 'fled' | 'banished';
  encounterType: 'random' | 'quest' | 'ritual' | 'summoned';

  // Combat state
  creatureHealth: number;
  creatureMaxHealth: number;
  turnsElapsed: number;

  // Player state
  playerHealth: number;
  playerMaxHealth: number;
  playerSanity: number;
  sanityLostThisEncounter: number;

  // Environment
  location: string;
  weatherCondition?: string;
  timeOfDay?: string;
  moonPhase?: string;

  // Results
  loot?: CreatureDrop[];
  xpGained?: number;
  goldGained?: number;
  sanityRestored?: number;      // If victory with holy items

  // Timestamps
  startedAt: Date;
  endedAt?: Date;
}

/**
 * Sanity restoration method
 */
export interface SanityRestoration {
  methodId: string;
  name: string;
  description: string;
  location: string;
  sanityRestored: number;       // Fixed or range
  cost?: number;                // Gold cost
  energyCost?: number;
  cooldown?: number;            // Minutes
  requirements?: {
    minLevel?: number;
    itemRequired?: string;
    questRequired?: string;
  };
}

/**
 * Ritual summoning definition
 */
export interface RitualSummoning {
  ritualId: string;
  name: string;
  description: string;
  creatureId: string;           // What it summons

  // Requirements
  location: string;
  requiredItems: string[];
  minLevel: number;
  sanityCheck?: number;         // Sanity test to perform

  // Consequences
  sanityLoss: number;           // Cost to perform
  successChance: number;        // 0-1
  failureConsequence: string;

  // Rewards if defeated
  uniqueRewards?: string[];
}

/**
 * Encounter result
 */
export interface WeirdWestEncounterResult {
  success: boolean;
  encounter: WeirdWestEncounter;
  message: string;
  horrorDescription?: string;

  // State changes
  sanityChange: number;
  healthChange: number;
  hallucinationsGained?: Hallucination[];
  traumasGained?: Trauma[];

  // Combat info
  damageDealt?: number;
  damageTaken?: number;
  effectsApplied?: string[];

  // Loot if victory
  loot?: CreatureDrop[];
  xpGained?: number;
  goldGained?: number;
}

/**
 * Horror combat action
 */
export interface HorrorCombatAction {
  type: 'attack' | 'defend' | 'use_item' | 'flee' | 'banish';
  targetId?: string;
  itemId?: string;
  description?: string;
}

/**
 * Banishment attempt (special action vs undead/spirits)
 */
export interface BanishmentAttempt {
  methodType: 'holy_water' | 'silver' | 'ritual' | 'prayer' | 'salt_circle';
  itemUsed?: string;
  characterLevel: number;
  spiritBonus: number;
  creaturePower: number;
  successChance: number;
  result: 'success' | 'partial' | 'failure' | 'backfire';
  description: string;
}

/**
 * Sanity check
 */
export interface SanityCheck {
  difficulty: number;           // 1-10
  currentSanity: number;
  horrorResistance: number;
  roll: number;                 // Random 1-100
  success: boolean;
  sanityLoss: number;
  effects?: string[];
}

/**
 * Creature bestiary entry (player knowledge)
 */
export interface BestiaryEntry {
  _id?: string;
  characterId: string;
  creatureId: string;

  // Discovery
  discovered: boolean;
  firstEncounteredAt?: Date;
  timesEncountered: number;
  timesDefeated: number;

  // Knowledge unlocked
  knownWeaknesses: DamageType[];
  knownImmunities: DamageType[];
  knownAttacks: string[];
  loreDiscovered: number;       // 0-100%

  // Notes
  playerNotes?: string;
}

/**
 * Horror atmosphere constants
 */
export const HORROR_CONSTANTS = {
  // Sanity thresholds
  SANITY_MAX: 100,
  SANITY_STABLE_MIN: 75,
  SANITY_RATTLED_MIN: 50,
  SANITY_SHAKEN_MIN: 25,
  SANITY_BREAKING_MIN: 10,

  // Restoration rates
  BASE_SANITY_REGEN: 1,         // Per hour in safe location
  SPIRIT_SPRINGS_RESTORE: 50,
  PRAYER_RESTORE: 10,
  REST_RESTORE: 20,

  // Resistance building
  HORROR_RESISTANCE_PER_ENCOUNTER: 0.5,
  MAX_HORROR_RESISTANCE: 50,

  // Hallucination chances by sanity state
  HALLUCINATION_CHANCE: {
    stable: 0,
    rattled: 0.05,
    shaken: 0.15,
    breaking: 0.35,
    shattered: 0.60
  },

  // Trauma thresholds
  TRAUMA_SANITY_THRESHOLD: 10,  // Below this, risk permanent trauma
  MAX_TRAUMAS: 5,
  TRAUMA_SANITY_REDUCTION: 10,  // Each trauma reduces max sanity

  // Combat modifiers by sanity
  SANITY_COMBAT_PENALTY: {
    stable: 0,
    rattled: -5,
    shaken: -15,
    breaking: -30,
    shattered: -50
  },

  // Weakness multipliers
  WEAKNESS_MULTIPLIER_MINOR: 1.25,
  WEAKNESS_MULTIPLIER_MAJOR: 1.5,
  WEAKNESS_MULTIPLIER_CRITICAL: 2.0,

  // Boss creature modifiers
  BOSS_HEALTH_MULTIPLIER: 3.0,
  BOSS_SANITY_DAMAGE_MULTIPLIER: 2.0,
  BOSS_XP_MULTIPLIER: 5.0,

  // Encounter chances by time
  NIGHT_SPAWN_MULTIPLIER: 2.0,
  FULL_MOON_MULTIPLIER: 1.5,
  NEW_MOON_MULTIPLIER: 1.2,

  // Energy costs
  WEIRD_WEST_ENCOUNTER_COST: 15,
  RITUAL_SUMMONING_COST: 25,
  BANISHMENT_COST: 10,

  // Cooldowns (minutes)
  SPIRIT_SPRINGS_COOLDOWN: 60,
  RITUAL_COOLDOWN: 120
};

/**
 * Sanity restoration locations
 */
export const SANITY_RESTORATION_METHODS: SanityRestoration[] = [
  {
    methodId: 'spirit_springs',
    name: 'Spirit Springs',
    description: 'Sacred healing waters that cleanse the mind and restore sanity. The waters glow faintly under moonlight.',
    location: 'Spirit Springs',
    sanityRestored: 50,
    energyCost: 10,
    cooldown: 60
  },
  {
    methodId: 'church_prayer',
    name: 'Prayer at Church',
    description: 'Seek solace in prayer. Faith can be a shield against darkness.',
    location: 'Church',
    sanityRestored: 15,
    cost: 5,
    energyCost: 5,
    cooldown: 30
  },
  {
    methodId: 'medicine_lodge',
    name: 'Medicine Lodge Ceremony',
    description: 'Nahi shamans perform a cleansing ritual with sage and chanting.',
    location: 'Medicine Lodge',
    sanityRestored: 30,
    cost: 25,
    energyCost: 15,
    cooldown: 45,
    requirements: {
      minLevel: 5
    }
  },
  {
    methodId: 'doctors_sedation',
    name: 'Doctor\'s Sedation',
    description: 'A strong sedative and medical care. Not ideal, but it works.',
    location: 'Doctor\'s Office',
    sanityRestored: 20,
    cost: 30,
    energyCost: 0
  },
  {
    methodId: 'safe_rest',
    name: 'Safe Rest',
    description: 'Rest in a safe, well-lit location. Time heals all wounds.',
    location: 'Any Safe Town',
    sanityRestored: 10,
    energyCost: 5,
    cooldown: 15
  }
];
