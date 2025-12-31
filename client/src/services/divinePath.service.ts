/**
 * Divine Path Service - Divine Struggle System
 *
 * API client for the Divine Quest and Divine Ending systems
 * This is a facade/alias for cosmic.service.ts (cosmic horror -> angels & demons rebrand)
 */

// api available but service delegates to cosmic.service

// Re-export everything from cosmic.service for backward compatibility
export {
  cosmicService,
  // Types
  type EndingType,
  type CorruptionLevel,
  type CosmicQuest,
  type CosmicObjective,
  type CosmicChoice,
  type CosmicReward,
  type CosmicProgress,
  type CorruptionState,
  type LoreEntry,
  type VisionEntry,
  type EndingPrediction,
  type EndingReward,
  type TriggerEndingResult,
  type StartStorylineResponse,
  type CompleteObjectiveResponse,
  type CompleteQuestResponse,
  type MakeChoiceResponse,
} from './cosmic.service';

// Import for aliasing
import { cosmicService } from './cosmic.service';
import type {
  EndingType,
  CosmicQuest,
  CosmicObjective,
  CosmicChoice,
  CosmicReward,
  CosmicProgress,
  CorruptionState,
  LoreEntry,
  VisionEntry,
  EndingPrediction,
  EndingReward,
  TriggerEndingResult,
  StartStorylineResponse,
  CompleteObjectiveResponse,
  CompleteQuestResponse,
  MakeChoiceResponse,
} from './cosmic.service';

// ===== Divine Terminology Type Aliases =====

export type DivineEndingType = 'salvation' | 'purification' | 'covenant' | 'ascension';
export type DivineQuest = CosmicQuest;
export type DivineObjective = CosmicObjective;
export type DivineChoice = CosmicChoice;
export type DivineReward = CosmicReward;
export type DivineProgress = CosmicProgress;
export type SinState = CorruptionState;
export type SacredLoreEntry = LoreEntry;
export type DivineVisionEntry = VisionEntry;

// ===== Ending Type Mappings =====

export const ENDING_TYPE_MAPPINGS = {
  // Old cosmic horror -> new divine struggle
  banishment: 'salvation',
  destruction: 'purification',
  bargain: 'covenant',
  awakening: 'ascension',
  // Reverse mapping
  salvation: 'banishment',
  purification: 'destruction',
  covenant: 'bargain',
  ascension: 'awakening',
} as const;

// ===== Divine Path Service =====

export const divinePathService = {
  // ===== Divine Quest Routes =====

  /**
   * Start the divine path questline (requires level 25)
   */
  async startDivineStoryline(): Promise<StartStorylineResponse> {
    return cosmicService.startStoryline();
  },

  /**
   * Get current divine path progress
   */
  async getDivineProgress(): Promise<DivineProgress> {
    return cosmicService.getProgress();
  },

  /**
   * Get available divine quests
   */
  async getAvailableDivineQuests(): Promise<DivineQuest[]> {
    return cosmicService.getAvailableQuests();
  },

  /**
   * Complete a quest objective
   */
  async completeDivineObjective(
    questId: string,
    objectiveId: string
  ): Promise<CompleteObjectiveResponse> {
    return cosmicService.completeObjective(questId, objectiveId);
  },

  /**
   * Complete a divine quest
   */
  async completeDivineQuest(questId: string): Promise<CompleteQuestResponse> {
    return cosmicService.completeQuest(questId);
  },

  /**
   * Make a major choice in the divine questline
   */
  async makeDivineChoice(questId: string, choiceId: string): Promise<MakeChoiceResponse> {
    return cosmicService.makeChoice(questId, choiceId);
  },

  /**
   * Get sin state from divine questline (corruption -> sin)
   */
  async getSinState(): Promise<SinState> {
    return cosmicService.getCorruptionState();
  },

  /**
   * Get discovered sacred lore
   */
  async getDiscoveredSacredLore(category?: string): Promise<SacredLoreEntry[]> {
    return cosmicService.getDiscoveredLore(category);
  },

  /**
   * Get experienced divine visions
   */
  async getDivineVisions(): Promise<DivineVisionEntry[]> {
    return cosmicService.getVisions();
  },

  // ===== Divine Ending Routes =====

  /**
   * Predict likely ending based on current choices
   */
  async predictDivineEnding(): Promise<EndingPrediction> {
    return cosmicService.predictEnding();
  },

  /**
   * Trigger a specific divine ending
   */
  async triggerDivineEnding(endingType: EndingType): Promise<TriggerEndingResult> {
    return cosmicService.triggerEnding(endingType);
  },

  /**
   * Get rewards for a specific divine ending type
   */
  async getDivineEndingRewards(endingType: EndingType): Promise<EndingReward> {
    return cosmicService.getEndingRewards(endingType);
  },

  // ===== Utility Methods =====

  /**
   * Convert cosmic horror ending type to divine struggle terminology
   */
  convertEndingToDiv: (cosmicEnding: EndingType): DivineEndingType => {
    const mapping: Record<EndingType, DivineEndingType> = {
      banishment: 'salvation',
      destruction: 'purification',
      bargain: 'covenant',
      awakening: 'ascension',
    };
    return mapping[cosmicEnding];
  },

  /**
   * Get divine ending description
   */
  getDivineEndingDescription: (endingType: DivineEndingType): string => {
    const descriptions: Record<DivineEndingType, string> = {
      salvation: 'Banish The Bound One back to hell through divine intervention. The Rift is sealed, and you become a Guardian of the faithful.',
      purification: 'Destroy The Bound One utterly through holy fire. The infernal threat ends, but at great cost to your own soul.',
      covenant: 'Strike a bargain with The Bound One. Gain forbidden power in exchange for... services. Walk the line between salvation and damnation.',
      ascension: 'Accept your role as The Bound One\'s vessel. Transcend humanity to become something more - or less - than mortal.',
    };
    return descriptions[endingType];
  },
};

// Default export
export default divinePathService;

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * Cosmic Quest               ->  Divine Quest
 * Cosmic Objective           ->  Divine Objective
 * Cosmic Choice              ->  Divine Choice
 * Corruption State           ->  Sin State
 * Lore Entry                 ->  Sacred Lore
 * Vision                     ->  Divine Vision
 * banishment ending          ->  salvation ending
 * destruction ending         ->  purification ending
 * bargain ending             ->  covenant ending
 * awakening ending           ->  ascension ending
 */
