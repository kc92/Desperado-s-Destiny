/**
 * Cosmic Story Types - What-Waits-Below Storyline
 *
 * Types for the epic cosmic horror questline revealing the truth
 * about The Scar and the entity beneath Sangre Territory
 * Part of Phase 14, Wave 14.1 - What-Waits-Below Storyline
 */

import { Faction } from './character.types';

/**
 * The four acts of the cosmic horror storyline
 */
export enum CosmicAct {
  WHISPERS = 1,      // Level 25-28: Investigation and discovery
  DESCENT = 2,       // Level 28-32: Entering The Scar
  REVELATION = 3,    // Level 32-36: Learning the truth
  CONFRONTATION = 4  // Level 36-40: The final choice
}

/**
 * Available endings for the What-Waits-Below questline
 */
export enum CosmicEnding {
  BANISHMENT = 'banishment',       // Work with Coalition to strengthen seals
  DESTRUCTION = 'destruction',     // Sacrifice to destroy the entity
  BARGAIN = 'bargain',            // Make a deal with the entity
  AWAKENING = 'awakening'         // Help cultists wake the entity
}

/**
 * Corruption level tracks descent into cosmic madness
 */
export interface CorruptionState {
  level: number;              // 0-100: Current corruption level
  threshold: number;          // When reaching 100, permanent effects trigger
  effects: CorruptionEffect[];
  gainedAt: Date;
  lastUpdate: Date;
}

/**
 * Corruption effects modify character behavior/appearance
 */
export interface CorruptionEffect {
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
  visualEffect?: string;       // Description of visual corruption
  isPermanent: boolean;
  gainedAt: Date;
}

/**
 * Sanity events cause temporary madness
 */
export interface SanityEvent {
  id: string;
  trigger: string;              // What triggers this event
  description: string;          // What the character experiences
  corruptionGain: number;       // 0-20: How much corruption added
  duration?: number;            // Milliseconds if temporary effect
  visionTriggered?: string;     // Optional vision ID to show
  choices?: SanityChoice[];     // Optional choices during event
}

/**
 * Choices during sanity-affecting moments
 */
export interface SanityChoice {
  id: string;
  text: string;
  corruptionModifier: number;   // -10 to +10: Corruption change
  consequence: string;          // What happens when chosen
}

/**
 * Visions reveal cosmic truths
 */
export interface Vision {
  id: string;
  name: string;
  narrative: string;            // The vision text (multi-paragraph)
  images?: string[];            // Optional image references
  revealsLore?: string[];       // Lore entry IDs revealed
  corruptionRequired?: number;  // Minimum corruption to trigger
  timestamp?: Date;             // When vision occurred
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
  SCIENTIFIC_NOTES = 'scientific_notes', // Dr. Blackwood's research
  CULT_MANIFESTO = 'cult_manifesto',     // Cult of the Deep writings
  ORAL_HISTORY = 'oral_history',         // Coalition elder stories
  ENTITY_DREAMS = 'entity_dreams',       // Dreams from What-Waits-Below
  ARCHAEOLOGICAL = 'archaeological',     // Excavation findings
  PROPHECY = 'prophecy'                  // Ancient predictions
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
    corruption?: number;        // Min corruption level
    faction?: Faction;
    completedQuests?: string[];
  };
  effects?: {
    corruptionChange?: number;
    relationshipChange?: RelationshipChange;
    triggersEvent?: string;
  };
}

/**
 * Conditions for showing dialogue
 */
export interface DialogueCondition {
  type: 'corruption' | 'faction' | 'quest' | 'item' | 'reputation';
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
 * Quest objective types for cosmic quests
 */
export type CosmicObjectiveType =
  | 'investigate'      // Investigate a location
  | 'speak'           // Talk to NPC
  | 'find'            // Find item/location
  | 'survive'         // Survive encounter
  | 'defeat'          // Defeat enemy
  | 'collect'         // Collect items
  | 'witness'         // Experience a vision
  | 'choose'          // Make a choice
  | 'descend'         // Go deeper into The Scar
  | 'perform_ritual'  // Perform a ritual action
  | 'sacrifice';      // Sacrifice something

/**
 * Cosmic quest objective
 */
export interface CosmicObjective {
  id: string;
  type: CosmicObjectiveType;
  description: string;
  target?: string;              // Location, NPC, or item ID
  required: number;
  current: number;
  isOptional: boolean;
  corruptionOnComplete?: number;
  completionDialogue?: string;  // Dialogue ID when completed
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
  rewards: CosmicReward[];
  consequences: string[];       // Text descriptions
  worldEffects?: WorldEffect[];
  endingPath?: CosmicEnding;    // Which ending this leads toward
}

/**
 * Cosmic quest rewards
 */
export interface CosmicReward {
  type: 'gold' | 'xp' | 'item' | 'reputation' | 'artifact' | 'power' | 'knowledge';
  amount?: number;
  itemId?: string;
  artifactId?: string;          // Special cosmic artifacts
  powerId?: string;             // Supernatural abilities
  loreId?: string;              // Lore entries unlocked
  faction?: Faction;
}

/**
 * Complete cosmic quest definition
 */
export interface CosmicQuest {
  id: string;
  act: CosmicAct;
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
  corruptionMaximum?: number;   // Some quests lock if too corrupted

  // Objectives
  objectives: CosmicObjective[];

  // Horror elements
  sanityEvents: SanityEvent[];
  visions: Vision[];
  corruptionGain: number;       // Base corruption from quest
  atmosphericDescriptions: string[]; // Environmental flavor text

  // Rewards
  baseRewards: CosmicReward[];
  choiceRewards?: ChoiceReward[];

  // Consequences
  worldEffects?: WorldEffect[];
  relationshipChanges?: RelationshipChange[];

  // Metadata
  estimatedDuration: number;    // Estimated minutes to complete
  difficulty: 'normal' | 'hard' | 'very_hard' | 'extreme';
  canAbandon: boolean;
  createdAt?: Date;
}

/**
 * Character's progress through cosmic storyline
 */
export interface CosmicProgress {
  characterId: string;
  currentQuest?: string;        // Current active quest ID
  completedQuests: string[];    // All completed quest IDs
  currentAct: CosmicAct;

  // State tracking
  corruption: CorruptionState;
  discoveredLore: LoreEntry[];
  experiencedVisions: Vision[];
  journalEntries: JournalEntry[];

  // Path tracking
  majorChoices: {
    questId: string;
    choiceId: string;
    timestamp: Date;
  }[];
  endingPath?: CosmicEnding;    // Which ending player is heading toward

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
}

/**
 * Key NPCs in the cosmic storyline
 */
export enum CosmicNPC {
  THE_PROPHET = 'npc_cosmic_prophet',              // Mysterious guide
  CHIEF_FALLING_STAR = 'npc_cosmic_chief',         // Coalition elder
  DR_BLACKWOOD = 'npc_cosmic_blackwood',           // Mad scientist
  HIGH_PRIEST_EZEKIEL = 'npc_cosmic_ezekiel',      // Cult leader
  THE_SURVIVOR = 'npc_cosmic_survivor',            // Last expedition member
  THE_VOICE = 'npc_cosmic_voice',                  // Entity's herald
  MINER_MCGRAW = 'npc_cosmic_miner',              // Old prospector
  SERGEANT_HOLLOWAY = 'npc_cosmic_holloway',       // Military liaison
  PROFESSOR_DELGADO = 'npc_cosmic_delgado',        // University researcher
  SHAMAN_GRAY_WOLF = 'npc_cosmic_shaman'          // Spiritual guide
}

/**
 * Cosmic artifacts - special items from the storyline
 */
export interface CosmicArtifact {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'trinket' | 'tome' | 'relic';
  power: string;                // What it does
  corruptionCost: number;       // Corruption to use it
  obtainedFrom: string;         // Quest ID
  canBeDestroyed: boolean;
  stats?: {
    damage?: number;
    defense?: number;
    special?: string;
  };
}

/**
 * Cosmic powers - supernatural abilities gained
 */
export interface CosmicPower {
  id: string;
  name: string;
  description: string;
  effect: string;
  corruptionCost: number;       // Corruption to activate
  cooldown: number;             // Seconds between uses
  unlockQuest: string;          // Which quest unlocks it
  isPermanent: boolean;
  tier: 1 | 2 | 3;              // Power tier
}

/**
 * Ending outcome data
 */
export interface EndingOutcome {
  ending: CosmicEnding;
  characterId: string;
  finalCorruption: number;
  choicesMade: string[];        // Choice IDs that led here
  alliesGained: string[];       // NPC IDs
  alliesLost: string[];         // NPC IDs
  artifactsObtained: string[];  // Artifact IDs
  powersGained: string[];       // Power IDs
  worldChanges: WorldEffect[];
  epilogue: string;             // Ending narration
  achievedAt: Date;
}

/**
 * API Request/Response types
 */
export interface StartCosmicStorylineRequest {
  characterId: string;
}

export interface StartCosmicStorylineResponse {
  progress: CosmicProgress;
  firstQuest: CosmicQuest;
  message: string;
}

export interface GetCosmicProgressRequest {
  characterId: string;
}

export interface GetCosmicProgressResponse {
  progress: CosmicProgress;
  availableQuests: CosmicQuest[];
  currentQuest?: CosmicQuest;
}

export interface CompleteCosmicObjectiveRequest {
  characterId: string;
  questId: string;
  objectiveId: string;
  choiceId?: string;            // If objective involves a choice
}

export interface CompleteCosmicObjectiveResponse {
  objective: CosmicObjective;
  visionTriggered?: Vision;
  sanityEvent?: SanityEvent;
  corruptionGained: number;
  questCompleted: boolean;
  message: string;
}

export interface MakeCosmicChoiceRequest {
  characterId: string;
  questId: string;
  choiceId: string;
}

export interface MakeCosmicChoiceResponse {
  choice: ChoiceReward;
  corruptionChange: number;
  relationshipChanges: RelationshipChange[];
  worldEffects: WorldEffect[];
  endingPathUpdate?: CosmicEnding;
  message: string;
}

export interface CompleteCosmicQuestRequest {
  characterId: string;
  questId: string;
  finalChoice?: string;         // For quests with final choices
}

export interface CompleteCosmicQuestResponse {
  quest: CosmicQuest;
  rewards: CosmicReward[];
  corruptionGained: number;
  nextQuest?: CosmicQuest;
  actCompleted?: CosmicAct;
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

export interface GetCorruptionStateRequest {
  characterId: string;
}

export interface GetCorruptionStateResponse {
  corruption: CorruptionState;
  effects: CorruptionEffect[];
  warningLevel: 'safe' | 'warning' | 'danger' | 'critical';
  canBeReversed: boolean;
  reversalMethods: string[];
}

export interface TriggerEndingRequest {
  characterId: string;
  ending: CosmicEnding;
  finalChoices: string[];       // Choice IDs for ending
}

export interface TriggerEndingResponse {
  outcome: EndingOutcome;
  rewards: CosmicReward[];
  achievements: string[];       // Achievement IDs unlocked
  epilogue: string;
  message: string;
}
