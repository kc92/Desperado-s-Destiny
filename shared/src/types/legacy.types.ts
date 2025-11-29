/**
 * Legacy System Types
 * Cross-character progression and inheritance system
 */

/**
 * Legacy tier levels based on milestone achievements
 */
export enum LegacyTier {
  NONE = 'none',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  LEGENDARY = 'legendary',
}

/**
 * Types of legacy bonuses that can be applied
 */
export enum LegacyBonusType {
  XP_MULTIPLIER = 'xp_multiplier',
  GOLD_MULTIPLIER = 'gold_multiplier',
  STARTING_GOLD = 'starting_gold',
  STARTING_ITEMS = 'starting_items',
  STARTING_SKILLS = 'starting_skills',
  STARTING_REPUTATION = 'starting_reputation',
  UNLOCK_CLASS = 'unlock_class',
  UNLOCK_FEATURE = 'unlock_feature',
  COSMETIC = 'cosmetic',
  ENERGY_BONUS = 'energy_bonus',
  FAME_BONUS = 'fame_bonus',
}

/**
 * Categories of legacy milestones
 */
export enum LegacyMilestoneCategory {
  COMBAT = 'combat',
  ECONOMIC = 'economic',
  SOCIAL = 'social',
  EXPLORATION = 'exploration',
  QUEST = 'quest',
  SKILL = 'skill',
  TIME = 'time',
  SPECIAL = 'special',
}

/**
 * Individual legacy bonus definition
 */
export interface LegacyBonus {
  type: LegacyBonusType;
  value: number | string | string[];
  description: string;
  displayName: string;
  icon?: string;
}

/**
 * Legacy milestone definition
 */
export interface LegacyMilestone {
  id: string;
  name: string;
  description: string;
  category: LegacyMilestoneCategory;
  requirement: number;
  statKey: string; // Key in lifetime stats to track
  rewards: LegacyBonus[];
  icon?: string;
  hidden?: boolean; // Secret milestones
  repeatable?: boolean;
}

/**
 * Progress toward a specific milestone
 */
export interface MilestoneProgress {
  milestoneId: string;
  currentValue: number;
  requirement: number;
  completed: boolean;
  completedAt?: Date;
  timesCompleted?: number; // For repeatable milestones
}

/**
 * Lifetime statistics aggregated across all characters
 */
export interface LifetimeStats {
  // Combat
  totalEnemiesDefeated: number;
  totalBossesKilled: number;
  totalDuelsWon: number;
  totalDuelsLost: number;
  totalDamageDealt: number;
  totalDamageTaken: number;

  // Economic
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalPropertiesOwned: number;
  totalTradesCompleted: number;
  totalItemsCrafted: number;
  totalItemsBought: number;
  totalItemsSold: number;

  // Social
  highestGangRank: number;
  totalFriendsMade: number;
  totalMailSent: number;
  totalReputationEarned: number;

  // Exploration
  totalLocationsDiscovered: number;
  totalSecretsFound: number;
  totalRareEventsWitnessed: number;
  totalTerritoriesControlled: number;

  // Quests
  totalQuestsCompleted: number;
  totalLegendaryQuestsCompleted: number;
  totalStoryQuestsCompleted: number;
  totalSideQuestsCompleted: number;

  // Skills
  totalSkillsMaxed: number;
  totalSkillPointsEarned: number;
  totalProfessionsMastered: number;

  // Time
  totalDaysPlayed: number;
  totalHoursActive: number;
  totalLoginsCount: number;
  totalSeasonalEventsParticipated: number;

  // Special
  totalAchievementsUnlocked: number;
  totalCharactersCreated: number;
  totalCharactersRetired: number;
  highestLevelReached: number;
  highestFameReached: number;
}

/**
 * What a character contributed to the legacy profile
 */
export interface CharacterLegacyContribution {
  characterId: string;
  characterName: string;
  level: number;
  playedFrom: Date;
  playedUntil: Date;
  retired: boolean;
  stats: Partial<LifetimeStats>;
  notableMilestones: string[]; // Milestone IDs achieved by this character
}

/**
 * Tier requirement and reward definition
 */
export interface LegacyTierDefinition {
  tier: LegacyTier;
  milestonesRequired: number;
  bonuses: LegacyBonus[];
  displayName: string;
  description: string;
  color: string;
}

/**
 * Reward that can be claimed for new characters
 */
export interface LegacyReward {
  id: string;
  name: string;
  description: string;
  icon?: string;
  bonus: LegacyBonus;
  unlockedAt: Date;
  claimed: boolean;
  claimedBy?: string; // Character ID
  claimedAt?: Date;
  oneTimeUse: boolean;
}

/**
 * Complete legacy profile for a player (user-level, not character-level)
 */
export interface LegacyProfile {
  userId: string;
  currentTier: LegacyTier;
  lifetimeStats: LifetimeStats;
  milestoneProgress: MilestoneProgress[];
  completedMilestones: string[];
  rewards: LegacyReward[];
  characterContributions: CharacterLegacyContribution[];
  totalMilestonesCompleted: number;
  lastUpdated: Date;
  createdAt: Date;
}

/**
 * Active bonuses that apply to a character
 */
export interface ActiveLegacyBonuses {
  xpMultiplier: number;
  goldMultiplier: number;
  energyMultiplier: number;
  fameMultiplier: number;
  startingGold: number;
  startingItems: string[];
  startingSkillBonus: number;
  startingReputation: number;
  unlockedClasses: string[];
  unlockedFeatures: string[];
  cosmetics: string[];
}

/**
 * Request to claim a legacy reward
 */
export interface ClaimLegacyRewardRequest {
  rewardId: string;
  characterId: string;
}

/**
 * Response when claiming a reward
 */
export interface ClaimLegacyRewardResponse {
  success: boolean;
  reward: LegacyReward;
  appliedBonus: LegacyBonus;
}

/**
 * DTO for updating legacy progress
 */
export interface UpdateLegacyProgressDTO {
  userId: string;
  statKey: keyof LifetimeStats;
  value: number;
  increment?: boolean; // If true, add to existing; if false, set
}

/**
 * Event types that trigger legacy updates
 */
export enum LegacyEventType {
  COMBAT_VICTORY = 'combat_victory',
  BOSS_DEFEATED = 'boss_defeated',
  DUEL_WON = 'duel_won',
  DUEL_LOST = 'duel_lost',
  GOLD_EARNED = 'gold_earned',
  GOLD_SPENT = 'gold_spent',
  PROPERTY_ACQUIRED = 'property_acquired',
  TRADE_COMPLETED = 'trade_completed',
  ITEM_CRAFTED = 'item_crafted',
  ITEM_BOUGHT = 'item_bought',
  ITEM_SOLD = 'item_sold',
  GANG_RANK_INCREASED = 'gang_rank_increased',
  FRIEND_ADDED = 'friend_added',
  MAIL_SENT = 'mail_sent',
  REPUTATION_EARNED = 'reputation_earned',
  LOCATION_DISCOVERED = 'location_discovered',
  SECRET_FOUND = 'secret_found',
  RARE_EVENT = 'rare_event',
  TERRITORY_CAPTURED = 'territory_captured',
  QUEST_COMPLETED = 'quest_completed',
  SKILL_MAXED = 'skill_maxed',
  SKILL_POINT_EARNED = 'skill_point_earned',
  PROFESSION_MASTERED = 'profession_mastered',
  DAY_PLAYED = 'day_played',
  LOGIN = 'login',
  SEASONAL_EVENT = 'seasonal_event',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  CHARACTER_CREATED = 'character_created',
  CHARACTER_RETIRED = 'character_retired',
  LEVEL_UP = 'level_up',
  FAME_GAINED = 'fame_gained',
}

/**
 * Payload for legacy event
 */
export interface LegacyEventPayload {
  eventType: LegacyEventType;
  userId: string;
  characterId?: string;
  value?: number;
  metadata?: Record<string, any>;
}

/**
 * Summary of new character bonuses
 */
export interface NewCharacterBonuses {
  tier: LegacyTier;
  tierBonuses: LegacyBonus[];
  milestoneBonuses: LegacyBonus[];
  allBonuses: ActiveLegacyBonuses;
  availableRewards: LegacyReward[];
}

/**
 * Response for legacy profile endpoint
 */
export interface LegacyProfileResponse {
  profile: LegacyProfile;
  tierDefinition: LegacyTierDefinition;
  nextTier?: LegacyTierDefinition;
  milestonesUntilNextTier?: number;
  activeBonuses: ActiveLegacyBonuses;
}

/**
 * Response for milestones endpoint
 */
export interface LegacyMilestonesResponse {
  milestones: LegacyMilestone[];
  progress: MilestoneProgress[];
  completed: string[];
  inProgress: string[];
  locked: string[];
}
