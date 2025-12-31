/**
 * Divine Story Types - PRIMARY SOURCE
 * The Bound One Storyline (Wild West MMORPG)
 *
 * Types for the epic divine struggle questline revealing the truth
 * about The Rift and the imprisoned entity beneath Sangre Territory.
 *
 * This is the canonical source for all Divine Story types.
 * For backwards compatibility with old code, see cosmicStory.types.ts
 */

import { Faction } from './character.types';

/**
 * The four acts of the divine struggle storyline
 */
export enum DivineAct {
  WHISPERS = 1,      // Level 25-28: Investigation and discovery
  DESCENT = 2,       // Level 28-32: Entering The Rift
  REVELATION = 3,    // Level 32-36: Learning the truth
  CONFRONTATION = 4  // Level 36-40: The final choice
}

/**
 * Available endings for The Bound One questline
 */
export enum DivineEnding {
  SALVATION = 'salvation',       // Work with faithful to strengthen seals
  PURIFICATION = 'purification', // Sacrifice to destroy the entity
  COVENANT = 'covenant',         // Make a pact with the entity
  ASCENSION = 'ascension',       // Help followers free the entity

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use SALVATION */
  BANISHMENT = 'salvation',
  /** @deprecated Use PURIFICATION */
  DESTRUCTION = 'purification',
  /** @deprecated Use COVENANT */
  BARGAIN = 'covenant',
  /** @deprecated Use ASCENSION */
  AWAKENING = 'ascension'
}

/**
 * Sin level tracks descent into spiritual darkness
 */
export interface SinState {
  level: number;              // 0-100: Current sin level
  threshold: number;          // When reaching 100, permanent effects trigger
  effects: SinEffect[];
  gainedAt: Date;
  lastUpdate: Date;
}

/**
 * Sin effects modify character behavior/appearance
 */
export interface SinEffect {
  id: string;
  name: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  statModifiers?: {
    cunning?: number;
    spirit?: number;
    combat?: number;
    craft?: number;
  };
  visualEffect?: string;       // Description of visual change
  isPermanent: boolean;
  gainedAt: Date;
}

/**
 * Faith events cause spiritual trials
 */
export interface FaithEvent {
  id: string;
  trigger: string;              // What triggers this event
  description: string;          // What the character experiences
  sinGain?: number;             // 0-20: How much sin added
  duration?: number;            // Milliseconds if temporary effect
  visionTriggered?: string;     // Optional vision ID to show
  choices?: FaithChoice[];      // Optional choices during event

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinGain */
  corruptionGain?: number;
}

/**
 * Choices during faith-affecting moments
 */
export interface FaithChoice {
  id: string;
  text: string;
  sinModifier?: number;         // -10 to +10: Sin change
  consequence: string;          // What happens when chosen

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinModifier */
  corruptionModifier?: number;
}

/**
 * Visions reveal divine truths
 */
export interface Vision {
  id: string;
  name: string;
  narrative: string;            // The vision text (multi-paragraph)
  images?: string[];            // Optional image references
  revealsLore?: string[];       // Lore entry IDs revealed
  sinRequired?: number;         // Minimum sin to trigger
  faithRequired?: number;       // Minimum faith for holy visions
  timestamp?: Date;             // When vision occurred

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinRequired */
  corruptionRequired?: number;
}

/**
 * Lore entries discovered throughout the quest
 */
export interface LoreEntry {
  id: string;
  category: LoreCategory;
  title: string;
  content: string;              // Full lore text
  discoveredBy?: string;        // Character who found it
  discoveredAt?: Date;
  source: string;               // Where it was found
  relatedEntries?: string[];    // Related lore IDs
}

/**
 * Categories of lore discoveries
 */
export enum LoreCategory {
  PETROGLYPHS = 'petroglyphs',           // Ancient stone carvings
  MINERS_JOURNAL = 'miners_journal',     // Mining expedition notes
  SCIENTIFIC_NOTES = 'scientific_notes', // Historical research
  CULT_SCRIPTURE = 'cult_scripture',     // Cult writings
  ORAL_HISTORY = 'oral_history',         // Elder stories
  DIVINE_VISIONS = 'divine_visions',     // Visions from celestial beings
  ARCHAEOLOGICAL = 'archaeological',     // Excavation findings
  PROPHECY = 'prophecy',                 // Ancient predictions

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use DIVINE_VISIONS */
  ENTITY_DREAMS = 'divine_visions',
  /** @deprecated Use CULT_SCRIPTURE */
  CULT_MANIFESTO = 'cult_scripture'
}

/**
 * Quest dialogue with branching options
 */
export interface QuestDialogue {
  id: string;
  speaker: string;              // NPC name or 'narrator'
  text: string;
  responses?: DialogueResponse[];
  nextDialogue?: string;        // Next dialogue ID if linear
  conditions?: DialogueCondition[];
}

/**
 * Player response options in dialogue
 */
export interface DialogueResponse {
  id: string;
  text: string;
  nextDialogue?: string;        // Where this choice leads
  requirements?: {
    sin?: number;               // Min sin level
    faith?: number;             // Min faith level
    faction?: Faction;
    completedQuests?: string[];
    /** @deprecated Use sin */
    corruption?: number;        // Backwards compat
  };
  effects?: {
    sinChange?: number;
    faithChange?: number;
    relationshipChange?: RelationshipChange;
    triggersEvent?: string;
    /** @deprecated Use sinChange */
    corruptionChange?: number;  // Backwards compat
  };
}

/**
 * Conditions for showing dialogue
 */
export interface DialogueCondition {
  type: 'sin' | 'faith' | 'faction' | 'quest' | 'item' | 'reputation';
  value: any;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
}

/**
 * Journal entries track the story
 */
export interface JournalEntry {
  id: string;
  questId: string;
  timestamp: Date;
  title: string;
  content: string;
  category: 'objective' | 'discovery' | 'vision' | 'revelation';
}

/**
 * Quest objective types for divine quests
 */
export type DivineObjectiveType =
  | 'investigate'      // Investigate a location
  | 'speak'           // Talk to NPC
  | 'find'            // Find item/location
  | 'survive'         // Survive encounter
  | 'defeat'          // Defeat enemy
  | 'collect'         // Collect items
  | 'witness'         // Experience a vision
  | 'choose'          // Make a choice
  | 'descend'         // Go deeper into The Rift
  | 'perform_ritual'  // Perform a ritual action
  | 'sacrifice';      // Sacrifice something

/**
 * Divine quest objective
 */
export interface DivineObjective {
  id: string;
  type: DivineObjectiveType;
  description: string;
  target?: string;              // Location, NPC, or item ID
  required: number;
  current: number;
  isOptional: boolean;
  sinOnComplete?: number;
  completionDialogue?: string;  // Dialogue ID when completed

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinOnComplete */
  corruptionOnComplete?: number;
}

/**
 * Faction relationship changes from choices
 */
export interface RelationshipChange {
  faction?: Faction;
  npcId?: string;
  change: number;               // -100 to +100
  reason: string;
}

/**
 * World effects from major quest events
 */
export interface WorldEffect {
  id: string;
  type: 'location_change' | 'npc_appearance' | 'faction_war' | 'environmental';
  description: string;
  affectedArea: string;         // Location or region ID
  isPermanent: boolean;
  duration?: number;            // Milliseconds if temporary
  visualChanges?: string[];     // Descriptions of visual changes
}

/**
 * Choice rewards for branching paths
 */
export interface ChoiceReward {
  choiceId: string;
  choiceName: string;
  rewards: DivineReward[];
  consequences: string[];       // Text descriptions
  worldEffects?: WorldEffect[];
  endingPath?: DivineEnding;    // Which ending this leads toward
}

/**
 * Divine quest rewards
 */
export interface DivineReward {
  type: 'dollars' | 'xp' | 'item' | 'reputation' | 'relic' | 'power' | 'knowledge' | 'artifact';
  amount?: number;
  itemId?: string;
  relicId?: string;             // Special divine relics
  powerId?: string;             // Supernatural abilities
  loreId?: string;              // Lore entries unlocked
  faction?: Faction;
  /** @deprecated Use relicId */
  artifactId?: string;          // Backwards compat
}

/**
 * Complete divine quest definition
 */
export interface DivineQuest {
  id: string;
  act: DivineAct;
  questNumber: number;          // 1-20
  name: string;
  description: string;

  // Narrative
  briefing: string;             // Quest introduction
  lore: LoreEntry[];
  dialogues: QuestDialogue[];
  journals: JournalEntry[];

  // Requirements
  levelRequirement: number;
  previousQuest?: string;       // Previous quest ID
  itemsRequired?: string[];
  reputationRequired?: {
    faction: Faction;
    amount: number;
  };
  sinMaximum?: number;          // Some quests lock if too sinful
  faithMinimum?: number;        // Some quests require faith

  // Objectives
  objectives: DivineObjective[];

  // Spiritual elements
  faithEvents?: FaithEvent[];   // Optional for backwards compat with old data
  visions?: Vision[];
  sinGain?: number;             // Base sin from quest
  atmosphericDescriptions?: string[]; // Environmental flavor text

  // Rewards
  baseRewards: DivineReward[];
  choiceRewards?: ChoiceReward[];

  // Consequences
  worldEffects?: WorldEffect[];
  relationshipChanges?: RelationshipChange[];

  // Metadata
  estimatedDuration: number;    // Estimated minutes to complete
  difficulty: 'normal' | 'hard' | 'very_hard' | 'extreme';
  canAbandon: boolean;
  createdAt?: Date;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use faithEvents */
  sanityEvents?: FaithEvent[];
  /** @deprecated Use sinGain */
  corruptionGain?: number;
  /** @deprecated Use sinMaximum */
  corruptionMaximum?: number;
}

/**
 * Character's progress through divine storyline
 */
export interface DivineProgress {
  characterId: string;
  currentQuest?: string;        // Current active quest ID
  completedQuests: string[];    // All completed quest IDs
  currentAct: DivineAct;

  // State tracking
  sinState: SinState;
  faithLevel: number;           // 0-100: Current faith level
  discoveredLore: LoreEntry[];
  experiencedVisions: Vision[];
  journalEntries: JournalEntry[];

  // Path tracking
  majorChoices: {
    questId: string;
    choiceId: string;
    timestamp: Date;
  }[];
  endingPath?: DivineEnding;    // Which ending player is heading toward

  // Key NPCs met
  npcRelationships: {
    npcId: string;
    relationship: number;       // -100 to +100
    metAt: Date;
  }[];

  // Timestamps
  startedAt: Date;
  lastProgressAt: Date;
  completedAt?: Date;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use sinState */
  corruption?: SinState;
}

/**
 * Key NPCs in the divine storyline
 */
export enum DivineNPC {
  THE_PROPHET = 'npc_divine_prophet',              // Mysterious guide
  CHIEF_FALLING_STAR = 'npc_divine_chief',         // Tribal elder
  FATHER_BLACKWOOD = 'npc_divine_blackwood',       // Zealous priest
  HIGH_PRIEST_EZEKIEL = 'npc_divine_ezekiel',      // Cult leader
  THE_SURVIVOR = 'npc_divine_survivor',            // Last expedition member
  THE_VOICE = 'npc_divine_voice',                  // Entity's herald
  MINER_MCGRAW = 'npc_divine_miner',               // Old prospector
  SERGEANT_HOLLOWAY = 'npc_divine_holloway',       // Military liaison
  SISTER_DELGADO = 'npc_divine_delgado',           // Nun/researcher
  SHAMAN_GRAY_WOLF = 'npc_divine_shaman',          // Spiritual guide

  // Backwards compatibility aliases (old cosmic horror names)
  /** @deprecated Use FATHER_BLACKWOOD */
  DR_BLACKWOOD = 'npc_divine_blackwood',
  /** @deprecated Use SISTER_DELGADO */
  PROFESSOR_DELGADO = 'npc_divine_delgado'
}

/**
 * Divine quest relics - special items from the storyline
 * (Not to be confused with DivineRelic from divineStruggle.types.ts)
 */
export interface DivineQuestRelic {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'trinket' | 'scripture' | 'relic';
  power: string;                // What it does
  sinCost?: number;             // Sin to use it (for dark items)
  faithCost?: number;           // Faith to use it (for holy items)
  obtainedFrom: string;         // Quest ID
  canBeDestroyed: boolean;
  stats?: {
    damage?: number;
    defense?: number;
    special?: string;
  };

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinCost */
  corruptionCost?: number;
}

// Backwards compat alias
/** @deprecated Use DivineQuestRelic */
export type DivineRelicStory = DivineQuestRelic;

/**
 * Divine powers - supernatural abilities gained
 */
export interface DivinePower {
  id: string;
  name: string;
  description: string;
  effect: string;
  sinCost?: number;             // Sin to activate (demonic powers)
  faithCost?: number;           // Faith to activate (angelic powers)
  cooldown: number;             // Seconds between uses
  unlockQuest: string;          // Which quest unlocks it
  isPermanent: boolean;
  tier: 1 | 2 | 3;              // Power tier
  alignment?: 'holy' | 'dark' | 'neutral';  // Optional for backwards compat

  // Backwards compatibility (old cosmic horror name)
  /** @deprecated Use sinCost */
  corruptionCost?: number;
}

/**
 * Ending outcome data
 */
export interface EndingOutcome {
  ending: DivineEnding;
  characterId: string;
  finalSin?: number;             // Optional for backwards compat
  finalFaith?: number;           // Optional for backwards compat
  choicesMade: string[];         // Choice IDs that led here
  alliesGained: string[];        // NPC IDs
  alliesLost: string[];          // NPC IDs
  relicsObtained?: string[];     // Relic IDs - Optional for backwards compat
  powersGained: string[];        // Power IDs
  worldChanges: WorldEffect[];
  epilogue: string;              // Ending narration
  achievedAt: Date;

  // Backwards compatibility (old cosmic horror names)
  /** @deprecated Use finalSin */
  finalCorruption?: number;
  /** @deprecated Use relicsObtained */
  artifactsObtained?: string[];
}

/**
 * API Request/Response types
 */
export interface StartDivineStorylineRequest {
  characterId: string;
}

export interface StartDivineStorylineResponse {
  progress: DivineProgress;
  firstQuest: DivineQuest;
  message: string;
}

export interface GetDivineProgressRequest {
  characterId: string;
}

export interface GetDivineProgressResponse {
  progress: DivineProgress;
  availableQuests: DivineQuest[];
  currentQuest?: DivineQuest;
}

export interface CompleteDivineObjectiveRequest {
  characterId: string;
  questId: string;
  objectiveId: string;
  choiceId?: string;            // If objective involves a choice
}

export interface CompleteDivineObjectiveResponse {
  objective: DivineObjective;
  visionTriggered?: Vision;
  faithEvent?: FaithEvent;
  sinGained: number;
  questCompleted: boolean;
  message: string;
}

export interface MakeDivineChoiceRequest {
  characterId: string;
  questId: string;
  choiceId: string;
}

export interface MakeDivineChoiceResponse {
  choice: ChoiceReward;
  sinChange: number;
  faithChange: number;
  relationshipChanges: RelationshipChange[];
  worldEffects: WorldEffect[];
  endingPathUpdate?: DivineEnding;
  message: string;
}

export interface CompleteDivineQuestRequest {
  characterId: string;
  questId: string;
  finalChoice?: string;         // For quests with final choices
}

export interface CompleteDivineQuestResponse {
  quest: DivineQuest;
  rewards: DivineReward[];
  sinGained: number;
  nextQuest?: DivineQuest;
  actCompleted?: DivineAct;
  ending?: EndingOutcome;
  message: string;
}

export interface GetLoreEntriesRequest {
  characterId: string;
  category?: LoreCategory;
}

export interface GetLoreEntriesResponse {
  lore: LoreEntry[];
  totalDiscovered: number;
  totalAvailable: number;
}

export interface GetVisionsRequest {
  characterId: string;
}

export interface GetVisionsResponse {
  visions: Vision[];
  totalExperienced: number;
}

export interface GetSinStateRequest {
  characterId: string;
}

export interface GetSinStateResponse {
  sin: SinState;
  faith: number;
  effects: SinEffect[];
  warningLevel: 'safe' | 'warning' | 'danger' | 'critical';
  canBeRedeemed: boolean;
  redemptionMethods: string[];
}

export interface TriggerEndingRequest {
  characterId: string;
  ending: DivineEnding;
  finalChoices: string[];       // Choice IDs for ending
}

export interface TriggerEndingResponse {
  outcome: EndingOutcome;
  rewards: DivineReward[];
  achievements: string[];       // Achievement IDs unlocked
  epilogue: string;
  message: string;
}

