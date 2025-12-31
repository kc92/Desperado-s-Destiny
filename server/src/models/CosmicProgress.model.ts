/**
 * Cosmic Progress Model - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from DivineProgress.model.ts using the old names
 * for backwards compatibility. New code should import from DivineProgress.model.ts.
 *
 * @deprecated Import from './DivineProgress.model' instead
 */

// =============================================================================
// RE-EXPORT ALL FROM DIVINE PROGRESS MODEL WITH OLD NAMES
// =============================================================================

// Import everything from the primary source
import {
  DivineProgress,
  IDivineProgress,
  IDivineProgressModel,
  ISinState,
  IMajorChoice,
  INPCRelationship,
  IJournalEntry
} from './DivineProgress.model';

// Re-export with old names
export { DivineProgress as CosmicProgress };
export type ICosmicProgress = IDivineProgress;
export type ICosmicProgressModel = IDivineProgressModel;
export type ICorruptionState = ISinState;

// Also export with new names for transitional code
export { DivineProgress };
export type {
  IDivineProgress,
  IDivineProgressModel,
  ISinState,
  IMajorChoice,
  INPCRelationship,
  IJournalEntry
};

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * CosmicProgress              →  DivineProgress
 * ICosmicProgress             →  IDivineProgress
 * ICosmicProgressModel        →  IDivineProgressModel
 * CosmicAct                   →  DivineAct
 * corruption                  →  sinState
 * ICorruptionState            →  ISinState
 * addCorruption()             →  addSin()
 */
