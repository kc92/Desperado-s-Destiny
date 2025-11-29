/**
 * Holiday Events System - Type Definitions
 * Desperados Destiny - Phase 12, Wave 12.2
 */

export type HolidayType =
  | 'NEW_YEAR'
  | 'VALENTINE'
  | 'EASTER'
  | 'INDEPENDENCE_DAY'
  | 'HALLOWEEN'
  | 'THANKSGIVING'
  | 'CHRISTMAS';

export type HolidayCurrency =
  | 'CONFETTI'
  | 'LOVE_LETTER'
  | 'EASTER_EGG'
  | 'PATRIOT_TOKEN'
  | 'CANDY_CORN'
  | 'TURKEY_FEATHER'
  | 'CANDY_CANE';

export type HolidayWeatherType =
  | 'CLEAR'
  | 'RAIN'
  | 'SNOW'
  | 'FOG'
  | 'STORM'
  | 'FIREWORKS';

export type HolidayActivityType =
  | 'HUNT'
  | 'CONTEST'
  | 'COOKING'
  | 'COMBAT'
  | 'COLLECTION'
  | 'DELIVERY'
  | 'SOCIAL';

export interface HolidayGameDate {
  month: number; // 1-12
  day: number; // 1-31
  year?: number; // Optional for recurring events
}

export interface QuestRequirement {
  type: 'LEVEL' | 'ITEM' | 'REPUTATION' | 'QUEST_COMPLETED' | 'GANG';
  value: string | number;
  amount?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'find' | 'kill' | 'cleanse' | 'rescue' | 'collect' | 'deliver' | 'visit' | 'craft' | 'win';
  target: string;
  current: number;
  required: number;
  optional?: boolean;
}

export interface Reward {
  type: 'GOLD' | 'XP' | 'ITEM' | 'CURRENCY' | 'TITLE' | 'COSMETIC' | 'ACHIEVEMENT';
  id: string;
  amount: number;
  rarity?: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface HolidayQuest {
  id: string;
  name: string;
  description: string;
  lore: string;
  requirements: QuestRequirement[];
  objectives: QuestObjective[];
  rewards: Reward[];
  repeatable: boolean;
  dailyLimit?: number;
  chainQuest?: string; // Next quest in chain
}

export interface HolidayShop {
  id: string;
  name: string;
  npcName: string;
  currency: HolidayCurrency;
  items: HolidayShopItem[];
  location: string;
}

export interface HolidayShopItem {
  itemId: string;
  name: string;
  description: string;
  cost: number; // In holiday currency
  stock?: number; // Limited quantity
  purchaseLimit?: number; // Per player
  requiredLevel?: number;
}

export interface Decoration {
  id: string;
  name: string;
  location: string;
  type: 'BANNER' | 'LIGHTS' | 'STATUE' | 'TREE' | 'EFFECTS';
  description: string;
}

export interface HolidayNPC {
  id: string;
  name: string;
  role: string;
  location: string;
  dialogue: HolidayNPCDialogue[];
  quests: string[]; // Quest IDs
  shopId?: string;
}

export interface HolidayNPCDialogue {
  id: string;
  text: string;
  condition?: string;
  responses?: HolidayDialogueResponse[];
}

export interface HolidayDialogueResponse {
  text: string;
  action?: string;
  nextDialogue?: string;
}

export interface HolidayActivity {
  id: string;
  name: string;
  type: HolidayActivityType;
  description: string;
  duration: number; // Minutes
  maxParticipants?: number;
  rewards: Reward[];
  startTimes?: string[]; // Scheduled times
  requirements?: QuestRequirement[];
}

export interface HolidayDailyChallenge {
  id: string;
  name: string;
  description: string;
  objective: QuestObjective;
  reward: Reward;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface HolidayItem {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'CLOTHING' | 'ACCESSORY' | 'CONSUMABLE' | 'DECORATION';
  slot?: string;
  stats?: Record<string, number>;
  effects?: ItemEffect[];
  tradeable: boolean;
  expiresAfterEvent: boolean;
}

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
}

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  slot: 'HAT' | 'OUTFIT' | 'BOOTS' | 'ACCESSORY' | 'MOUNT_SKIN' | 'WEAPON_SKIN';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  exclusive: boolean;
}

export interface HolidayEvent {
  id: string;
  type: HolidayType;
  name: string;
  description: string;
  lore: string;

  // Timing
  startDate: HolidayGameDate;
  endDate: HolidayGameDate;
  duration: number; // Game days

  // Content
  specialQuests: HolidayQuest[];
  limitedShops: HolidayShop[];
  decorations: Decoration[];
  specialNPCs: HolidayNPC[];

  // Activities
  activities: HolidayActivity[];
  dailyChallenges: HolidayDailyChallenge[];

  // Rewards
  participationRewards: Reward[];
  completionRewards: Reward[];
  exclusiveItems: HolidayItem[];
  limitedCosmetics: Cosmetic[];

  // Currency
  currency: HolidayCurrency;
  currencyConversionRate?: number; // To gold after event

  // Atmosphere
  musicTheme?: string;
  weatherOverride?: HolidayWeatherType;
  skyboxOverride?: string;
  townDecorationsEnabled: boolean;
  npcCostumesEnabled: boolean;
}

export interface HolidayProgress {
  playerId: string;
  characterId: string;
  holidayId: string;
  holidayType: HolidayType;

  // Tracking
  participated: boolean;
  completedQuests: string[];
  dailyChallengesCompleted: Record<string, number>; // challengeId -> count
  activitiesParticipated: string[];

  // Currency
  currencyEarned: number;
  currencySpent: number;
  currencyBalance: number;

  // Achievements
  achievementsUnlocked: string[];
  titlesEarned: string[];
  itemsCollected: string[];
  cosmeticsUnlocked: string[];

  // Contest participation
  contestEntries: ContestEntry[];

  // Statistics
  startedAt: Date;
  lastActivityAt: Date;
  totalTimeSpent: number; // Minutes
}

export interface ContestEntry {
  contestId: string;
  contestType: string;
  entry: any; // Contest-specific data
  score?: number;
  rank?: number;
  submittedAt: Date;
}

export interface HolidayReward {
  id: string;
  holidayId: string;
  name: string;
  description: string;
  requirements: HolidayRewardRequirement[];
  rewards: Reward[];
  claimable: boolean;
}

export interface HolidayRewardRequirement {
  type: 'QUESTS_COMPLETED' | 'CURRENCY_EARNED' | 'ACTIVITIES_PARTICIPATED' | 'ACHIEVEMENT_UNLOCKED';
  value: number;
  description: string;
}

export interface HolidayEncounter {
  id: string;
  holidayId: string;
  name: string;
  type: 'MONSTER' | 'BOSS' | 'RARE_SPAWN' | 'LEGENDARY';
  level: number;
  health: number;
  damage: number;
  abilities: string[];
  lootTable: HolidayLoot[];
  spawnLocations: string[];
  spawnChance: number;
  maxSpawns?: number;
}

export interface HolidayLoot {
  itemId: string;
  dropChance: number; // 0-1
  minQuantity: number;
  maxQuantity: number;
  guaranteed?: boolean;
}

export interface HolidayLeaderboard {
  holidayId: string;
  category: string;
  entries: HolidayLeaderboardEntry[];
  updatedAt: Date;
}

export interface HolidayLeaderboardEntry {
  rank: number;
  playerId: string;
  characterName: string;
  score: number;
  reward?: Reward;
}

export interface ActiveHoliday {
  event: HolidayEvent;
  isActive: boolean;
  daysRemaining: number;
  participants: number;
  startedAt: Date;
  endsAt: Date;
}
