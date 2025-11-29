/**
 * Legendary Animal System Types
 *
 * Types for the legendary hunting system - rare, powerful creatures
 * that provide ultimate hunting challenges with unique rewards
 */

/**
 * Legendary animal categories
 */
export enum LegendaryCategory {
  PREDATOR = 'predator',           // Bears, wolves, cougars
  PREY = 'prey',                   // Buffalo, elk, pronghorn
  BIRD = 'bird',                   // Eagles, turkeys
  UNIQUE = 'unique',               // Special/mythical creatures
}

/**
 * Legendary animal difficulty tier
 */
export enum LegendaryTier {
  RARE = 'rare',                   // Level 15-20 required
  EPIC = 'epic',                   // Level 20-28 required
  LEGENDARY = 'legendary',         // Level 28-32 required
  MYTHIC = 'mythic',               // Level 35+ required
}

/**
 * Spawn conditions for legendary animals
 */
export enum LegendarySpawnCondition {
  TIME_DAWN = 'dawn',              // 5am-7am
  TIME_DAY = 'day',                // 7am-6pm
  TIME_DUSK = 'dusk',              // 6pm-8pm
  TIME_NIGHT = 'night',            // 8pm-5am
  WEATHER_CLEAR = 'clear',
  WEATHER_RAIN = 'rain',
  WEATHER_STORM = 'storm',
  WEATHER_FOG = 'fog',
  MOON_FULL = 'full_moon',
  MOON_NEW = 'new_moon',
}

/**
 * Discovery status for legendary animals
 */
export enum DiscoveryStatus {
  UNKNOWN = 'unknown',             // No knowledge of the creature
  RUMORED = 'rumored',             // Heard rumors from NPCs
  TRACKED = 'tracked',             // Found clues/tracks
  LOCATED = 'located',             // Knows where to find it
  ENCOUNTERED = 'encountered',     // Has seen the creature
  DEFEATED = 'defeated',           // Successfully hunted
}

/**
 * Combat phase for multi-stage legendary fights
 */
export interface CombatPhase {
  phase: number;
  healthThreshold: number;         // % health when phase triggers
  description: string;
  attackPowerMultiplier: number;
  defensePowerMultiplier: number;
  specialAbilities: string[];
  environmentalHazard?: string;
  summonMinions?: {
    type: string;
    count: number;
  };
}

/**
 * Special ability for legendary animals
 */
export interface LegendaryAbility {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defense' | 'buff' | 'debuff' | 'summon' | 'environmental';
  damage?: number;
  effect?: {
    type: 'bleed' | 'stun' | 'fear' | 'poison' | 'armor_break' | 'speed_reduction';
    duration: number;              // Turns
    power: number;
  };
  cooldown: number;                // Turns before can use again
  priority: number;                // Higher = more likely to use
}

/**
 * Legendary material drop
 */
export interface LegendaryDrop {
  itemId: string;
  name: string;
  description: string;
  rarity: 'legendary' | 'mythic';
  dropChance: number;              // 0-1 (1 = guaranteed)
  quantity?: {
    min: number;
    max: number;
  };
  usedFor: string[];               // Crafting recipes, etc.
}

/**
 * Permanent stat bonus from legendary hunt
 */
export interface StatBonus {
  type: 'cunning' | 'spirit' | 'combat' | 'craft' | 'max_energy' | 'critical_chance' | 'damage_reduction';
  amount: number;
  description: string;
}

/**
 * Location where clues can be found
 */
export interface ClueLocation {
  location: string;
  clueType: 'tracks' | 'kill_site' | 'witness' | 'remains' | 'warning';
  description: string;
  requiresSkill?: {
    skill: string;
    level: number;
  };
}

/**
 * Faction requirement for legendary access
 */
export interface FactionRequirement {
  faction: 'settlerAlliance' | 'nahiCoalition' | 'frontera';
  reputation: number;              // Minimum reputation required
  warning?: string;                // Warning about consequences
}

/**
 * Recommended gear for legendary hunt
 */
export interface RecommendedGear {
  weapons: string[];
  armor: string[];
  consumables: string[];
  special?: string[];              // Unique items that help
}

/**
 * Main legendary animal definition
 */
export interface LegendaryAnimal {
  id: string;
  name: string;                    // "Old Red"
  title: string;                   // "The Demon Bear"
  category: LegendaryCategory;
  tier: LegendaryTier;
  description: string;             // Short description
  lore: string;                    // Detailed backstory
  location: string;                // Primary location
  alternateLocations?: string[];   // Other possible spawn points

  // Requirements
  levelRequirement: number;
  reputationRequirement?: FactionRequirement;
  questRequirement?: string;       // Must complete quest first
  itemRequirement?: string;        // Need special item to summon/find

  // Spawn mechanics
  spawnConditions: LegendarySpawnCondition[];
  spawnChance: number;             // 0-1 chance when conditions met
  respawnCooldown: number;         // Hours until can spawn again (globally)

  // Combat stats
  health: number;
  attackPower: number;
  defensePower: number;
  criticalChance: number;
  accuracy: number;
  evasion: number;

  // Special mechanics
  specialAbilities: LegendaryAbility[];
  phases: CombatPhase[];
  immunities?: string[];           // Status effects it's immune to
  weaknesses?: string[];           // Damage types it's weak to

  // Rewards
  guaranteedDrops: LegendaryDrop[];
  possibleDrops?: LegendaryDrop[];
  goldReward: {
    min: number;
    max: number;
  };
  experienceReward: number;
  achievementId: string;
  titleUnlocked: string;           // "Demon Slayer", "Ghost Hunter"
  permanentBonus?: StatBonus;

  // Discovery system
  clueLocations: ClueLocation[];
  rumorsFromNPCs: string[];        // NPC IDs who know about it
  newspaperHeadline?: string;      // Headline when defeated

  // Additional info
  recommendedGear: RecommendedGear;
  strategyHints: string[];
  difficulty: number;              // 1-10 scale
  canFlee: boolean;                // Can player flee once engaged?
  companions: {
    helpful: string[];             // Companion types that help
    hindering: string[];           // Companion types that hinder
  };
}

/**
 * Player's legendary hunt record
 */
export interface LegendaryHuntRecord {
  characterId: string;
  legendaryId: string;
  discoveryStatus: DiscoveryStatus;

  // Discovery progress
  rumorsHeard: string[];           // NPC IDs
  cluesFound: string[];            // Clue location IDs
  discoveredAt?: Date;

  // Encounter history
  encounterCount: number;
  defeatedCount: number;
  lastEncounteredAt?: Date;
  lastDefeatedAt?: Date;

  // Best attempt
  bestAttempt?: {
    date: Date;
    damageDone: number;
    healthRemaining: number;
    turnsSurvived: number;
  };

  // Rewards claimed
  rewardsClaimed: boolean;
  trophyObtained: boolean;
  titleUnlocked: boolean;
  permanentBonusApplied: boolean;
}

/**
 * Active legendary hunt session
 */
export interface LegendaryHuntSession {
  sessionId: string;
  characterId: string;
  legendaryId: string;
  legendary: LegendaryAnimal;

  // Combat state
  currentPhase: number;
  legendaryHealth: number;
  legendaryMaxHealth: number;
  turnCount: number;

  // Tracking
  totalDamageDone: number;
  abilitiesUsed: string[];
  currentCooldowns: Map<string, number>;

  // Minions (if any)
  activeMinions?: Array<{
    type: string;
    health: number;
    maxHealth: number;
  }>;

  // Started
  startedAt: Date;
  location: string;
}

/**
 * Legendary hunt initiation
 */
export interface InitiateLegendaryHuntRequest {
  legendaryId: string;
  location: string;
}

export interface InitiateLegendaryHuntResponse {
  success: boolean;
  session?: LegendaryHuntSession;
  message?: string;
  error?: string;
}

/**
 * Legendary hunt attack
 */
export interface LegendaryHuntAttackRequest {
  sessionId: string;
  action: 'attack' | 'special' | 'defend' | 'item' | 'flee';
  targetId?: string;               // For targeting minions
  itemId?: string;                 // If using item
  specialAbilityId?: string;       // If using special ability
}

export interface LegendaryHuntAttackResponse {
  success: boolean;
  session?: LegendaryHuntSession;
  turnResult: {
    playerAction: string;
    playerDamage: number;
    legendaryAction: string;
    legendaryDamage: number;
    minionActions?: string[];
    statusEffects?: string[];
    phaseChange?: number;
    defeated?: boolean;
    playerDefeated?: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Legendary hunt completion
 */
export interface LegendaryHuntCompleteResponse {
  success: boolean;
  defeated: boolean;
  rewards?: {
    gold: number;
    experience: number;
    items: LegendaryDrop[];
    title?: string;
    achievement?: string;
    permanentBonus?: StatBonus;
  };
  stats: {
    turnsSurvived: number;
    damageDone: number;
    timeElapsed: number;
  };
  newspaperHeadline?: string;
  message: string;
}

/**
 * Get legendary animals list
 */
export interface GetLegendaryAnimalsRequest {
  category?: LegendaryCategory;
  tier?: LegendaryTier;
  location?: string;
  discoveryStatus?: DiscoveryStatus;
}

export interface GetLegendaryAnimalsResponse {
  success: boolean;
  legendaries: Array<{
    legendary: LegendaryAnimal;
    record?: LegendaryHuntRecord;
    available: boolean;            // Can hunt now (meets requirements)
    canSpawn: boolean;             // Spawn conditions met
  }>;
}

/**
 * Discover clue
 */
export interface DiscoverClueRequest {
  legendaryId: string;
  location: string;
}

export interface DiscoverClueResponse {
  success: boolean;
  clue?: {
    type: string;
    description: string;
    legendary: string;
    progress: number;              // % toward discovery
  };
  discovered?: boolean;            // Just discovered the legendary
  message: string;
}

/**
 * Hear rumor from NPC
 */
export interface HearRumorRequest {
  npcId: string;
  legendaryId?: string;            // Optional - random if not provided
}

export interface HearRumorResponse {
  success: boolean;
  rumor?: {
    npcName: string;
    legendary: string;
    rumorText: string;
    hintsProvided: string[];
  };
  message: string;
}

/**
 * Legendary hunt leaderboard entry
 */
export interface LegendaryHuntLeaderboard {
  legendaryId: string;
  legendaryName: string;
  entries: Array<{
    rank: number;
    characterId: string;
    characterName: string;
    defeatedCount: number;
    bestTime?: number;             // Seconds
    bestDamage?: number;
    firstDefeat?: Date;
  }>;
}

/**
 * Trophy display for player home/profile
 */
export interface LegendaryTrophy {
  legendaryId: string;
  legendaryName: string;
  legendaryTitle: string;
  defeatedAt: Date;
  defeatedCount: number;
  displayText: string;
  rarity: LegendaryTier;
}

/**
 * Constants
 */
export const LEGENDARY_SPAWN_CHECK_INTERVAL = 3600; // Check every hour
export const LEGENDARY_GLOBAL_COOLDOWN = 24;        // 24 hours between spawns

/**
 * Helper type guards
 */
export function isLegendaryPredator(category: LegendaryCategory): boolean {
  return category === LegendaryCategory.PREDATOR;
}

export function isLegendaryPrey(category: LegendaryCategory): boolean {
  return category === LegendaryCategory.PREY;
}

export function requiresSpecialConditions(legendary: LegendaryAnimal): boolean {
  return legendary.spawnConditions.length > 0 ||
         !!legendary.questRequirement ||
         !!legendary.itemRequirement;
}

export function canAttemptHunt(
  legendary: LegendaryAnimal,
  characterLevel: number,
  reputation?: { faction: string; value: number }
): boolean {
  if (characterLevel < legendary.levelRequirement) {
    return false;
  }

  if (legendary.reputationRequirement && reputation) {
    if (reputation.faction !== legendary.reputationRequirement.faction) {
      return false;
    }
    if (reputation.value < legendary.reputationRequirement.reputation) {
      return false;
    }
  }

  return true;
}
