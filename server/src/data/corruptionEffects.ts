/**
 * Corruption Effects Data - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from sinEffects.ts using the old names
 * for backwards compatibility. New code should import from sinEffects.ts.
 *
 * @deprecated Import from './sinEffects' instead
 */

// =============================================================================
// RE-EXPORT ALL FROM SIN EFFECTS WITH OLD NAMES
// =============================================================================

// Import everything from the primary source
import {
  SIN_EFFECTS,
  getSinEffects,
  SIN_VISUAL_STAGES,
  NPC_SIN_REACTIONS,
  SIN_COMBAT_EFFECTS
} from './sinEffects';

// Re-export with old names
export { SIN_EFFECTS as CORRUPTION_EFFECTS };
export { getSinEffects as getCorruptionEffects };
export { SIN_VISUAL_STAGES as CORRUPTION_VISUAL_STAGES };
export { NPC_SIN_REACTIONS as NPC_CORRUPTION_REACTIONS };
export { SIN_COMBAT_EFFECTS as CORRUPTION_COMBAT_EFFECTS };

// Also export with new names for transitional code
export {
  SIN_EFFECTS,
  getSinEffects,
  SIN_VISUAL_STAGES,
  NPC_SIN_REACTIONS,
  SIN_COMBAT_EFFECTS
};

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * CORRUPTION_EFFECTS          →  SIN_EFFECTS
 * getCorruptionEffects()      →  getSinEffects()
 * CORRUPTION_VISUAL_STAGES    →  SIN_VISUAL_STAGES
 * NPC_CORRUPTION_REACTIONS    →  NPC_SIN_REACTIONS
 * CORRUPTION_COMBAT_EFFECTS   →  SIN_COMBAT_EFFECTS
 * CorruptionEffects           →  SinEffects
 * CorruptionLevel.CLEAN       →  SinLevel.PURE
 * CorruptionLevel.TOUCHED     →  SinLevel.TEMPTED
 * CorruptionLevel.TAINTED     →  SinLevel.STAINED
 * CorruptionLevel.CORRUPTED   →  SinLevel.FALLEN
 * CorruptionLevel.LOST        →  SinLevel.DAMNED
 * corruptionRange             →  sinRange
 */
