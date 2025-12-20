/**
 * Legendary Quest System Types
 * Epic multi-part quest chains for end-game players
 */

export type QuestTheme =
  | 'historical'
  | 'supernatural'
  | 'political'
  | 'treasure'
  | 'combat'
  | 'mystery';

export type QuestDifficulty = 'hard' | 'very hard' | 'legendary';

export type ChoiceType =
  | 'moral'
  | 'strategic'
  | 'faction'
  | 'sacrifice'
  | 'truth';

export type WorldEffectType =
  | 'faction_reputation'
  | 'npc_relationship'
  | 'location_unlock'
  | 'world_state'
  | 'quest_unlock'
  | 'quest_lock';

// Prerequisite types
export interface LevelPrerequisite {
  type: 'level';
  minLevel: number;
}

export interface QuestPrerequisite {
  type: 'quest';
  questId: string;
  completed: boolean;
}

export interface FactionPrerequisite {
  type: 'faction';
  faction: string;
  minReputation: number;
}

export interface ItemPrerequisite {
  type: 'item';
  itemId: string;
  quantity: number;
}

export type Prerequisite =
  | LevelPrerequisite
  | QuestPrerequisite
  | FactionPrerequisite
  | ItemPrerequisite;

// NPC Information
export interface NPCInfo {
  id: string;
  name: string;
  role: string;
  description: string;
  portrait?: string;
}

// Lore Entries
interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'legend' | 'myth' | 'truth' | 'mystery';
  unlockedBy?: string;
}

// Dialogue System
export interface DialogueOption {
  id: string;
  text: string;
  requirement?: Prerequisite;
  consequence?: LegendaryQuestWorldEffect;
  nextDialogueId?: string;
}

export interface Dialogue {
  id: string;
  npcId: string;
  text: string;
  options: DialogueOption[];
  emotionalTone?: 'friendly' | 'hostile' | 'neutral' | 'mysterious' | 'urgent';
}

// Objectives
export interface LocationObjective {
  type: 'location';
  description: string;
  locationId: string;
  coordinates?: { x: number; y: number };
}

export interface CombatObjective {
  type: 'combat';
  description: string;
  encounterId: string;
  mustSurvive?: boolean;
}

export interface ItemObjective {
  type: 'item';
  description: string;
  itemId: string;
  quantity: number;
}

export interface DialogueObjective {
  type: 'dialogue';
  description: string;
  npcId: string;
  dialogueId: string;
}

export interface InvestigationObjective {
  type: 'investigation';
  description: string;
  cluesRequired: string[];
  location?: string;
}

export interface PuzzleObjective {
  type: 'puzzle';
  description: string;
  puzzleId: string;
}

export type Objective =
  | LocationObjective
  | CombatObjective
  | ItemObjective
  | DialogueObjective
  | InvestigationObjective
  | PuzzleObjective;

// Combat Encounters
interface LegendaryQuestCombatEncounter {
  id: string;
  name: string;
  description: string;
  type: 'boss' | 'waves' | 'duel' | 'survival' | 'ambush';
  difficulty: number;

  enemies: {
    npcId: string;
    level: number;
    count: number;
    role?: 'boss' | 'elite' | 'minion';
  }[];

  waves?: number;
  duration?: number; // for survival
  specialRules?: string[];

  rewards: {
    experience: number;
    gold: number;
    items?: string[];
  };
}

// Puzzles
export interface TreasureMapPuzzle {
  type: 'treasure_map';
  mapImageUrl: string;
  clues: string[];
  correctLocation: { x: number; y: number };
  tolerance: number; // distance tolerance
}

export interface CipherPuzzle {
  type: 'cipher';
  encryptedText: string;
  cipherType: 'caesar' | 'substitution' | 'vigenere';
  hint?: string;
  solution: string;
}

export interface InformationPuzzle {
  type: 'information';
  question: string;
  npcsWithInfo: string[];
  correctAnswer: string;
  wrongAnswerConsequence?: string;
}

export interface EnvironmentalPuzzle {
  type: 'environmental';
  description: string;
  location: string;
  interactables: {
    id: string;
    description: string;
    correctOrder?: number;
  }[];
  solution: string[];
}

export type Puzzle =
  | TreasureMapPuzzle
  | CipherPuzzle
  | InformationPuzzle
  | EnvironmentalPuzzle;

// Moral Choices
export interface ChoiceOption {
  id: string;
  description: string;
  consequences: LegendaryQuestWorldEffect[];
  rewards?: LegendaryQuestReward[];
  moralAlignment?: 'lawful' | 'neutral' | 'chaotic';
}

export interface MoralChoice {
  id: string;
  situation: string;
  choiceType: ChoiceType;
  options: ChoiceOption[];
  timeLimit?: number; // seconds
  irreversible: boolean;
}

// World Effects
interface FactionReputationEffect {
  type: 'faction_reputation';
  faction: string;
  change: number;
  reason: string;
}

interface NPCRelationshipEffect {
  type: 'npc_relationship';
  npcId: string;
  change: number;
  relationship: 'friendly' | 'neutral' | 'hostile' | 'romantic' | 'rival';
}

interface LocationUnlockEffect {
  type: 'location_unlock';
  locationId: string;
  permanent: boolean;
}

interface WorldStateEffect {
  type: 'world_state';
  stateKey: string;
  newValue: any;
  description: string;
}

interface QuestAvailabilityEffect {
  type: 'quest_unlock' | 'quest_lock';
  questId: string;
  reason: string;
}

export type LegendaryQuestWorldEffect =
  | FactionReputationEffect
  | NPCRelationshipEffect
  | LocationUnlockEffect
  | WorldStateEffect
  | QuestAvailabilityEffect;

// Rewards
interface ExperienceReward {
  type: 'experience';
  amount: number;
}

interface DollarsReward {
  type: 'dollars';
  amount: number;
}

interface ItemReward {
  type: 'item';
  itemId: string;
  quantity: number;
  unique?: boolean;
}

interface TitleReward {
  type: 'title';
  titleId: string;
  titleName: string;
}

interface SkillPointReward {
  type: 'skill_points';
  amount: number;
}

interface PropertyReward {
  type: 'property';
  propertyId: string;
}

export type LegendaryQuestReward =
  | ExperienceReward
  | DollarsReward
  | ItemReward
  | TitleReward
  | SkillPointReward
  | PropertyReward;

export interface LegendaryQuestChoiceReward {
  choiceId: string;
  rewards: LegendaryQuestReward[];
}

// Unique Items
interface LegendaryUniqueItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'cosmetic' | 'mount' | 'utility';
  rarity: 'legendary' | 'mythic';
  stats?: Record<string, number>;
  specialAbility?: string;
  setBonus?: {
    setName: string;
    requiredPieces: number;
    bonus: string;
  };
}

// Chain Rewards
export interface ChainReward {
  milestone: number; // quest number
  description: string;
  rewards: LegendaryQuestReward[];
}

// Legendary Quest
export interface LegendaryQuest {
  id: string;
  chainId: string;
  questNumber: number;
  name: string;

  // Narrative
  briefing: string;
  loreEntries: LoreEntry[];
  dialogues: Dialogue[];

  // Objectives
  primaryObjectives: Objective[];
  optionalObjectives: Objective[];
  hiddenObjectives?: Objective[];

  // Challenges
  combatEncounters: LegendaryQuestCombatEncounter[];
  puzzles?: Puzzle[];
  moralChoices?: MoralChoice[];

  // Rewards
  questRewards: LegendaryQuestReward[];
  choiceRewards?: LegendaryQuestChoiceReward[];

  // Consequences
  worldEffects: LegendaryQuestWorldEffect[];

  // Completion text
  completionText: string;
}

// Legendary Quest Chain
export interface LegendaryQuestChain {
  id: string;
  name: string;
  description: string;
  theme: QuestTheme;

  // Requirements
  levelRange: [number, number];
  prerequisites: Prerequisite[];

  // Chain structure
  quests: LegendaryQuest[];
  totalQuests: number;

  // Narrative
  prologue: string;
  epilogue: string;
  majorNPCs: NPCInfo[];

  // Rewards
  chainRewards: ChainReward[];
  uniqueItems: LegendaryUniqueItem[];
  titleUnlocked: string;
  achievementId: string;

  // Tracking
  estimatedDuration: string;
  difficulty: QuestDifficulty;

  // Metadata
  icon?: string;
  bannerImage?: string;
  tags: string[];
}

// Player Progress Tracking
export interface QuestProgress {
  questId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;

  // Objective tracking
  completedObjectives: string[];
  currentObjective?: string;

  // Choice tracking
  choicesMade: Record<string, string>; // choiceId -> optionId

  // Puzzle progress
  puzzleProgress?: Record<string, any>;

  // Combat tracking
  encountersCompleted: string[];
}

export interface ChainProgress {
  chainId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;

  // Quest tracking
  currentQuestNumber: number;
  questProgresses: QuestProgress[];

  // Milestones
  milestonesReached: number[];

  // Statistics
  totalPlayTime: number; // seconds
  deathCount: number;
  choicesMade: Record<string, string>;

  // Rewards claimed
  rewardsClaimed: string[];
}

export interface LegendaryQuestPlayerData {
  characterId: string;

  // All chain progress
  chainProgresses: ChainProgress[];

  // Unlocks
  unlockedChains: string[];
  completedChains: string[];

  // Collections
  uniqueItemsObtained: string[];
  titlesUnlocked: string[];
  loreEntriesUnlocked: string[];

  // Statistics
  totalQuestsCompleted: number;
  totalPlayTime: number;
  legendaryAchievements: string[];
}

// API Response types
export interface GetChainResponse {
  chain: LegendaryQuestChain;
  progress?: ChainProgress;
  isUnlocked: boolean;
  canStart: boolean;
  missingPrerequisites?: string[];
}

export interface GetQuestResponse {
  quest: LegendaryQuest;
  progress: QuestProgress;
  chain: {
    id: string;
    name: string;
    questNumber: number;
    totalQuests: number;
  };
}

export interface StartChainResponse {
  success: boolean;
  chainProgress: ChainProgress;
  firstQuest: LegendaryQuest;
  message: string;
}

export interface CompleteObjectiveResponse {
  success: boolean;
  objective: Objective;
  questProgress: QuestProgress;
  rewards?: LegendaryQuestReward[];
  nextObjective?: Objective;
  questCompleted: boolean;
}

export interface MakeChoiceResponse {
  success: boolean;
  choice: MoralChoice;
  selectedOption: ChoiceOption;
  consequences: LegendaryQuestWorldEffect[];
  rewards: LegendaryQuestReward[];
  narrativeOutcome: string;
}

export interface CompleteQuestResponse {
  success: boolean;
  questProgress: QuestProgress;
  chainProgress: ChainProgress;
  rewards: LegendaryQuestReward[];
  nextQuest?: LegendaryQuest;
  chainCompleted: boolean;
  unlocks?: {
    items: LegendaryUniqueItem[];
    title?: string;
    achievement?: string;
  };
}
