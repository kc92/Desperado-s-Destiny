/**
 * Contract Types
 *
 * Phase 3: Contract Expansion - Centralized type definitions
 * Supports combat integration, gang contracts, urgent/chain contracts
 */

/**
 * Contract types - expanded from original 6 to 12 categories
 * Using string literal union for backwards compatibility with existing templates
 */
export type ContractType =
  // Original types
  | 'combat'
  | 'crime'
  | 'social'
  | 'delivery'
  | 'investigation'
  | 'crafting'
  // NEW Types (Phase 3)
  | 'gang'           // Gang-member-only contracts
  | 'boss'           // Boss hunting (Level 25+)
  | 'urgent'         // Time-limited (1-2 hours)
  | 'chain'          // Multi-step sequential
  | 'bounty'         // Bounty hunting integration
  | 'territory';     // Territory control objectives

/** Array of all contract types for validation */
export const CONTRACT_TYPES: ContractType[] = [
  'combat', 'crime', 'social', 'delivery', 'investigation', 'crafting',
  'gang', 'boss', 'urgent', 'chain', 'bounty', 'territory'
];

/**
 * Contract difficulty levels
 */
export type ContractDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Contract status lifecycle
 */
export type ContractStatus = 'available' | 'in_progress' | 'completed' | 'expired';

/**
 * Contract urgency levels - affects duration and rewards
 */
export type ContractUrgency = 'standard' | 'urgent' | 'critical';

/**
 * Character tier for reward scaling
 */
export type CharacterTier = 'NOVICE' | 'JOURNEYMAN' | 'VETERAN' | 'EXPERT' | 'MASTER';

/**
 * Gang rank requirement for gang contracts
 */
export type GangRankRequirement = 'member' | 'officer' | 'leader';

/**
 * Combat target types for combat contracts
 */
export type CombatTargetType = 'any' | 'outlaw' | 'wildlife' | 'lawman' | 'boss';

/**
 * Chain contract step definition
 */
export interface IChainStep {
  stepNumber: number;
  title: string;
  description: string;
  targetType: string;
  progressRequired: number;
  rewardMultiplier: number;  // e.g., 0.2 for step 1, 0.3 for step 2, 0.5 for final
}

/**
 * Chain contract data (embedded in contract)
 */
export interface IChainData {
  chainId: string;              // Chain template ID
  currentStep: number;          // Current step (1-indexed)
  totalSteps: number;           // Total steps in chain
  stepProgress: number;         // Progress on current step
  stepProgressMax: number;      // Required for current step
  stepsCompleted: string[];     // Completed step IDs
  startedAt: Date;
  stepRewardsCollected: number; // Gold collected so far
}

/**
 * Contract target information
 */
export interface IContractTarget {
  type: string;       // 'npc', 'location', 'item', 'faction', 'enemy', 'skill'
  id?: string;        // Specific ID if applicable
  name: string;       // Display name
  location?: string;  // Location where target can be found
}

/**
 * Skill requirement for contracts
 */
export interface ISkillRequirement {
  skillId: string;    // Skill ID (e.g., 'lockpicking', 'firearms')
  minLevel: number;   // Minimum level required
}

/**
 * Contract requirements - extended for combat integration
 */
export interface IContractRequirements {
  amount?: number;              // Quantity needed
  item?: string;                // Item ID if applicable
  npc?: string;                 // NPC ID if applicable
  skillLevel?: number;          // Minimum skill level required (deprecated, use skills)
  location?: string;            // Location to visit
  skills?: ISkillRequirement[]; // Skills required to attempt contract

  // Combat-specific requirements (Phase 3)
  combatTargetType?: CombatTargetType;  // Type of enemy to defeat
  combatKillCount?: number;             // Number of kills required
  damageThreshold?: number;             // Minimum damage in one fight
  flawlessVictory?: boolean;            // Win without taking damage
  handRank?: string;                    // Required poker hand (e.g., 'royal_flush')
  bossId?: string;                      // Specific boss target

  // Gang-specific requirements
  gangRequired?: boolean;
  gangRankRequired?: GangRankRequirement;
  territoryZoneId?: string;             // Territory-specific
}

/**
 * Skill XP reward
 */
export interface ISkillXpReward {
  skillId: string;    // Skill to grant XP to
  amount: number;     // Amount of skill XP to grant
}

/**
 * Contract rewards
 */
export interface IContractRewards {
  gold: number;
  xp: number;
  items?: string[];   // Item IDs
  reputation?: Record<string, number>; // Faction reputation changes
  skillXp?: ISkillXpReward[];  // Skill XP rewards
}

/**
 * Contract template for generation
 */
export interface IContractTemplate {
  id: string;
  type: ContractType;
  title: string;
  description: string;
  target: IContractTarget;
  requirements: IContractRequirements;
  baseRewards: IContractRewards;
  difficulty: ContractDifficulty;
  progressMax: number;
  weight?: number;                      // Selection weight (default 1)
  levelRequirement?: number;            // Minimum character level
  maxLevel?: number;                    // Maximum character level (for scaling)

  // Urgency (Phase 3)
  urgency?: ContractUrgency;

  // Chain contract (Phase 3)
  chainSteps?: IChainStep[];

  // Reward modifier (Phase 3)
  rewardMultiplier?: number;            // Template-specific multiplier
}

/**
 * Individual contract instance
 */
export interface IContract {
  id: string;                   // Unique contract instance ID
  templateId: string;           // Reference to template used
  type: ContractType;
  title: string;
  description: string;
  target: IContractTarget;
  requirements: IContractRequirements;
  rewards: IContractRewards;
  difficulty: ContractDifficulty;
  status: ContractStatus;
  progress: number;             // Current progress
  progressMax: number;          // Target progress
  acceptedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;

  // Urgency (Phase 3)
  urgency?: ContractUrgency;

  // Chain data (Phase 3)
  chainData?: IChainData;

  // Premium contract fields (Sprint 7)
  isPremium?: boolean;
  premiumTemplateId?: string;
  energyCost?: number;
  phaseProgress?: number;
  factionImpact?: Record<string, number>;
  factionImpactApplied?: boolean;
  cooldownExpiresAt?: Date;
}

/**
 * Streak bonus tier configuration
 */
export interface IStreakBonus {
  day: number;
  gold: number;
  xp: number;
  item?: string;
  premiumCurrency?: number;
  description: string;
}

/**
 * Daily contract summary for a character
 */
export interface IDailyContractSummary {
  characterId: string;
  date: Date;
  contracts: IContract[];
  completedCount: number;
  streak: number;
  lastCompletedDate: Date | null;
  streakBonusClaimed: boolean;
  timeUntilReset: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

/**
 * Contract completion result
 */
export interface IContractCompletionResult {
  success: boolean;
  contract?: IContract;
  rewards?: {
    gold: number;
    xp: number;
    items?: Array<{ itemId: string; quantity: number }>;
    skillXp?: ISkillXpReward[];
  };
  streakBonus?: IStreakBonus;
  newStreak?: number;
  error?: string;
}

/**
 * Combat contract progress event
 */
export interface ICombatContractProgress {
  characterId: string;
  contractId: string;
  progressAdded: number;
  newProgress: number;
  progressMax: number;
  completed: boolean;
}

// ============================================
// Phase 19.3: Faction Warfare Contract Types
// ============================================

/**
 * PvE contract subtypes for the Frontier Justice system
 */
export type PvEContractType = 'bounty' | 'escort' | 'delivery' | 'sabotage' | 'intel';

/**
 * PvP contract subtypes for faction warfare
 */
export type PvPContractType = 'territory_raid' | 'supply_interdiction' | 'defend_outpost' | 'assassination';

/**
 * Faction warfare contract (extends base contract)
 */
export interface IFactionWarfareContract extends IContract {
  // Faction warfare specific fields
  factionWarfareType: PvEContractType | PvPContractType;
  isPvP: boolean;
  targetFaction?: string;           // Which faction is being targeted
  sourceFaction: string;            // Issuing faction
  moralReputationReward?: number;   // Change to moral reputation on completion
  factionRepReward?: number;        // Faction reputation reward

  // PvP specific
  pvpTargetPlayerId?: string;       // For assassination contracts
  territoryZoneId?: string;         // For territory raids/defense
  defenseKills?: number;            // Kills during defense session

  // Cooldown tracking
  lastAttemptedAt?: Date;
  cooldownExpiresAt?: Date;
}

/**
 * Faction warfare contract template
 */
export interface IFactionWarfareContractTemplate {
  id: string;
  type: PvEContractType | PvPContractType;
  name: string;
  description: string;
  isPvP: boolean;
  baseRewards: {
    gold: number;
    xp: number;
    factionRep: number;
    moralRep?: number;
  };
  requirements: {
    minLevel: number;
    minMoralReputation?: number;
    maxMoralReputation?: number;
    minFactionReputation?: number;
    requiredSkills?: { skillId: string; minLevel: number }[];
  };
  cooldownHours?: number;
  durationMinutes?: number;
  targetTypes?: string[];           // For bounty tiers or sabotage targets
}

/**
 * Active defense session for outpost defense contracts
 */
export interface IDefenseSession {
  sessionId: string;
  characterId: string;
  contractId: string;
  territoryZoneId: string;
  faction: string;
  startedAt: Date;
  endsAt: Date;
  kills: number;
  goldEarned: number;
  isActive: boolean;
}

/**
 * Supply run that can be intercepted
 */
export interface ISupplyRun {
  runId: string;
  carrierId: string;               // Character ID carrying goods
  carrierName: string;
  faction: string;
  origin: string;
  destination: string;
  cargoValue: number;
  startedAt: Date;
  estimatedArrival: Date;
  isIntercepted: boolean;
  interceptorId?: string;
}

/**
 * Assassination target information
 */
export interface IAssassinationTarget {
  targetId: string;
  targetName: string;
  targetFaction: string;
  targetLevel: number;
  bountyValue: number;
  lastKnownLocation?: string;
  reason: string;                   // Why they're targeted
  expiresAt: Date;
}

/**
 * Result of completing a faction warfare contract
 */
export interface IFactionWarfareCompletionResult {
  success: boolean;
  contract: IFactionWarfareContract;
  rewards: {
    gold: number;
    xp: number;
    factionRep: number;
    moralRep: number;
    items?: { itemId: string; quantity: number }[];
    territoryControl?: { zoneId: string; controlChange: number };
    stolenGoods?: { itemId: string; quantity: number; value: number }[];
  };
  consequences?: {
    reputationLoss?: number;        // If caught/failed
    bountyIncrease?: number;        // For outlaw actions
    factionStandingChange?: Record<string, number>;
  };
  message: string;
  unlockedContent?: string[];       // Intel contracts can unlock storylines
}

/**
 * Player's faction warfare statistics
 */
export interface IFactionWarfareStats {
  characterId: string;
  faction: string;

  // PvE stats
  bountiesCompleted: number;
  escortsCompleted: number;
  deliveriesCompleted: number;
  sabotagesCompleted: number;
  intelGathered: number;

  // PvP stats
  territoriesRaided: number;
  suppliesIntercepted: number;
  defenseSessions: number;
  defenseKills: number;
  assassinationsCompleted: number;

  // Totals
  totalPvEContracts: number;
  totalPvPContracts: number;
  totalGoldEarned: number;
  totalFactionRepEarned: number;

  // Rankings
  pvpKills: number;
  pvpDeaths: number;
  pvpKDRatio: number;
}

/**
 * Available contracts for a character (filtered by level, reputation, etc.)
 */
export interface IAvailableFactionWarfareContracts {
  characterId: string;
  pveContracts: IFactionWarfareContract[];
  pvpContracts: IFactionWarfareContract[];
  lockedContracts: {
    contract: IFactionWarfareContract;
    reason: string;
    requirementsMet: {
      level: boolean;
      moralRep: boolean;
      factionRep: boolean;
      cooldown: boolean;
    };
  }[];
}
