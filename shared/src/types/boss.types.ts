/**
 * Boss Encounter System Types - Phase 14, Wave 14.2
 *
 * Type definitions for epic boss battles across Desperados Destiny
 * Includes legendary animals, faction leaders, outlaws, and cosmic horrors
 */

import { Card, HandRank } from './destinyDeck.types';

/**
 * Boss categories
 */
export enum BossCategory {
  LEGENDARY_ANIMAL = 'legendary_animal',
  FACTION_LEADER = 'faction_leader',
  OUTLAW_LEGEND = 'outlaw_legend',
  COSMIC_HORROR = 'cosmic_horror',
  ULTIMATE = 'ultimate',
}

/**
 * Boss difficulty tiers
 */
export enum BossTier {
  RARE = 'rare',             // L15-20
  EPIC = 'epic',             // L20-28
  LEGENDARY = 'legendary',   // L28-35
  MYTHIC = 'mythic',         // L35-40
  ULTIMATE = 'ultimate',     // L40
}

/**
 * Damage types for boss mechanics
 */
export enum BossDamageType {
  PHYSICAL = 'physical',
  FIRE = 'fire',
  FROST = 'frost',
  POISON = 'poison',
  PSYCHIC = 'psychic',
  VOID = 'void',
  CORRUPTION = 'corruption',
  REALITY = 'reality',
  DIVINE = 'divine',
}

/**
 * Status effects that can be applied
 */
export enum StatusEffect {
  BLEED = 'bleed',
  BURN = 'burn',
  POISON = 'poison',
  STUN = 'stun',
  FEAR = 'fear',
  CONFUSION = 'confusion',
  WEAKNESS = 'weakness',
  ARMOR_BREAK = 'armor_break',
  SLOW = 'slow',
  ROOT = 'root',
  CORRUPTION = 'corruption',
  MADNESS = 'madness',
  BLIND = 'blind',
  SILENCE = 'silence',
}

/**
 * Ability types for boss abilities
 */
export enum BossAbilityType {
  DAMAGE = 'damage',
  AOE = 'aoe',
  DOT = 'dot',
  DEBUFF = 'debuff',
  BUFF = 'buff',
  SUMMON = 'summon',
  HEAL = 'heal',
  PHASE_CHANGE = 'phase_change',
  ENVIRONMENTAL = 'environmental',
  ULTIMATE = 'ultimate',
}

/**
 * Spawn condition types for bosses
 */
export enum BossSpawnConditionType {
  LEVEL = 'level',
  QUEST = 'quest',
  ITEM = 'item',
  TIME_OF_DAY = 'time_of_day',
  WEATHER = 'weather',
  MOON_PHASE = 'moon_phase',
  REPUTATION = 'reputation',
  FACTION = 'faction',
  LOCATION = 'location',
  COOLDOWN = 'cooldown',
  FIRST_KILL = 'first_kill',
}

/**
 * Status effect definition
 */
export interface StatusEffectInstance {
  type: StatusEffect;
  duration: number;              // Turns/rounds
  power: number;                 // Damage per turn or intensity
  stackable: boolean;
  maxStacks?: number;
  appliedAt: Date;
}

/**
 * Boss weakness definition
 */
export interface BossWeakness {
  damageType: BossDamageType;
  multiplier: number;            // 1.5 = 50% more damage
  description: string;
}

/**
 * Boss ability definition
 */
export interface BossAbility {
  id: string;
  name: string;
  description: string;
  type: BossAbilityType;
  cooldown: number;              // Turns before can use again
  damage?: number;
  damageType?: BossDamageType;
  effect?: StatusEffectInstance;
  avoidable: boolean;
  avoidMechanic?: string;        // How to avoid (dodge, interrupt, etc.)
  telegraphMessage?: string;     // Warning message before use
  priority: number;              // Higher = more likely to use
  requiresPhase?: number;        // Only available in certain phases
  targetType: 'single' | 'all' | 'random';
}

/**
 * Phase modifier for boss behavior changes
 */
export interface PhaseModifier {
  type: 'damage' | 'defense' | 'speed' | 'healing' | 'aggression' | 'evasion';
  multiplier: number;
  description: string;
}

/**
 * Boss phase definition
 */
export interface BossPhase {
  phaseNumber: number;
  healthThreshold: number;       // % health when phase triggers (100, 66, 33)
  name: string;
  description: string;
  dialogue?: string;             // Boss dialogue when entering phase

  // Combat changes
  abilities: string[];           // Ability IDs unlocked in this phase
  modifiers: PhaseModifier[];

  // Special mechanics
  environmentalHazard?: {
    name: string;
    description: string;
    damagePerTurn: number;
    avoidable: boolean;
  };
  summonMinions?: {
    type: string;
    count: number;
    spawnMessage: string;
  };

  // Visual/narrative
  visualChange?: string;
  transitionNarrative?: string;
}

/**
 * Boss spawn condition
 */
export interface BossSpawnCondition {
  type: BossSpawnConditionType;
  value: any;
  description: string;
  operator?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * Environmental effect during boss fight
 */
export interface EnvironmentEffect {
  id: string;
  name: string;
  description: string;
  triggersAt: 'start' | 'phase_change' | 'periodic' | 'health_threshold';
  threshold?: number;            // For health_threshold triggers
  interval?: number;             // For periodic triggers (turns)
  effect: {
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'hazard';
    target: 'player' | 'boss' | 'both';
    power: number;
  };
  duration?: number;             // Turns, undefined = permanent
  counterplay?: string;          // How to mitigate
}

/**
 * Special mechanic for boss encounters
 */
export interface SpecialMechanic {
  id: string;
  name: string;
  description: string;
  type: 'cover' | 'interrupt' | 'coordination' | 'puzzle' | 'unique';
  instructions: string;
  failureConsequence?: string;
  successReward?: string;
}

/**
 * Item drop definition
 */
export interface ItemDrop {
  itemId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  quantity: number;
  guaranteedFirstKill?: boolean;
}

/**
 * Loot table entry with drop chance
 */
export interface LootTableEntry {
  itemId: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  dropChance: number;            // 0-1 (0.15 = 15%)
  minQuantity: number;
  maxQuantity: number;
  requiresFirstKill?: boolean;   // Only drops on first kill
}

/**
 * Player limit for boss encounters
 */
export interface PlayerLimit {
  min: number;
  max: number;
  recommended: number;
}

/**
 * Boss scaling for group content
 */
export interface BossScaling {
  healthPerPlayer: number;       // % increase per additional player
  damagePerPlayer: number;       // % increase per additional player
  unlockMechanics?: {
    playerCount: number;
    mechanics: string[];         // Mechanic IDs that unlock
  }[];
}

/**
 * Main boss encounter definition
 */
export interface BossEncounter {
  id: string;
  name: string;
  title: string;
  category: BossCategory;
  tier: BossTier;
  level: number;

  // Lore
  description: string;
  backstory: string;
  defeatDialogue: string;
  victoryNarrative: string;

  // Location & Spawning
  location: string;
  alternateLocations?: string[];
  spawnConditions: BossSpawnCondition[];
  respawnCooldown: number;       // Hours

  // Combat Stats
  health: number;
  damage: number;
  defense: number;
  criticalChance: number;
  evasion: number;

  // Combat Mechanics
  phases: BossPhase[];
  abilities: BossAbility[];
  weaknesses: BossWeakness[];
  immunities: BossDamageType[];

  // Special Systems
  specialMechanics: SpecialMechanic[];
  environmentEffects: EnvironmentEffect[];

  // Group Content
  playerLimit: PlayerLimit;
  scaling: BossScaling;

  // Rewards
  guaranteedDrops: ItemDrop[];
  lootTable: LootTableEntry[];
  goldReward: {
    min: number;
    max: number;
  };
  experienceReward: number;

  // Achievements
  achievements: string[];
  titles: string[];
  firstKillBonus?: {
    title: string;
    item?: string;
    gold?: number;
  };

  // Difficulty
  difficulty: number;            // 1-10
  enrageTimer?: number;          // Minutes until enrage
  canFlee: boolean;
  fleeConsequence?: string;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Active boss encounter session
 */
export interface BossSession {
  sessionId: string;
  bossId: string;
  characterIds: string[];        // All participants

  // Combat state
  currentPhase: number;
  bossHealth: number;
  bossMaxHealth: number;
  turnCount: number;

  // Player states
  playerStates: {
    [characterId: string]: {
      health: number;
      maxHealth: number;
      statusEffects: StatusEffectInstance[];
      damageDealt: number;
      isAlive: boolean;
    };
  };

  // Ability tracking
  abilityCooldowns: Map<string, number>;
  environmentalHazards: EnvironmentEffect[];

  // Minions (if any)
  minions?: Array<{
    id: string;
    type: string;
    health: number;
    maxHealth: number;
  }>;

  // Session info
  startedAt: Date;
  enrageAt?: Date;
  location: string;
}

/**
 * Boss combat round result
 */
export interface BossCombatRound {
  roundNumber: number;

  // Player actions
  playerActions: Array<{
    characterId: string;
    action: 'attack' | 'defend' | 'item' | 'flee';
    cards?: Card[];
    handRank?: HandRank;
    damage?: number;
    targetId?: string;
  }>;

  // Boss actions
  bossActions: Array<{
    abilityId: string;
    abilityName: string;
    targetIds: string[];
    damage: number;
    effectsApplied: StatusEffectInstance[];
  }>;

  // Round results
  bossHealthAfter: number;
  playerHealthsAfter: Map<string, number>;
  phaseChange?: number;
  minionsSpawned?: number;
  environmentalEvents?: string[];
  narrativeText?: string;
}

/**
 * Boss encounter result
 */
export interface BossEncounterResult {
  sessionId: string;
  bossId: string;
  bossName: string;
  outcome: 'victory' | 'defeat' | 'fled' | 'timeout';

  // Combat stats
  duration: number;              // Seconds
  totalRounds: number;
  totalDamageDealt: number;
  highestSingleHit: number;

  // Participants
  participants: Array<{
    characterId: string;
    characterName: string;
    damageDealt: number;
    damageTaken: number;
    survived: boolean;
  }>;

  // Rewards (if victory)
  rewards?: {
    gold: number;
    experience: number;
    items: ItemDrop[];
  };

  // Individual rewards per character
  characterRewards?: Map<string, {
    gold: number;
    experience: number;
    items: ItemDrop[];
    firstKill: boolean;
  }>;

  // Achievements
  achievementsUnlocked?: string[];
  titlesUnlocked?: string[];

  // Metadata
  completedAt: Date;
  wasFirstKill: boolean;
}

/**
 * Boss leaderboard entry
 */
export interface BossLeaderboard {
  bossId: string;
  bossName: string;

  // Categories
  fastestKill: Array<{
    rank: number;
    characterIds: string[];
    characterNames: string[];
    time: number;                // Seconds
    date: Date;
  }>;

  highestDamage: Array<{
    rank: number;
    characterId: string;
    characterName: string;
    damage: number;
    date: Date;
  }>;

  totalKills: Array<{
    rank: number;
    characterId: string;
    characterName: string;
    kills: number;
    firstKillAt?: Date;
  }>;

  // World first
  worldFirst?: {
    characterIds: string[];
    characterNames: string[];
    date: Date;
    time: number;
  };
}

/**
 * Boss availability check
 */
export interface BossAvailability {
  bossId: string;
  available: boolean;
  reason?: string;

  requirements: {
    met: boolean;
    missing?: string[];
  };

  cooldown?: {
    active: boolean;
    remainingHours: number;
    availableAt: Date;
  };

  spawnConditions?: {
    met: boolean;
    unmet?: string[];
  };
}

/**
 * Boss discovery status for player
 */
export interface BossDiscovery {
  characterId: string;
  bossId: string;

  discovered: boolean;
  discoveredAt?: Date;
  discoveryMethod?: 'rumor' | 'encounter' | 'quest' | 'exploration';

  encounterCount: number;
  victoryCount: number;
  defeatCount: number;

  bestAttempt?: {
    damageDealt: number;
    healthRemaining: number;
    duration: number;
    date: Date;
  };

  lastEncounteredAt?: Date;
  lastVictoryAt?: Date;

  firstKillRewardClaimed: boolean;
}

/**
 * API Request/Response types
 */

export interface InitiateBossEncounterRequest {
  bossId: string;
  location: string;
  partyMemberIds?: string[];     // Optional for group content
}

export interface InitiateBossEncounterResponse {
  success: boolean;
  session?: BossSession;
  boss?: BossEncounter;
  message?: string;
  error?: string;
}

export interface BossAttackRequest {
  sessionId: string;
  action: 'attack' | 'defend' | 'item' | 'flee';
  itemId?: string;
  targetId?: string;             // For targeting minions
}

export interface BossAttackResponse {
  success: boolean;
  session?: BossSession;
  round?: BossCombatRound;
  combatEnded?: boolean;
  result?: BossEncounterResult;
  message?: string;
  error?: string;
}

export interface GetAvailableBossesRequest {
  category?: BossCategory;
  tier?: BossTier;
  location?: string;
}

export interface GetAvailableBossesResponse {
  success: boolean;
  bosses: Array<{
    boss: BossEncounter;
    availability: BossAvailability;
    discovery: BossDiscovery;
  }>;
}

export interface GetBossLeaderboardRequest {
  bossId: string;
  category: 'fastest' | 'damage' | 'kills';
  limit?: number;
}

export interface GetBossLeaderboardResponse {
  success: boolean;
  leaderboard?: BossLeaderboard;
}

export interface GetBossHistoryRequest {
  characterId?: string;          // If not provided, uses auth character
  bossId?: string;               // Optional filter
}

export interface GetBossHistoryResponse {
  success: boolean;
  encounters: BossEncounterResult[];
  statistics: {
    totalAttempts: number;
    totalVictories: number;
    totalDefeats: number;
    uniqueBossesDefeated: number;
    totalDamageDealt: number;
    favoriteTarget?: string;
  };
}

export interface DiscoverBossRequest {
  bossId: string;
  method: 'rumor' | 'encounter' | 'quest' | 'exploration';
  npcId?: string;                // If discovered via rumor
}

export interface DiscoverBossResponse {
  success: boolean;
  boss?: BossEncounter;
  discovery?: BossDiscovery;
  message?: string;
}

/**
 * Constants
 */

export const BOSS_CONSTANTS = {
  // Energy costs
  BOSS_INITIATE_COST: 25,
  RAID_BOSS_INITIATE_COST: 30,

  // Cooldowns
  PERSONAL_DEFEAT_COOLDOWN: 1,   // Hours before can retry after defeat
  GLOBAL_VICTORY_COOLDOWN: 24,   // Hours before boss respawns globally

  // Scaling
  BASE_HEALTH_PER_PLAYER: 50,    // % increase per additional player
  BASE_DAMAGE_PER_PLAYER: 10,    // % increase per additional player

  // Rewards
  FIRST_KILL_GOLD_BONUS: 500,
  GROUP_GOLD_SPLIT: true,        // Split gold among participants

  // Limits
  MAX_PARTY_SIZE: 5,
  MIN_DAMAGE_FOR_LOOT: 10,       // % of boss health

  // Phases
  STANDARD_PHASE_THRESHOLDS: [100, 66, 33, 0],
  COSMIC_PHASE_THRESHOLDS: [100, 80, 60, 40, 20, 0],

  // Timeouts
  BOSS_SESSION_TIMEOUT: 60,      // Minutes
  ENRAGE_WARNING_TIME: 5,        // Minutes before enrage
};

/**
 * Helper functions
 */

export function getBossTierFromLevel(level: number): BossTier {
  if (level >= 40) return BossTier.ULTIMATE;
  if (level >= 35) return BossTier.MYTHIC;
  if (level >= 28) return BossTier.LEGENDARY;
  if (level >= 20) return BossTier.EPIC;
  return BossTier.RARE;
}

export function calculateBossHealth(baseHealth: number, playerCount: number, scaling: BossScaling): number {
  if (playerCount <= 1) return baseHealth;
  const additionalPlayers = playerCount - 1;
  const healthMultiplier = 1 + (additionalPlayers * (scaling.healthPerPlayer / 100));
  return Math.floor(baseHealth * healthMultiplier);
}

export function calculateBossDamage(baseDamage: number, playerCount: number, scaling: BossScaling): number {
  if (playerCount <= 1) return baseDamage;
  const additionalPlayers = playerCount - 1;
  const damageMultiplier = 1 + (additionalPlayers * (scaling.damagePerPlayer / 100));
  return Math.floor(baseDamage * damageMultiplier);
}

export function getCurrentPhase(health: number, maxHealth: number, phases: BossPhase[]): BossPhase {
  const healthPercent = (health / maxHealth) * 100;

  // Find the current phase based on health threshold
  for (let i = phases.length - 1; i >= 0; i--) {
    if (healthPercent <= phases[i].healthThreshold) {
      return phases[i];
    }
  }

  return phases[0]; // Default to first phase
}

export function checkSpawnConditions(
  conditions: BossSpawnCondition[],
  characterLevel: number,
  characterData: any
): { met: boolean; unmet?: string[] } {
  const unmet: string[] = [];

  for (const condition of conditions) {
    let met = false;

    switch (condition.type) {
      case BossSpawnConditionType.LEVEL:
        met = characterLevel >= (condition.value as number);
        break;
      case BossSpawnConditionType.QUEST:
        met = characterData.completedQuests?.includes(condition.value);
        break;
      case BossSpawnConditionType.REPUTATION:
        met = (characterData.reputation?.[condition.value.faction] || 0) >= condition.value.amount;
        break;
      // Add more condition checks as needed
      default:
        met = true;
    }

    if (!met) {
      unmet.push(condition.description);
    }
  }

  return {
    met: unmet.length === 0,
    unmet: unmet.length > 0 ? unmet : undefined,
  };
}

export function shouldApplyWeakness(damageType: BossDamageType, weaknesses: BossWeakness[]): number {
  const weakness = weaknesses.find(w => w.damageType === damageType);
  return weakness ? weakness.multiplier : 1.0;
}

export function isImmuneToDamage(damageType: BossDamageType, immunities: BossDamageType[]): boolean {
  return immunities.includes(damageType);
}
