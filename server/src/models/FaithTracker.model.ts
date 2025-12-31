/**
 * Faith Tracker Model - Divine Struggle System
 *
 * Tracks character faith, divine visions, spiritual wounds, and celestial resistance
 * This is a facade/alias for SanityTracker.model.ts (cosmic horror → angels & demons rebrand)
 *
 * The underlying MongoDB collection remains 'sanitytrackers' for backward compatibility.
 * All new code should use this file and the Faith terminology.
 */

// Re-export values from the original model with Faith terminology
export {
  SanityTracker as FaithTracker,
  SanityTracker, // Backward compatibility
  TRAUMA_DEFINITIONS as SPIRITUAL_WOUND_DEFINITIONS,
  TRAUMA_DEFINITIONS // Backward compatibility
} from './SanityTracker.model';

// Re-export types separately (required for isolatedModules)
export type {
  ISanityTracker as IFaithTracker,
  ISanityTracker, // Backward compatibility
} from './SanityTracker.model';

/**
 * Type mappings for divine terminology:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * Sanity                      →  Faith
 * SanityState                 →  FaithState
 * Hallucination               →  Divine Vision
 * Trauma                      →  Spiritual Wound
 * Horror Resistance           →  Spiritual Fortitude
 * Sanity Loss                 →  Faith Wavering
 * Horror Encounter            →  Celestial Encounter
 * Sanity Restoration          →  Faith Renewal
 */
