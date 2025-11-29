/**
 * System Event Types
 * Defines cross-system event propagation for integration testing
 */

/**
 * All system names in the game
 */
export enum SystemName {
  // Core Systems
  CHARACTER = 'character',
  USER = 'user',
  AUTH = 'auth',
  LEGACY = 'legacy',

  // Progression Systems
  COMBAT = 'combat',
  SKILL = 'skill',
  QUEST = 'quest',
  ACHIEVEMENT = 'achievement',

  // Economy Systems
  GOLD = 'gold',
  SHOP = 'shop',
  CRAFTING = 'crafting',
  PROPERTY = 'property',
  BANK = 'bank',

  // Social Systems
  GANG = 'gang',
  FRIEND = 'friend',
  MAIL = 'mail',
  CHAT = 'chat',

  // Territory & Warfare
  TERRITORY = 'territory',
  GANG_WAR = 'gangWar',
  FACTION_WAR = 'factionWar',
  CONQUEST = 'conquest',

  // World Systems
  LOCATION = 'location',
  NPC = 'npc',
  WORLD_EVENT = 'worldEvent',
  TIME = 'time',
  WEATHER = 'weather',

  // Crime & Law
  CRIME = 'crime',
  JAIL = 'jail',
  BOUNTY = 'bounty',

  // Reputation & Influence
  REPUTATION = 'reputation',
  GOSSIP = 'gossip',
  NEWSPAPER = 'newspaper',

  // Advanced Systems
  HUNTING = 'hunting',
  FISHING = 'fishing',
  HORSE = 'horse',
  GAMBLING = 'gambling',
  TOURNAMENT = 'tournament',

  // Meta Systems
  NOTIFICATION = 'notification',
  ENERGY = 'energy',
  DEATH = 'death'
}

/**
 * Event types that systems can emit
 */
export enum SystemEventType {
  // Character Events
  CHARACTER_CREATED = 'character.created',
  CHARACTER_DELETED = 'character.deleted',
  CHARACTER_LEVEL_UP = 'character.levelUp',
  CHARACTER_DIED = 'character.died',

  // Combat Events
  COMBAT_STARTED = 'combat.started',
  COMBAT_VICTORY = 'combat.victory',
  COMBAT_DEFEAT = 'combat.defeat',
  BOSS_DEFEATED = 'combat.bossDefeated',
  DUEL_WON = 'combat.duelWon',
  DUEL_LOST = 'combat.duelLost',

  // Gold Events
  GOLD_EARNED = 'gold.earned',
  GOLD_SPENT = 'gold.spent',
  GOLD_TRANSFERRED = 'gold.transferred',

  // Quest Events
  QUEST_STARTED = 'quest.started',
  QUEST_COMPLETED = 'quest.completed',
  QUEST_FAILED = 'quest.failed',

  // Achievement Events
  ACHIEVEMENT_UNLOCKED = 'achievement.unlocked',

  // Skill Events
  SKILL_TRAINED = 'skill.trained',
  SKILL_LEVEL_UP = 'skill.levelUp',
  SKILL_MAXED = 'skill.maxed',

  // Gang Events
  GANG_JOINED = 'gang.joined',
  GANG_LEFT = 'gang.left',
  GANG_RANK_CHANGED = 'gang.rankChanged',
  GANG_WAR_STARTED = 'gang.warStarted',
  GANG_WAR_ENDED = 'gang.warEnded',

  // Territory Events
  TERRITORY_CAPTURED = 'territory.captured',
  TERRITORY_LOST = 'territory.lost',

  // Social Events
  FRIEND_ADDED = 'friend.added',
  FRIEND_REMOVED = 'friend.removed',
  MAIL_SENT = 'mail.sent',
  MAIL_RECEIVED = 'mail.received',

  // Reputation Events
  REPUTATION_GAINED = 'reputation.gained',
  REPUTATION_LOST = 'reputation.lost',
  FAME_CHANGED = 'reputation.fameChanged',

  // Crime Events
  CRIME_COMMITTED = 'crime.committed',
  ARRESTED = 'crime.arrested',
  JAILED = 'crime.jailed',
  RELEASED = 'crime.released',

  // Shop Events
  ITEM_PURCHASED = 'shop.itemPurchased',
  ITEM_SOLD = 'shop.itemSold',

  // Crafting Events
  ITEM_CRAFTED = 'crafting.itemCrafted',
  RECIPE_LEARNED = 'crafting.recipeLearned',

  // Property Events
  PROPERTY_PURCHASED = 'property.purchased',
  PROPERTY_SOLD = 'property.sold',
  PROPERTY_INCOME = 'property.income',

  // Legacy Events
  MILESTONE_COMPLETED = 'legacy.milestoneCompleted',
  TIER_INCREASED = 'legacy.tierIncreased',
  REWARD_CLAIMED = 'legacy.rewardClaimed'
}

/**
 * Event data payload
 */
export interface SystemEventData {
  // Identifiers
  userId?: string;
  characterId?: string;
  targetId?: string;

  // Amounts
  amount?: number;
  quantity?: number;

  // Type identifiers
  itemId?: string;
  questId?: string;
  achievementId?: string;
  skillId?: string;
  locationId?: string;
  npcId?: string;

  // Metadata
  source?: string;
  reason?: string;
  metadata?: Record<string, any>;

  // Timestamps
  timestamp?: Date;
}

/**
 * System event structure
 */
export interface SystemEvent {
  // Event identification
  id: string;
  source: SystemName;
  eventType: SystemEventType;

  // Event data
  data: SystemEventData;

  // Routing
  targets: SystemName[];
  priority: EventPriority;

  // Tracking
  timestamp: Date;
  processed: boolean;
  processedBy: SystemName[];
  errors?: Array<{
    system: SystemName;
    error: string;
    timestamp: Date;
  }>;
}

/**
 * Event priority for processing order
 */
export enum EventPriority {
  CRITICAL = 0,  // Must be processed immediately (e.g., death, character creation)
  HIGH = 1,      // Important updates (e.g., level up, achievement)
  NORMAL = 2,    // Standard events (e.g., gold earned, item collected)
  LOW = 3        // Background events (e.g., stat tracking)
}

/**
 * Event subscription configuration
 */
export interface EventSubscription {
  system: SystemName;
  eventTypes: SystemEventType[];
  handler: (event: SystemEvent) => Promise<void>;
  priority: EventPriority;
}

/**
 * Event dispatch result
 */
export interface EventDispatchResult {
  event: SystemEvent;
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    system: SystemName;
    error: string;
  }>;
  processingTimeMs: number;
}

/**
 * System dependency configuration
 */
export interface SystemDependency {
  system: SystemName;
  dependsOn: SystemName[];
  requiredForInitialization: boolean;
}

/**
 * Integration health status
 */
export interface IntegrationHealth {
  system: SystemName;
  status: 'healthy' | 'degraded' | 'down';
  dependencies: Array<{
    system: SystemName;
    connected: boolean;
    latencyMs?: number;
  }>;
  lastCheck: Date;
  issues?: string[];
}

/**
 * Cross-system transaction
 */
export interface CrossSystemTransaction {
  id: string;
  systems: SystemName[];
  operations: Array<{
    system: SystemName;
    operation: string;
    data: any;
    status: 'pending' | 'completed' | 'failed';
    error?: string;
  }>;
  status: 'pending' | 'committed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
}

/**
 * System event router configuration
 */
export interface EventRouterConfig {
  // Event type to target systems mapping
  routes: Record<SystemEventType, SystemName[]>;

  // Default targets for unrouted events
  defaultTargets: SystemName[];

  // Event processing timeout
  processingTimeoutMs: number;

  // Retry configuration
  retryAttempts: number;
  retryDelayMs: number;
}
