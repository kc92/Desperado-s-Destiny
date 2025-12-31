/**
 * Character Corruption Model - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from CharacterSin.model.ts using the old names
 * for backwards compatibility. New code should import from CharacterSin.model.ts.
 *
 * @deprecated Import from './CharacterSin.model' instead
 */

// =============================================================================
// RE-EXPORT ALL FROM CHARACTER SIN MODEL WITH OLD NAMES
// =============================================================================

// Import everything from the primary source
import {
  CharacterSin,
  ICharacterSin,
  ICharacterSinModel
} from './CharacterSin.model';

// Re-export with old names
export { CharacterSin as CharacterCorruption };
export type ICharacterCorruption = ICharacterSin;
export type ICharacterCorruptionModel = ICharacterSinModel;

// Also export with new names for transitional code
export { CharacterSin };
export type { ICharacterSin, ICharacterSinModel };

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * CharacterCorruption         →  CharacterSin
 * ICharacterCorruption        →  ICharacterSin
 * ICharacterCorruptionModel   →  ICharacterSinModel
 * currentCorruption           →  currentSin
 * corruptionLevel             →  sinLevel
 * totalCorruptionGained       →  totalSinGained
 * totalCorruptionPurged       →  totalSinAbsolved
 * timeInScar                  →  timeInRift
 * lastScarEntry               →  lastRiftEntry
 * consecutiveDaysInScar       →  consecutiveDaysInRift
 * forbiddenKnowledge          →  sacredKnowledge
 * tomesRead                   →  scripturesRead
 * activeMadness               →  activeTorments
 * permanentMadness            →  permanentTorments
 * madnessResistance           →  tormentResistance
 * eldritchArtifacts           →  divineRelics
 * physicalMutations           →  physicalManifestations
 * npcFearLevel                →  npcReactionLevel
 * cosmicAwareness             →  divineAwareness
 * corruptionEvents            →  sinEvents
 * deathsToCorruption          →  deathsToSin
 * gainCorruption()            →  gainSin()
 * loseCorruption()            →  absolveSin()
 * calculateTransformationRisk →  calculateDamnationRisk()
 * canUseArtifact()            →  canUseRelic()
 * addPhysicalMutation()       →  addPhysicalManifestation()
 * updateCorruptionLevel()     →  updateSinLevel()
 * addCorruptionEvent()        →  addSinEvent()
 */
