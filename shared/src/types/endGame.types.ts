/**
 * End-Game Content Types - Phase 14, Wave 14.1
 *
 * Type definitions for level 30-40 end-game content in The Scar region
 * Includes elite enemies, world bosses, corruption mechanics, and daily/weekly challenges
 */

/**
 * End-game zone identifiers for The Scar
 */
export enum ScarZone {
  OUTER_WASTE = 'outer_waste',         // Level 30-32
  TWISTED_LANDS = 'twisted_lands',     // Level 32-35
  DEEP_SCAR = 'deep_scar',             // Level 35-38
  THE_ABYSS = 'the_abyss',             // Level 38-40
}

/**
 * Zone corruption level states (for Scar zones)
 */
export enum ZoneCorruptionLevel {
  MINIMAL = 'minimal',                 // 0-25% corruption
  MODERATE = 'moderate',               // 25-50% corruption
  SEVERE = 'severe',                   // 50-75% corruption
  EXTREME = 'extreme',                 // 75-100% corruption
  OVERWHELMING = 'overwhelming',       // 100%+ (temporary states)
}

/**
 * Elite enemy types unique to The Scar
 */
export enum EliteEnemyType {
  // Corrupted legendary variants
  VOID_BEAR = 'void_bear',             // Corrupted Old Red
  PHASE_COUGAR = 'phase_cougar',       // Corrupted Ghost Cat
  HOLLOW_WOLF = 'hollow_wolf',         // Corrupted Lobo Grande
  STAR_TOUCHED_BUFFALO = 'star_touched_buffalo', // Corrupted Thunder

  // Unique Scar entities
  REALITY_SHREDDER = 'reality_shredder',
  MIND_FLAYER = 'mind_flayer',
  VOID_WALKER = 'void_walker',
  CORRUPTION_ELEMENTAL = 'corruption_elemental',
  DREAM_STALKER = 'dream_stalker',
  THE_FORGOTTEN = 'the_forgotten',
}

/**
 * World boss identifiers
 */
export enum WorldBossType {
  THE_MAW = 'the_maw',                 // L32 zone boss
  THE_COLLECTOR = 'the_collector',     // L35 zone boss
  THE_MIRROR = 'the_mirror',           // L38 zone boss
  THE_HERALD = 'the_herald',           // L40 event boss
}

/**
 * Daily challenge types
 */
export enum DailyChallengeType {
  SCAR_PATROL = 'scar_patrol',         // Kill quota
  ARTIFACT_FRAGMENT = 'artifact_fragment', // Find hidden item
  CORRUPTION_CLEANSE = 'corruption_cleanse', // Purify areas
  SURVIVOR_RESCUE = 'survivor_rescue',  // Save NPCs
}

/**
 * Weekly challenge types
 */
export enum WeeklyChallengeType {
  ELITE_HUNT = 'elite_hunt',           // Kill specific elite
  DEEP_EXPEDITION = 'deep_expedition', // Time trial
  RITUAL_DISRUPTION = 'ritual_disruption', // Stop cult
  RELIC_RECOVERY = 'relic_recovery',   // Dungeon clear
}

/**
 * Corruption ability types
 */
export enum CorruptionAbilityType {
  VOID_STRIKE = 'void_strike',
  REALITY_TEAR = 'reality_tear',
  MADNESS_WAVE = 'madness_wave',
  CORRUPTION_BURST = 'corruption_burst',
  PHASE_SHIFT = 'phase_shift',
  MIND_REND = 'mind_rend',
}

/**
 * Scar reputation tiers
 */
export enum ScarReputationTier {
  NOVICE = 'novice',                   // 0-1000
  INITIATE = 'initiate',               // 1000-2500
  WALKER = 'walker',                   // 2500-5000
  SURVIVOR = 'survivor',               // 5000-8000
  MASTER = 'master',                   // 8000-12000
  ELITE = 'elite',                     // 12000-17000
  CHAMPION = 'champion',               // 17000-23000
  LEGEND = 'legend',                   // 23000-30000
  VOID_TOUCHED = 'void_touched',       // 30000-40000
  VOID_WALKER = 'void_walker',         // 40000+
}

/**
 * Special debuff from zone environment
 */
export interface ZoneDebuff {
  id: string;
  name: string;
  description: string;
  effect: {
    type: 'stat_reduction' | 'damage_over_time' | 'sanity_drain' | 'vision_reduction' | 'energy_drain';
    power: number;
    duration?: number;              // Seconds, undefined = while in zone
  };
  visual: string;                   // Visual effect description
}

/**
 * Special zone mechanic
 */
export interface ScarSpecialMechanic {
  id: string;
  name: string;
  description: string;
  type: 'reality_distortion' | 'time_anomaly' | 'gravity_shift' | 'dimension_bleed' | 'corruption_storm';
  frequency: number;                // How often it occurs (minutes)
  duration: number;                 // How long it lasts (seconds)
  effect: string;                   // Game effect description
  counterplay?: string;             // How players can mitigate
}

/**
 * Zone entry requirement
 */
export interface ZoneRequirement {
  type: 'level' | 'reputation' | 'quest' | 'item' | 'corruption_resistance';
  value: number | string;
  description: string;
}

/**
 * Gatherable resource in The Scar
 */
export interface Gatherable {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  spawnChance: number;              // 0-1
  requiredSkill?: {
    skill: string;
    level: number;
  };
  usedFor: string[];                // Crafting recipes
}

/**
 * Hidden cache in zone
 */
export interface HiddenCache {
  id: string;
  location: string;
  description: string;
  difficulty: number;               // 1-10 to find
  loot: {
    itemId: string;
    quantity: number;
    chance: number;
  }[];
  respawnTime: number;              // Hours
  hint?: string;
}

/**
 * Elite spawn schedule
 */
export interface EliteSpawn {
  eliteId: string;
  spawnChance: number;              // 0-1
  maxSimultaneous: number;
  spawnConditions?: {
    timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
    weather?: string;
    corruptionLevel?: ZoneCorruptionLevel;
  };
  respawnCooldown: number;          // Minutes after death
}

/**
 * End-game zone definition
 */
export interface EndGameZone {
  id: ScarZone;
  name: string;
  description: string;
  lore: string;                     // Detailed background
  levelRange: [number, number];

  // Environment
  corruptionLevel: number;          // 0-100, base level
  realityStability: number;         // 0-100, 0 = very unstable
  ambientDanger: number;            // 0-100, passive danger
  atmosphere: string;               // Environmental description

  // Content
  enemies: string[];                // Enemy IDs that spawn here
  eliteSpawns: EliteSpawn[];
  dailyChallenges: DailyChallengeType[];
  worldBosses: WorldBossType[];

  // Resources
  gatherables: Gatherable[];
  hiddenCaches: HiddenCache[];

  // Entry requirements
  requirements: ZoneRequirement[];

  // Modifiers
  playerDebuffs: ZoneDebuff[];
  specialMechanics: ScarSpecialMechanic[];

  // Navigation
  connectedZones: ScarZone[];
  safeZones: string[];              // Safe rest areas within zone
}

/**
 * Enemy special ability
 */
export interface EnemyAbility {
  id: string;
  name: string;
  description: string;
  damage: number;
  damageType: 'physical' | 'psychic' | 'corruption' | 'void' | 'reality';
  sanityDamage?: number;
  corruptionDamage?: number;
  cooldown: number;                 // Turns
  effects?: {
    type: string;
    duration: number;
    power: number;
  }[];
}

/**
 * Loot drop table entry
 */
export interface LootDrop {
  itemId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  dropChance: number;               // 0-1
  minQuantity: number;
  maxQuantity: number;
  requiresCorruptionMastery?: number; // Optional requirement
}

/**
 * End-game enemy definition
 */
export interface EndGameEnemy {
  id: string;
  name: string;
  level: number;
  type: EliteEnemyType | string;
  description: string;
  lore: string;

  // Combat
  health: number;
  damage: number;
  defense: number;
  criticalChance: number;
  abilities: EnemyAbility[];

  // Horror mechanics
  sanityDamage: number;             // Per turn/encounter
  corruptionOnKill: number;         // Corruption gained by player
  fearLevel: number;                // 1-10

  // Drops
  lootTable: LootDrop[];
  xpReward: number;
  goldReward: {
    min: number;
    max: number;
  };

  // Special traits
  isElite: boolean;
  canPhase: boolean;                // Can teleport/phase
  summonMinions?: {
    type: string;
    count: number;
    cooldown: number;
  };
}

/**
 * World boss phase
 */
export interface WorldBossPhase {
  phase: number;
  healthThreshold: number;          // % health when phase triggers
  name: string;
  description: string;
  attackPowerMultiplier: number;
  newAbilities: EnemyAbility[];
  environmentalChanges: string[];
  specialMechanics?: string[];
}

/**
 * World boss definition
 */
export interface WorldBoss {
  id: WorldBossType;
  name: string;
  title: string;
  level: number;
  description: string;
  lore: string;

  // Spawn
  zone: ScarZone;
  spawnType: 'weekly' | 'biweekly' | 'event';
  spawnDay?: number;                // Day of week (0-6) or month (1-31)
  spawnTime?: number;               // Hour (0-23)
  announceBeforeSpawn: number;      // Minutes of warning

  // Combat
  health: number;
  damage: number;
  defense: number;
  phases: WorldBossPhase[];
  abilities: EnemyAbility[];

  // Mechanics
  requiresGroup: boolean;           // Recommended group size
  recommendedGroupSize?: number;
  enrageTimer?: number;             // Minutes until enrage
  specialMechanics: string[];

  // Horror
  sanityDamage: number;
  corruptionAura: number;           // Corruption per second in range
  fearLevel: number;

  // Rewards
  guaranteedDrops: LootDrop[];
  rareDrops: LootDrop[];
  firstKillBonus?: {
    gold: number;
    item?: string;
    title?: string;
  };
  leaderboardRewards: {
    rank: number;
    reward: string;
  }[];

  // Participation
  damageContributionRequired: number; // Min damage % for loot
  maxParticipants?: number;
}

/**
 * Daily challenge instance
 */
export interface DailyChallenge {
  id: string;
  type: DailyChallengeType;
  name: string;
  description: string;
  zone: ScarZone;

  // Objectives
  objective: {
    type: 'kill' | 'find' | 'cleanse' | 'rescue';
    target?: string;                // Enemy type or item ID
    quantity: number;
    location?: string;
  };

  // Rewards
  rewards: {
    gold: number;
    experience: number;
    scarReputation: number;
    items?: LootDrop[];
  };

  // Timing
  timeLimit?: number;               // Minutes (optional)
  resetTime: number;                // Hour when it resets (0-23)
}

/**
 * Weekly challenge instance
 */
export interface WeeklyChallenge {
  id: string;
  type: WeeklyChallengeType;
  name: string;
  description: string;
  zone: ScarZone;

  // Objectives
  objective: {
    type: 'hunt' | 'expedition' | 'disruption' | 'recovery';
    target?: string;
    difficulty: number;             // 1-10
    requirements?: string[];
  };

  // Rewards
  rewards: {
    gold: number;
    experience: number;
    scarReputation: number;
    guaranteedItems: LootDrop[];
    bonusItems?: LootDrop[];
  };

  // Timing
  timeLimit?: number;               // Minutes (optional)
  resetDay: number;                 // Day of week (0-6)
}

/**
 * Player's Scar progress tracker
 */
export interface ScarProgress {
  _id?: string;
  characterId: string;

  // Reputation
  reputation: number;
  reputationTier: ScarReputationTier;
  nextTierAt: number;

  // Zone access
  unlockedZones: ScarZone[];
  currentZone?: ScarZone;

  // Corruption mastery
  corruptionMastery: number;        // 0-100
  unlockedCorruptionAbilities: CorruptionAbilityType[];
  currentCorruption: number;        // 0-100, temporary corruption

  // Enemy tracking
  elitesDefeated: {
    [key: string]: number;          // Elite ID -> kill count
  };
  worldBossesDefeated: {
    [key: string]: {
      count: number;
      firstDefeatAt?: Date;
      lastDefeatAt?: Date;
      bestDamage?: number;
    };
  };

  // Challenges
  dailyChallengesCompleted: number;
  weeklyChallengesCompleted: number;
  activeDailyChallenge?: string;
  activeWeeklyChallenge?: string;

  // Collectibles
  artifactFragments: {
    [key: string]: number;          // Artifact ID -> fragment count
  };
  completedArtifacts: string[];

  // Statistics
  timeInScar: number;               // Minutes
  totalEnemiesKilled: number;
  totalSanityLost: number;
  totalCorruptionGained: number;
  deathsInScar: number;

  // Achievements
  titles: string[];
  cosmetics: string[];

  // Timestamps
  lastDailyChallengeReset: Date;
  lastWeeklyChallengeReset: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Corruption ability definition
 */
export interface CorruptionAbility {
  id: CorruptionAbilityType;
  name: string;
  description: string;
  requiredMastery: number;          // Corruption mastery level

  // Cost
  corruptionCost: number;           // Temporary corruption gained
  energyCost: number;
  sanityCost?: number;

  // Effect
  damage?: number;
  damageType: 'void' | 'psychic' | 'corruption' | 'reality';
  effects: {
    type: string;
    duration: number;
    power: number;
  }[];

  // Risk
  backfireChance: number;           // 0-1
  backfireEffect: string;

  // Cooldown
  cooldown: number;                 // Seconds
}

/**
 * End-game equipment
 */
export interface EndGameEquipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  description: string;
  lore: string;

  // Requirements
  levelRequirement: number;
  corruptionMasteryRequirement?: number;

  // Stats
  stats: {
    [key: string]: number;
  };

  // Special properties
  voidDamageBonus?: number;
  corruptionResistance?: number;
  realityAnchor?: number;           // Reduces reality distortion
  sanityProtection?: number;

  // Source
  obtainedFrom: string[];           // Boss IDs, challenge types, etc.
  rarity: 'epic' | 'legendary' | 'mythic';
}

/**
 * Expedition leaderboard entry
 */
export interface ExpeditionLeaderboard {
  challengeId: string;
  challengeName: string;
  period: 'daily' | 'weekly' | 'all_time';

  entries: Array<{
    rank: number;
    characterId: string;
    characterName: string;
    completionTime: number;         // Seconds
    score: number;
    completedAt: Date;
  }>;
}

/**
 * Server-wide corruption event (global event)
 */
export interface ScarWorldEvent {
  id: string;
  name: string;
  description: string;
  type: 'incursion' | 'ritual' | 'breach' | 'manifestation';

  // Status
  status: 'announced' | 'active' | 'completed' | 'failed';

  // Timing
  startTime: Date;
  endTime: Date;
  duration: number;                 // Minutes

  // Location
  zone: ScarZone;
  affectedAreas: string[];

  // Objectives
  communityGoal: {
    type: 'kill' | 'cleanse' | 'defend';
    target: string;
    current: number;
    required: number;
  };

  // Participation
  participants: string[];           // Character IDs
  topContributors: Array<{
    characterId: string;
    characterName: string;
    contribution: number;
  }>;

  // Rewards
  rewards: {
    global: LootDrop[];             // Everyone gets these
    tiered: Array<{
      contributionThreshold: number;
      rewards: LootDrop[];
    }>;
  };
}

/**
 * Artifact hunt puzzle
 */
export interface ArtifactHunt {
  artifactId: string;
  name: string;
  description: string;
  lore: string;

  // Discovery
  fragments: Array<{
    id: string;
    name: string;
    location: string;
    clue: string;
    puzzle?: {
      type: 'riddle' | 'sequence' | 'combat' | 'exploration';
      difficulty: number;
      hint: string;
    };
  }>;

  // Assembly
  fragmentsRequired: number;
  assemblyLocation: string;
  assemblyRitual?: string;

  // Reward
  completedArtifact: {
    itemId: string;
    stats: { [key: string]: number };
    specialAbility?: string;
    power: number;
  };
}

/**
 * Request/Response types
 */

export interface EnterScarZoneRequest {
  zone: ScarZone;
}

export interface EnterScarZoneResponse {
  success: boolean;
  zone?: EndGameZone;
  requirements?: {
    met: boolean;
    missing: string[];
  };
  message?: string;
}

export interface StartDailyChallengeRequest {
  challengeType: DailyChallengeType;
}

export interface StartDailyChallengeResponse {
  success: boolean;
  challenge?: DailyChallenge;
  alreadyActive?: boolean;
  message?: string;
}

export interface AttackEliteRequest {
  eliteId: string;
  action: 'attack' | 'ability' | 'item' | 'flee';
  abilityId?: string;
  itemId?: string;
}

export interface AttackEliteResponse {
  success: boolean;
  turnResult: {
    playerDamage: number;
    eliteDamage: number;
    sanityLost: number;
    corruptionGained: number;
    effects: string[];
    defeated?: boolean;
    playerDefeated?: boolean;
  };
  loot?: LootDrop[];
  message?: string;
}

export interface UseCorruptionAbilityRequest {
  abilityId: CorruptionAbilityType;
  targetId?: string;
}

export interface UseCorruptionAbilityResponse {
  success: boolean;
  damage?: number;
  effects?: string[];
  corruptionGained: number;
  backfired?: boolean;
  message?: string;
}

export interface GetScarProgressRequest {
  // Empty - uses auth character
}

export interface GetScarProgressResponse {
  success: boolean;
  progress?: ScarProgress;
  availableZones?: ScarZone[];
  activeChallenges?: {
    daily?: DailyChallenge;
    weekly?: WeeklyChallenge;
  };
}

export interface JoinWorldBossRequest {
  bossId: WorldBossType;
}

export interface JoinWorldBossResponse {
  success: boolean;
  bossSession?: {
    bossId: WorldBossType;
    boss: WorldBoss;
    currentHealth: number;
    maxHealth: number;
    participants: number;
    startedAt: Date;
  };
  message?: string;
}

/**
 * Constants
 */
export const SCAR_CONSTANTS = {
  // Reputation
  REPUTATION_PER_TIER: {
    [ScarReputationTier.NOVICE]: 0,
    [ScarReputationTier.INITIATE]: 1000,
    [ScarReputationTier.WALKER]: 2500,
    [ScarReputationTier.SURVIVOR]: 5000,
    [ScarReputationTier.MASTER]: 8000,
    [ScarReputationTier.ELITE]: 12000,
    [ScarReputationTier.CHAMPION]: 17000,
    [ScarReputationTier.LEGEND]: 23000,
    [ScarReputationTier.VOID_TOUCHED]: 30000,
    [ScarReputationTier.VOID_WALKER]: 40000,
  },

  // Corruption
  MAX_CORRUPTION: 100,
  CORRUPTION_DECAY_RATE: 1,         // Per minute when not in Scar
  CORRUPTION_THRESHOLD_WARNING: 50,
  CORRUPTION_THRESHOLD_DANGER: 75,
  CORRUPTION_THRESHOLD_CRITICAL: 90,

  // Zone entry levels
  ZONE_LEVEL_REQUIREMENTS: {
    [ScarZone.OUTER_WASTE]: 30,
    [ScarZone.TWISTED_LANDS]: 32,
    [ScarZone.DEEP_SCAR]: 35,
    [ScarZone.THE_ABYSS]: 38,
  },

  // Challenge resets
  DAILY_RESET_HOUR: 0,              // Midnight
  WEEKLY_RESET_DAY: 1,              // Monday

  // Combat
  ELITE_DAMAGE_MULTIPLIER: 1.5,
  WORLD_BOSS_DAMAGE_MULTIPLIER: 2.5,
  GROUP_SCALING_FACTOR: 0.3,        // HP increase per additional player

  // Energy costs
  SCAR_EXPLORATION_COST: 10,
  ELITE_ENCOUNTER_COST: 20,
  WORLD_BOSS_ATTEMPT_COST: 25,
  CORRUPTION_ABILITY_BASE_COST: 15,

  // Rewards
  BASE_SCAR_REPUTATION: 10,
  ELITE_REPUTATION_BONUS: 50,
  WORLD_BOSS_REPUTATION_BONUS: 200,
  DAILY_CHALLENGE_REPUTATION: 25,
  WEEKLY_CHALLENGE_REPUTATION: 100,
};

/**
 * Helper functions
 */

export function getScarReputationTier(reputation: number): ScarReputationTier {
  if (reputation >= 40000) return ScarReputationTier.VOID_WALKER;
  if (reputation >= 30000) return ScarReputationTier.VOID_TOUCHED;
  if (reputation >= 23000) return ScarReputationTier.LEGEND;
  if (reputation >= 17000) return ScarReputationTier.CHAMPION;
  if (reputation >= 12000) return ScarReputationTier.ELITE;
  if (reputation >= 8000) return ScarReputationTier.MASTER;
  if (reputation >= 5000) return ScarReputationTier.SURVIVOR;
  if (reputation >= 2500) return ScarReputationTier.WALKER;
  if (reputation >= 1000) return ScarReputationTier.INITIATE;
  return ScarReputationTier.NOVICE;
}

export function getNextTierRequirement(currentTier: ScarReputationTier): number {
  const tiers = Object.values(ScarReputationTier);
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return 0; // Already max tier
  const nextTier = tiers[currentIndex + 1];
  return SCAR_CONSTANTS.REPUTATION_PER_TIER[nextTier];
}

export function canEnterZone(characterLevel: number, zone: ScarZone): boolean {
  return characterLevel >= SCAR_CONSTANTS.ZONE_LEVEL_REQUIREMENTS[zone];
}

export function getZoneCorruptionLevel(corruption: number): ZoneCorruptionLevel {
  if (corruption >= 100) return ZoneCorruptionLevel.OVERWHELMING;
  if (corruption >= 75) return ZoneCorruptionLevel.EXTREME;
  if (corruption >= 50) return ZoneCorruptionLevel.SEVERE;
  if (corruption >= 25) return ZoneCorruptionLevel.MODERATE;
  return ZoneCorruptionLevel.MINIMAL;
}

export function isHighDangerCorruption(corruption: number): boolean {
  return corruption >= SCAR_CONSTANTS.CORRUPTION_THRESHOLD_DANGER;
}
