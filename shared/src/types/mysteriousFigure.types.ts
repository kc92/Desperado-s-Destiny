/**
 * Mysterious Figure Types
 *
 * Shared types for mysterious figure NPCs system
 */

/**
 * Supernatural level classification
 */
export enum SupernaturalLevel {
  MUNDANE = 'mundane',           // No supernatural powers
  TOUCHED = 'touched',            // Has encountered supernatural, minor abilities
  SUPERNATURAL = 'supernatural',  // Genuinely supernatural being
  COSMIC = 'cosmic'              // Connected to cosmic horror/The Scar
}

/**
 * Time of day for spawning
 */
export enum TimeOfDay {
  DAWN = 'dawn',
  DAY = 'day',
  DUSK = 'dusk',
  NIGHT = 'night'
}

/**
 * Weather conditions for spawning
 */
export enum WeatherCondition {
  CLEAR = 'Clear',
  CLOUDY = 'Cloudy',
  STORMY = 'Stormy',
  FOGGY = 'Foggy',
  DUST_STORM = 'Dust Storm'
}

/**
 * Player conditions that trigger spawns
 */
export enum PlayerCondition {
  HIGH_BOUNTY = 'high_bounty',
  LOW_HEALTH = 'low_health',
  NEAR_DEATH = 'near_death',
  CRITICAL_MOMENT = 'critical_moment',
  MORAL_CHOICE = 'moral_choice',
  WORTHY_DEED = 'worthy_deed',
  ARROGANT_ACTION = 'arrogant_action',
  HAS_RARE_ITEM = 'has_rare_item',
  FOUND_ARTIFACT = 'artifact_found',
  DEMON_ENCOUNTER = 'demon_encounter',
  CURSED = 'cursed',
  EXPLORING = 'exploring',
  LOST = 'lost',
  RECENT_COMBAT = 'recent_combat'
}

/**
 * Spawn conditions for mysterious figures
 */
export interface SpawnConditions {
  locations: string[];
  timeOfDay?: TimeOfDay[];
  weatherConditions?: WeatherCondition[];
  playerConditions?: PlayerCondition[];
  randomChance: number;
  questTrigger?: string;
  eventTrigger?: string;
  minLevel?: number;
  maxLevel?: number;
  requiresDiscovery?: boolean;
}

/**
 * Quest reward types
 */
export interface MysteryQuestReward {
  type: 'dollars' | 'xp' | 'item' | 'reputation' | 'lore' | 'special';
  amount?: number;
  itemId?: string;
  faction?: string;
  loreId?: string;
  specialEffect?: string;
}

/**
 * Mystery quest objective
 */
export interface MysteryQuestObjective {
  id: string;
  description: string;
  type: string;
  target: string;
  required: number;
}

/**
 * Mystery quest definition
 */
export interface MysteryQuest {
  id: string;
  name: string;
  description: string;
  actualObjective: string;
  objectives: MysteryQuestObjective[];
  rewards: MysteryQuestReward[];
  consequences: string[];
  loreRevealed: string[];
  moralWeight?: string;
  multipleOutcomes?: boolean;
}

/**
 * Mysterious dialogue structure
 */
export interface MysteriousDialogue {
  greeting: string[];
  crypticHints: string[];
  questDialogue: {
    [questId: string]: string[];
  };
  farewell: string[];
  refusal: string[];
  information: {
    [topic: string]: string[];
  };
}

/**
 * Trade item from mysterious figures
 */
export interface MysteriousTradeItem {
  itemId: string;
  name: string;
  description: string;
  price?: number;
  barterItem?: string;
  cursed?: boolean;
  loreText?: string;
  requiresTrust?: number;
}

/**
 * Complete mysterious figure definition
 */
export interface MysteriousFigure {
  id: string;
  name: string;
  title: string;
  appearance: string;
  role: string;
  behavior: string;
  personality: string;
  backstory: string;
  spawnConditions: SpawnConditions;
  quests: MysteryQuest[];
  dialogue: MysteriousDialogue;
  supernaturalLevel: SupernaturalLevel;
  knowledgeAreas: string[];
  tradeItems?: MysteriousTradeItem[];
  warnings?: string[];
  faction?: string;
  scarConnection?: string;
  discoveryMethod?: string;
}

/**
 * Spawn result
 */
export interface MysteriousFigureSpawn {
  figure: MysteriousFigure;
  message: string;
  dialogue: string;
  location: string;
  timestamp: Date;
}

/**
 * Interaction result
 */
export interface MysteriousFigureInteraction {
  dialogue: string[];
  availableQuests: string[];
  hints: string[];
  tradeAvailable: boolean;
  knowledgeTopics?: string[];
}

/**
 * Quest start result
 */
export interface MysteriousQuestStart {
  success: boolean;
  message: string;
  questId?: string;
  description?: string;
  objectives?: MysteryQuestObjective[];
}

/**
 * Trade result
 */
export interface MysteriousTradeResult {
  success: boolean;
  message: string;
  item?: MysteriousTradeItem;
  goldSpent?: number;
  itemTraded?: string;
}

/**
 * Discovery result
 */
export interface MysteriousFigureDiscovery {
  discovered: boolean;
  figureId: string;
  figureName: string;
  message: string;
  backstory?: string;
}

/**
 * Mysterious figure knowledge request
 */
export interface KnowledgeRequest {
  figureId: string;
  topic: string;
}

/**
 * Mysterious figure knowledge response
 */
export interface KnowledgeResponse {
  figureId: string;
  figureName: string;
  topic: string;
  knowledge: string[];
  relatedTopics: string[];
}

/**
 * The Scar warning collection
 */
export interface ScarWarnings {
  figure: string;
  warnings: string[];
  scarConnection?: string;
  supernaturalLevel: SupernaturalLevel;
}

/**
 * Mysterious figure encounter log
 */
export interface MysteriousFigureEncounter {
  characterId: string;
  figureId: string;
  figureName: string;
  location: string;
  encounterType: 'spawn' | 'interaction' | 'quest' | 'trade';
  timestamp: Date;
  result?: string;
}

/**
 * API Response types
 */
export interface MysteriousFigureCheckSpawnResponse {
  spawned: boolean;
  spawn?: MysteriousFigureSpawn;
}

export interface MysteriousFigureInteractResponse {
  success: boolean;
  interaction: MysteriousFigureInteraction;
}

export interface MysteriousFigureQuestResponse {
  success: boolean;
  questStart: MysteriousQuestStart;
}

export interface MysteriousFigureTradeResponse {
  success: boolean;
  trade: MysteriousTradeResult;
}

export interface MysteriousFigureDiscoveryResponse {
  success: boolean;
  discovery: MysteriousFigureDiscovery;
}

export interface MysteriousFigureKnowledgeResponse {
  success: boolean;
  knowledge: KnowledgeResponse;
}

/**
 * Mysterious figure event types
 */
export enum MysteriousFigureEvent {
  SPAWNED = 'mysterious_figure_spawned',
  DISCOVERED = 'mysterious_figure_discovered',
  QUEST_STARTED = 'mysterious_figure_quest_started',
  QUEST_COMPLETED = 'mysterious_figure_quest_completed',
  TRADE_COMPLETED = 'mysterious_figure_trade_completed',
  KNOWLEDGE_GAINED = 'mysterious_figure_knowledge_gained',
  WARNING_RECEIVED = 'mysterious_figure_warning_received'
}
