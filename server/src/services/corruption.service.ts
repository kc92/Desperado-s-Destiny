/**
 * Corruption Service - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from sin.service.ts using the old names
 * for backwards compatibility. New code should import from sin.service.ts.
 *
 * @deprecated Import from './sin.service' instead
 */

// =============================================================================
// RE-EXPORT ALL FROM SIN SERVICE WITH OLD NAMES
// =============================================================================

// Import everything from the primary source
import { SinService } from './sin.service';
import type { SinLevel, TormentType, TormentEffect, SacredKnowledgeType } from '@desperados/shared';
import type { ICharacterSin } from '../models/CharacterSin.model';

// Re-export main service with old name
export { SinService as CorruptionService };

// Also export with new name for transitional code
export { SinService };

// Type aliases for backwards compatibility
export type CorruptionLevel = SinLevel;
export type MadnessType = TormentType;
export type MadnessEffect = TormentEffect;
export type ForbiddenKnowledgeType = SacredKnowledgeType;
export type ICharacterCorruption = ICharacterSin;

/**
 * Method mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * CorruptionService           →  SinService
 * getOrCreateTracker()        →  getOrCreateTracker() (unchanged)
 * gainCorruption()            →  gainSin()
 * loseCorruption()            →  absolveSin()
 * handleDeath()               →  handleDeath() (unchanged)
 * applyScarExposure()         →  applyRiftExposure()
 * rollForMadness()            →  rollForTorment()
 * generateRandomMadness()     →  generateRandomTorment()
 * cureMadness()               →  cureTorment()
 * addPermanentMadness()       →  addPermanentTorment()
 * learnKnowledge()            →  learnSacredKnowledge()
 * learnRitual()               →  learnRitual() (unchanged)
 * encounterEntity()           →  encounterEntity() (unchanged)
 * checkTransformation()       →  checkDamnation()
 * getEffects()                →  getEffects() (unchanged)
 * calculateCombatModifiers()  →  calculateCombatModifiers() (unchanged)
 * calculateNPCReaction()      →  calculateNPCReaction() (unchanged)
 * generateCorruptionMessage() →  generateSinMessage()
 * getStatus()                 →  getStatus() (unchanged)
 *
 * Note: The old method names are NOT available on CorruptionService.
 * Code using old method names must be updated to use new names.
 * Example: CorruptionService.gainCorruption() → SinService.gainSin()
 */
