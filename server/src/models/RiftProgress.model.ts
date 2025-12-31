/**
 * Rift Progress Model - Divine Struggle System
 *
 * Tracks end-game content progress, zone access, and divine challenges in The Rift
 * This is a facade/alias for ScarProgress.model.ts (cosmic horror → angels & demons rebrand)
 *
 * The underlying MongoDB collection remains 'scarprogresses' for backward compatibility.
 * All new code should use this file and the Rift terminology.
 */

// Re-export values from the original model with Rift terminology
export {
  ScarProgressModel as RiftProgressModel,
  ScarProgressModel, // Backward compatibility
} from './ScarProgress.model';

// Re-export types separately (required for isolatedModules)
export type {
  ScarProgressDocument as RiftProgressDocument,
  ScarProgressDocument // Backward compatibility
} from './ScarProgress.model';

/**
 * Type mappings for divine terminology:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * The Scar                    →  The Rift
 * Scar Progress               →  Rift Progress
 * Scar Zone                   →  Rift Zone
 * Corruption Ability          →  Sin Ability
 * Corruption Mastery          →  Sin Mastery
 * Elite Enemy                 →  Demon/Fallen Angel
 * Sanity Lost                 →  Faith Lost
 */
