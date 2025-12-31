/**
 * Cosmic Story Types - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from divineStory.types.ts using the old names
 * for backwards compatibility. New code should import from divineStory.types.ts.
 *
 * @deprecated Import from './divineStory.types' instead
 */

// =============================================================================
// RE-EXPORT ALL TYPES FROM DIVINE STORY WITH OLD NAMES
// =============================================================================

// Import enums for const aliases
import {
  DivineAct,
  DivineEnding,
  DivineNPC,
  LoreCategory
} from './divineStory.types';

// Re-export Faction (unchanged)
export { Faction } from './character.types';

// Re-export types with aliases
export type {
  SinState as CorruptionState,
  SinEffect as CorruptionEffect,
  FaithEvent as SanityEvent,
  FaithChoice as SanityChoice,
  DivineObjectiveType as CosmicObjectiveType,
  DivineObjective as CosmicObjective,
  DivineReward as CosmicReward,
  DivineQuest as CosmicQuest,
  DivineProgress as CosmicProgress,
  DivineQuestRelic as CosmicArtifact,
  DivinePower as CosmicPower,
  Vision,
  LoreEntry,
  QuestDialogue,
  DialogueResponse,
  DialogueCondition,
  JournalEntry,
  RelationshipChange,
  WorldEffect,
  ChoiceReward,
  EndingOutcome,
  StartDivineStorylineRequest as StartCosmicStorylineRequest,
  StartDivineStorylineResponse as StartCosmicStorylineResponse,
  GetDivineProgressRequest as GetCosmicProgressRequest,
  GetDivineProgressResponse as GetCosmicProgressResponse,
  CompleteDivineObjectiveRequest as CompleteCosmicObjectiveRequest,
  CompleteDivineObjectiveResponse as CompleteCosmicObjectiveResponse,
  MakeDivineChoiceRequest as MakeCosmicChoiceRequest,
  MakeDivineChoiceResponse as MakeCosmicChoiceResponse,
  CompleteDivineQuestRequest as CompleteCosmicQuestRequest,
  CompleteDivineQuestResponse as CompleteCosmicQuestResponse,
  GetSinStateRequest as GetCorruptionStateRequest,
  GetSinStateResponse as GetCorruptionStateResponse,
  GetLoreEntriesRequest,
  GetLoreEntriesResponse,
  GetVisionsRequest,
  GetVisionsResponse,
  TriggerEndingRequest,
  TriggerEndingResponse
} from './divineStory.types';

// =============================================================================
// ENUM ALIASES (Old names -> New names)
// =============================================================================

/** @deprecated Use DivineAct from divineStory.types.ts */
export const CosmicAct = DivineAct;
export type CosmicAct = DivineAct;

/** @deprecated Use DivineEnding from divineStory.types.ts */
export const CosmicEnding = DivineEnding;
export type CosmicEnding = DivineEnding;

/** @deprecated Use DivineNPC from divineStory.types.ts */
export const CosmicNPC = DivineNPC;
export type CosmicNPC = DivineNPC;

// Re-export LoreCategory enum as value (not just type)
export { LoreCategory };
