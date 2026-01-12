/**
 * Expedition System Types
 *
 * Type definitions for the offline expedition system
 * Allows players to send characters on long-running activities
 */

/**
 * Expedition Types - Different expedition activities
 */
export enum ExpeditionType {
  HUNTING_TRIP = 'hunting_trip',           // 2-8 hours, pelts/meat/hides
  PROSPECTING_RUN = 'prospecting_run',     // 4-12 hours, ore/gems/gold
  TRADE_CARAVAN = 'trade_caravan',         // 8-24 hours, gold/items/reputation
  SCOUTING_MISSION = 'scouting_mission',   // 1-4 hours, intel/map reveals
}

/**
 * Expedition Status Lifecycle
 */
export enum ExpeditionStatus {
  PREPARING = 'preparing',         // Player setting up expedition
  IN_PROGRESS = 'in_progress',     // Expedition underway
  COMPLETED = 'completed',         // Returned successfully
  FAILED = 'failed',               // Expedition failed
  CANCELLED = 'cancelled',         // Cancelled before completion
}

/**
 * Expedition Duration Tier
 */
export enum ExpeditionDurationTier {
  QUICK = 'quick',           // 1-2 hours, 95% success, 1.0x rewards
  STANDARD = 'standard',     // 4-8 hours, 85% success, 2.0x rewards
  EXTENDED = 'extended',     // 12-24 hours, 70% success, 4.0x rewards
}

/**
 * Expedition Outcome (for completed expeditions)
 */
export enum ExpeditionOutcome {
  CRITICAL_SUCCESS = 'critical_success',  // 150% rewards, bonus discovery
  SUCCESS = 'success',                     // Normal rewards
  PARTIAL_SUCCESS = 'partial_success',    // 50% rewards
  FAILURE = 'failure',                     // Minimal rewards, resource loss
  CRITICAL_FAILURE = 'critical_failure',  // No rewards, possible injury
}

/**
 * Expedition event types during travel
 */
export enum ExpeditionEventType {
  COMBAT = 'combat',               // Combat encounter
  DISCOVERY = 'discovery',         // Found something valuable
  NPC_ENCOUNTER = 'npc_encounter', // Met an NPC
  SKILL_CHECK = 'skill_check',     // Skill-based challenge
  WEATHER = 'weather',             // Weather event
  AMBUSH = 'ambush',               // Ambushed by bandits
}

/**
 * Expedition resource type
 */
export enum ExpeditionResourceType {
  // Hunting rewards
  PELT = 'pelt',
  MEAT = 'meat',
  HIDE = 'hide',
  RARE_HIDE = 'rare_hide',
  TROPHY = 'trophy',

  // Prospecting rewards
  ORE = 'ore',
  GEM = 'gem',
  GOLD_NUGGET = 'gold_nugget',
  RARE_MINERAL = 'rare_mineral',

  // Trade rewards
  GOLD = 'gold',
  TRADE_GOODS = 'trade_goods',
  RARE_ITEM = 'rare_item',
  REPUTATION = 'reputation',

  // Scouting rewards
  INTEL = 'intel',
  MAP_FRAGMENT = 'map_fragment',
  SHORTCUT = 'shortcut',
  LOCATION_DISCOVERY = 'location_discovery',
}

/**
 * Expedition resource reward
 */
export interface IExpeditionResource {
  type: ExpeditionResourceType;
  itemId?: string;           // Specific item ID if applicable
  itemName?: string;         // Display name
  quantity: number;
  value?: number;            // Gold value
}

/**
 * Expedition event that occurred during travel
 */
export interface IExpeditionEvent {
  eventId: string;
  type: ExpeditionEventType;
  title: string;
  description: string;
  occurredAt: Date;
  outcome: 'positive' | 'neutral' | 'negative';
  rewards?: IExpeditionResource[];
  losses?: IExpeditionResource[];
  xpGained?: number;
  goldGained?: number;
  goldLost?: number;
  healthLost?: number;
}

/**
 * Expedition result details
 */
export interface IExpeditionResult {
  outcome: ExpeditionOutcome;
  totalGold: number;
  totalXp: number;
  resources: IExpeditionResource[];
  events: IExpeditionEvent[];

  // Skill XP gained
  skillXp?: {
    skillId: string;
    amount: number;
  }[];

  // Special discoveries
  locationDiscovered?: string;
  tradeRouteUnlocked?: string;
  claimDiscovered?: string;

  // Penalties
  healthLost?: number;
  energyLost?: number;
  itemsLost?: IExpeditionResource[];
}

/**
 * Expedition duration range (in milliseconds)
 */
export interface IExpeditionDuration {
  minMs: number;
  maxMs: number;
  defaultMs: number;
}

/**
 * Expedition type configuration
 */
export interface IExpeditionTypeConfig {
  type: ExpeditionType;
  name: string;
  description: string;
  flavorText: string;

  // Duration ranges by tier
  durations: Record<ExpeditionDurationTier, IExpeditionDuration>;

  // Starting locations
  validStartLocations: string[];

  // Requirements
  minLevel?: number;
  skillRequirements?: Record<string, number>;
  itemRequirements?: string[];

  // Base costs
  energyCost: number;
  goldCost?: number;

  // Reward configuration
  primarySkill: string;       // Skill that gains XP
  baseXpReward: number;
  baseGoldReward: number;
  resourceTypes: ExpeditionResourceType[];

  // Risk factors
  eventChanceByTier: Record<ExpeditionDurationTier, number>;
}

/**
 * Expedition Data Transfer Object
 */
export interface IExpeditionDTO {
  expeditionId: string;
  characterId: string;
  characterName?: string;

  type: ExpeditionType;
  typeName: string;
  status: ExpeditionStatus;
  durationTier: ExpeditionDurationTier;

  // Location info
  startLocationId: string;
  startLocationName?: string;
  destinationInfo?: string;

  // Timing
  startedAt: Date;
  estimatedCompletionAt: Date;
  completedAt?: Date;

  // Resources committed
  mountId?: string;
  mountName?: string;
  suppliesUsed?: string[];
  gangMemberIds?: string[];

  // Results (populated after completion)
  result?: IExpeditionResult;

  // Progress info
  progressPercent: number;
  eventsEncountered: number;
  currentEventDescription?: string;
}

/**
 * Start expedition request
 */
export interface IStartExpeditionRequest {
  type: ExpeditionType;
  durationTier: ExpeditionDurationTier;
  customDurationMs?: number;    // Optional custom duration within tier range
  mountId?: string;             // Optional mount for bonuses
  suppliesItemIds?: string[];   // Optional supplies for bonuses
  gangMemberIds?: string[];     // Optional gang members (if leader)
}

/**
 * Cancel expedition request
 */
export interface ICancelExpeditionRequest {
  expeditionId: string;
  reason?: string;
}

/**
 * Expedition availability check
 */
export interface IExpeditionAvailability {
  type: ExpeditionType;
  canStart: boolean;
  reason?: string;              // Reason if cannot start

  // Requirements status
  meetsLevelRequirement: boolean;
  meetsSkillRequirements: boolean;
  meetsItemRequirements: boolean;
  hasEnoughEnergy: boolean;
  hasEnoughGold: boolean;
  isAtValidLocation: boolean;

  // Active expedition check
  hasActiveExpedition: boolean;
  activeExpeditionId?: string;

  // Cooldown info
  isOnCooldown?: boolean;
  cooldownEndsAt?: Date;
}

/**
 * Available expeditions at current location
 */
export interface ILocationExpeditions {
  locationId: string;
  locationName: string;
  availableExpeditions: IExpeditionAvailability[];
}

/**
 * Expedition progress update (for WebSocket)
 */
export interface IExpeditionProgressUpdate {
  expeditionId: string;
  characterId: string;
  progressPercent: number;
  status: ExpeditionStatus;
  currentEvent?: IExpeditionEvent;
  estimatedCompletionAt: Date;
}

/**
 * Expedition completion notification
 */
export interface IExpeditionCompleteNotification {
  expeditionId: string;
  characterId: string;
  type: ExpeditionType;
  result: IExpeditionResult;
}

/**
 * Expedition socket events
 */
export enum ExpeditionSocketEvent {
  EXPEDITION_STARTED = 'expedition:started',
  EXPEDITION_PROGRESS = 'expedition:progress',
  EXPEDITION_EVENT = 'expedition:event',
  EXPEDITION_COMPLETED = 'expedition:completed',
  EXPEDITION_CANCELLED = 'expedition:cancelled',
}

/**
 * Expedition statistics for character
 */
export interface IExpeditionStatistics {
  totalExpeditions: number;
  successfulExpeditions: number;
  failedExpeditions: number;
  expeditionsByType: Record<ExpeditionType, number>;
  totalGoldEarned: number;
  totalXpEarned: number;
  totalResourcesGathered: number;
  locationsDiscovered: number;
  tradeRoutesUnlocked: number;
  longestExpeditionMs: number;
  favoriteExpeditionType?: ExpeditionType;
}
