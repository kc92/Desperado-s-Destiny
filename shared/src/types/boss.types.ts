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
  // Phase 19.5: New boss mechanic effects
  COLD_EXPOSURE = 'cold_exposure',       // Wendigo cold meter
  GOLD_CORRUPTION = 'gold_corruption',   // Conquistador curse
  GUILTY_VERDICT = 'guilty_verdict',     // Judge Bean debuff
  CONTEMPT_OF_COURT = 'contempt_of_court', // Judge Bean debuff
  MARKED = 'marked',                     // Tombstone Specter spirit targeting
  // Phase 19.5: Ghost Town mini-boss effects
  OXYGEN_DEPLETION = 'oxygen_depletion', // Mine Foreman - bad air
  POKER_ROUND_ACTIVE = 'poker_round_active', // Wild Bill - poker phase
  GUILT_VISION_ACTIVE = 'guilt_vision_active', // The Avenger - guilt check
  ALTAR_TRIGGER = 'altar_trigger',       // Undead Priest - altar activation
  DEAD_MANS_HAND_DEBUFF = 'dead_mans_hand_debuff', // Wild Bill choice consequence
  TOUCHED_BY_GOLD = 'touched_by_gold',   // Deadwood choice consequence
  COWARDS_MARK = 'cowards_mark',         // Walk away consequence
  CONSUMED_BY_RAGE = 'consumed_by_rage', // Wrath's Hollow choice consequence
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
  TRANSFORMATION = 'transformation', // Phase 19.5: Spirit form changes
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
 * Status effect definition (stored on player state)
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
 * Applied status effect result (for combat round logging)
 */
export interface AppliedStatusEffect {
  targetId: string;              // Which player received the effect
  effect: StatusEffect;          // The effect type
  applied: boolean;              // Whether it was successfully applied
  message: string;               // Descriptive message
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
  narrative?: string;            // Phase 19.5: Descriptive text for ability
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

  // Dialogue choices (for interactive phases like Judge Bean's trial)
  dialogueChoices?: DialogueChoice[];

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
    // Stackable effects (e.g., Wendigo cold meter)
    statusEffect?: string;       // Status effect ID to apply
    stackable?: boolean;         // Can stack multiple times
    maxStacks?: number;          // Maximum stack count
    scaling?: string;            // Scale power by this variable (e.g., 'cold_exposure_stacks')
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
 * Dialogue choice for boss phase interactions (e.g., Judge Bean's trial)
 */
export interface DialogueChoice {
  id: string;
  text: string;
  skillCheck?: {
    skill: string;
    difficulty: number;
  };
  successEffect?: {
    bossHpReduction?: number;      // % HP reduction
    playerBuff?: string;           // Buff ID to apply
    narrative?: string;            // Success text
  };
  failureEffect?: {
    playerDebuff?: string;         // Debuff ID to apply
    bossHeal?: number;             // % HP heal
    narrative?: string;            // Failure text
  };
  effect?: {
    skipToPhase?: number;          // Skip to a specific phase
    endDialogue?: boolean;         // End dialogue sequence
  };
}

/**
 * Pre-combat challenge (e.g., Billy's quick-draw)
 */
export interface PreCombatChallenge {
  type: 'quick_draw' | 'dialogue' | 'puzzle' | 'skill_check';
  name: string;
  description: string;
  timeLimit?: number;              // Seconds for reaction challenges
  skillCheck?: {
    skill: string;
    difficulty: number;
  };
  successEffect: {
    bossHpPenalty?: number;        // % HP boss starts with
    playerBonus?: string;          // Buff applied to player
    narrative: string;
  };
  failureEffect: {
    playerHpPenalty?: number;      // % HP player loses
    bossBonus?: string;            // Buff applied to boss
    narrative: string;
  };
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
  preCombatChallenge?: PreCombatChallenge;  // Quick-draw, dialogue, etc.

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
    effectsApplied: AppliedStatusEffect[];
    narrative?: string;                    // Descriptive text for the ability
    telegraphMessage?: string;             // Warning before major attacks
    minionsSpawned?: Array<{               // For SUMMON abilities
      id: string;
      name: string;
      health: number;
      damage: number;
    }>;
    minionAttacks?: Array<{                // Minion attack results
      minionId: string;
      minionName: string;
      targetId: string;
      damage: number;
    }>;
  }>;

  // Round results
  bossHealthAfter: number;
  playerHealthsAfter: Map<string, number>;
  phaseChange?: number;
  minionsSpawned?: number;                 // Legacy count field
  environmentalEvents?: string[];
  narrativeText?: string;
  statusEffectDamage?: Record<string, number>;  // DOT damage per player
  expiredEffects?: Record<string, string[]>;    // Effects that expired this turn
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

// =============================================================================
// PHASE 19.5: GHOST TOWN MINI-BOSS COMBAT STATE EXTENSIONS
// =============================================================================

/**
 * Extended combat state for Mine Foreman Ghost (Fading Breath mechanic)
 */
export interface MineforemanCombatState {
  oxygenLevel: number;           // 0-100%
  handSizeModifier: number;      // Current hand size reduction (-1 at 70%, -2 at 50%)
  suffocatingDamageActive: boolean;
  airPocketsFound: number;
}

/**
 * Extended combat state for Wild Bill's Echo (Eternal Game mechanic)
 */
export interface WildBillCombatState {
  pokerRoundCounter: number;     // Counts rounds since last poker
  isPokerRound: boolean;         // Currently in poker phase
  pokerWins: number;
  pokerLosses: number;
  lastPokerResult?: 'player_win_1' | 'player_win_2' | 'tie' | 'bill_win_1' | 'bill_win_2';
  deadMansHandTriggered: boolean;
  nextHandForced?: 'high_card';  // If player lost badly
}

/**
 * Extended combat state for The Avenger (Guilt Mirror mechanic)
 */
export interface AvengerCombatState {
  guiltScore: number;            // 0-100
  guiltTier: 'innocent' | 'questionable' | 'guilty' | 'damned';
  powerModifier: number;         // 0.7, 1.0, 1.3, or 1.5 based on guilt
  visionCounter: number;         // Counts rounds since last vision
  visionsCompleted: number;
  peacefulResolutionPossible: boolean;
  heartsMultiplierActive: boolean;
}

/**
 * Altar state for Undead Priest combat
 */
export interface AltarState {
  id: 'spades' | 'hearts' | 'clubs' | 'diamonds';
  name: string;
  purified: boolean;
  timesTriggered: number;
}

/**
 * Extended combat state for Undead Priest (Corrupted Sacraments mechanic)
 */
export interface UndeadPriestCombatState {
  altars: AltarState[];
  purifiedCount: number;
  trueFormWeakened: boolean;   // True if all 4 purified
  lastDominantSuit?: 'spades' | 'hearts' | 'clubs' | 'diamonds';
  monochromeHandBonus: boolean;  // True if last hand was all black/red
}

/**
 * Union type for all ghost town mini-boss combat states
 */
export type GhostTownMiniBossCombatState =
  | { bossType: 'mine_foreman'; state: MineforemanCombatState }
  | { bossType: 'wild_bill'; state: WildBillCombatState }
  | { bossType: 'avenger'; state: AvengerCombatState }
  | { bossType: 'undead_priest'; state: UndeadPriestCombatState };

// =============================================================================
// LEGENDARY BOUNTY BOSS COMBAT STATES (Phase 19.5)
// =============================================================================

/**
 * Bluff claim for Jesse James mechanic
 */
export interface BluffClaim {
  round: number;
  claimedAttack: 'physical' | 'special' | 'ultimate';
  actualAttack: 'physical' | 'special' | 'ultimate';
  isBluff: boolean;
  playerResponse?: 'call' | 'fold';
  resolved: boolean;
}

/**
 * Extended combat state for Jesse James (Deception Duel mechanic)
 */
export interface JesseJamesCombatState {
  bluffRoundCounter: number;      // Counts rounds since last bluff
  isBluffRound: boolean;          // Currently in bluff phase
  currentBluff?: BluffClaim;      // Active bluff if any
  bluffsCorrectlyCalled: number;
  bluffsIncorrectlyCalled: number;
  folds: number;
  jesseVulnerable: boolean;       // True after correct call (+50% damage)
  playerVulnerable: boolean;      // True after incorrect call (+30% damage taken)
  surrendered: boolean;           // True if Royal Flush triggered
}

/**
 * Poker pot result for Doc Holliday mechanic
 */
export interface PokerPotResult {
  round: number;
  playerHand: HandRank;
  docHand: HandRank;
  winner: 'player' | 'doc' | 'tie';
  margin: number;                 // How many ranks difference
  effect: string;                 // Description of the effect applied
}

/**
 * Extended combat state for Doc Holliday (High Stakes Showdown mechanic)
 */
export interface DocHollidayCombatState {
  pokerRoundCounter: number;      // Counts rounds since last poker
  isPokerRound: boolean;          // Currently in poker phase
  pokerResults: PokerPotResult[];
  playerDamageBonus: number;      // Current bonus from poker wins
  docDamageBonus: number;         // Current Doc bonus from poker wins
  handCapped: boolean;            // True if player capped at Three of a Kind
  capRoundsRemaining: number;
  deadMansHandTriggered: boolean;
  fourAcesTriggered: boolean;     // Peaceful resolution offered
  royalFlushTriggered: boolean;   // Instant victory
}

/**
 * Spirit trail for Ghost Rider mechanic
 */
export interface SpiritTrail {
  suits: ('spades' | 'hearts' | 'clubs' | 'diamonds')[];
  round: number;
}

/**
 * Extended combat state for Ghost Rider (Spirit Chase mechanic)
 */
export interface GhostRiderCombatState {
  currentRealm: 'physical' | 'spirit';
  realmShiftCounter: number;      // Counts rounds until next shift
  currentTrail?: SpiritTrail;     // Current spirit trail to match
  trailMatchResults: {
    round: number;
    matched: number;              // 0-3 suits matched
    damageDealt: boolean;
    vengeanceTriggered: boolean;  // True if 0-1 match
    escapedRound: boolean;        // True if 0 match
  }[];
  suitsInLastHand: Record<string, number>; // Count of each suit
  flushBonus: boolean;            // True if last hand was flush
  straightBonus: boolean;         // True if last hand was straight
  escapeBlocked: boolean;         // True if straight prevents escape
}

/**
 * Prestige wave definition
 */
export interface PrestigeWave {
  waveNumber: number;
  waveType: string;
  enemiesTotal: number;
  enemiesDefeated: number;
  isBossWave: boolean;
  completed: boolean;
}

/**
 * Extended combat state for Prestige quests (Wave System)
 */
export interface PrestigeCombatState {
  questType: 'the_law' | 'the_legend';
  currentWave: number;
  waves: PrestigeWave[];
  totalEnemiesDefeated: number;
  allyCount: number;
  allyIds: string[];
  allyHealth: Record<string, number>;
  bossDefeated: boolean;
}

/**
 * Union type for all legendary bounty combat states
 */
export type LegendaryBountyCombatState =
  | { bossType: 'jesse_james'; state: JesseJamesCombatState }
  | { bossType: 'doc_holliday'; state: DocHollidayCombatState }
  | { bossType: 'ghost_rider'; state: GhostRiderCombatState };

/**
 * Alternative action types for legendary bounty bosses
 */
export type LegendaryBountyAlternativeAction =
  | { type: 'call_bluff'; bossId: 'boss_jesse_james' }
  | { type: 'fold_bluff'; bossId: 'boss_jesse_james' }
  | { type: 'poker_showdown'; bossId: 'boss_doc_holliday' }
  | { type: 'track_spirit'; bossId: 'boss_ghost_rider' };

/**
 * Initialize combat state for a legendary bounty boss
 */
export function initializeLegendaryBountyCombatState(bossId: string): LegendaryBountyCombatState | null {
  switch (bossId) {
    case 'boss_jesse_james':
      return {
        bossType: 'jesse_james',
        state: {
          bluffRoundCounter: 0,
          isBluffRound: false,
          bluffsCorrectlyCalled: 0,
          bluffsIncorrectlyCalled: 0,
          folds: 0,
          jesseVulnerable: false,
          playerVulnerable: false,
          surrendered: false,
        },
      };
    case 'boss_doc_holliday':
      return {
        bossType: 'doc_holliday',
        state: {
          pokerRoundCounter: 0,
          isPokerRound: false,
          pokerResults: [],
          playerDamageBonus: 0,
          docDamageBonus: 0,
          handCapped: false,
          capRoundsRemaining: 0,
          deadMansHandTriggered: false,
          fourAcesTriggered: false,
          royalFlushTriggered: false,
        },
      };
    case 'boss_ghost_rider':
      return {
        bossType: 'ghost_rider',
        state: {
          currentRealm: 'physical',
          realmShiftCounter: 0,
          trailMatchResults: [],
          suitsInLastHand: {},
          flushBonus: false,
          straightBonus: false,
          escapeBlocked: false,
        },
      };
    default:
      return null;
  }
}

/**
 * Alternative action types for ghost town bosses
 */
export type GhostTownAlternativeAction =
  | { type: 'find_air_pocket'; bossId: 'boss_mine_foreman_ghost' }
  | { type: 'target_altar'; bossId: 'boss_undead_priest'; altar: 'spades' | 'hearts' | 'clubs' | 'diamonds' }
  | { type: 'poker_play'; bossId: 'boss_wild_bill_echo' };

/**
 * Initialize combat state for a ghost town mini-boss
 */
export function initializeGhostTownCombatState(bossId: string, playerGuiltScore?: number): GhostTownMiniBossCombatState | null {
  switch (bossId) {
    case 'boss_mine_foreman_ghost':
      return {
        bossType: 'mine_foreman',
        state: {
          oxygenLevel: 100,
          handSizeModifier: 0,
          suffocatingDamageActive: false,
          airPocketsFound: 0,
        },
      };
    case 'boss_wild_bill_echo':
      return {
        bossType: 'wild_bill',
        state: {
          pokerRoundCounter: 0,
          isPokerRound: false,
          pokerWins: 0,
          pokerLosses: 0,
          deadMansHandTriggered: false,
        },
      };
    case 'boss_the_avenger':
      const guiltScore = playerGuiltScore ?? 50;
      return {
        bossType: 'avenger',
        state: {
          guiltScore,
          guiltTier: guiltScore <= 20 ? 'innocent' : guiltScore <= 50 ? 'questionable' : guiltScore <= 80 ? 'guilty' : 'damned',
          powerModifier: guiltScore <= 20 ? 0.7 : guiltScore <= 50 ? 1.0 : guiltScore <= 80 ? 1.3 : 1.5,
          visionCounter: 0,
          visionsCompleted: 0,
          peacefulResolutionPossible: guiltScore <= 20,
          heartsMultiplierActive: false,
        },
      };
    case 'boss_undead_priest':
      return {
        bossType: 'undead_priest',
        state: {
          altars: [
            { id: 'spades', name: 'Altar of Confession', purified: false, timesTriggered: 0 },
            { id: 'hearts', name: 'Altar of Communion', purified: false, timesTriggered: 0 },
            { id: 'clubs', name: 'Altar of Unction', purified: false, timesTriggered: 0 },
            { id: 'diamonds', name: 'Altar of Baptism', purified: false, timesTriggered: 0 },
          ],
          purifiedCount: 0,
          trueFormWeakened: false,
          monochromeHandBonus: false,
        },
      };
    default:
      return null;
  }
}
