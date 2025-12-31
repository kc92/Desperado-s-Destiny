/**
 * Cosmic Horror Mechanics Types - BACKWARDS COMPATIBILITY
 *
 * This file now re-exports from divineStruggle.types.ts using the old names
 * for backwards compatibility. New code should import from divineStruggle.types.ts.
 *
 * @deprecated Import from './divineStruggle.types' instead
 */

// =============================================================================
// RE-EXPORT ALL TYPES FROM DIVINE STRUGGLE WITH OLD NAMES
// =============================================================================

// Import enums and values for const aliases
import {
  SinLevel,
  TormentType,
  SacredKnowledgeType,
  ManifestationType,
  CelestialEntityType,
  RitualType,
  DIVINE_STRUGGLE_CONSTANTS,
  getSinLevel,
  calculateSinPenalty
} from './divineStruggle.types';

// =============================================================================
// ENUM ALIASES (Old names -> New names)
// =============================================================================

/** @deprecated Use SinLevel from divineStruggle.types.ts */
export const CorruptionLevel = SinLevel;
export type CorruptionLevel = SinLevel;

/** @deprecated Use TormentType from divineStruggle.types.ts */
export const MadnessType = TormentType;
export type MadnessType = TormentType;

/** @deprecated Use SacredKnowledgeType from divineStruggle.types.ts */
export const ForbiddenKnowledgeType = SacredKnowledgeType;
export type ForbiddenKnowledgeType = SacredKnowledgeType;

/** @deprecated Use ManifestationType from divineStruggle.types.ts */
export const DistortionType = ManifestationType;
export type DistortionType = ManifestationType;

/** @deprecated Use CelestialEntityType from divineStruggle.types.ts */
export const CosmicEntityType = CelestialEntityType;
export type CosmicEntityType = CelestialEntityType;

// =============================================================================
// TYPE ALIASES (Old names -> New names)
// =============================================================================

/** @deprecated Use SinEffects from divineStruggle.types.ts */
export type { SinEffects as CorruptionEffects } from './divineStruggle.types';

/** @deprecated Use TormentEffect from divineStruggle.types.ts */
export type { TormentEffect as MadnessEffect } from './divineStruggle.types';

/** @deprecated Use DivineRelic from divineStruggle.types.ts */
export type { DivineRelic as EldritchArtifact } from './divineStruggle.types';

/** @deprecated Use DivineAbility from divineStruggle.types.ts */
export type { DivineAbility as EldritchAbility } from './divineStruggle.types';

/** @deprecated Use RelicPassiveEffect from divineStruggle.types.ts */
export type { RelicPassiveEffect as ArtifactPassiveEffect } from './divineStruggle.types';

/** @deprecated Use SacredScripture from divineStruggle.types.ts */
export type { SacredScripture as EldritchTome } from './divineStruggle.types';

/** @deprecated Use CharacterSin from divineStruggle.types.ts */
export type { CharacterSin as CharacterCorruption } from './divineStruggle.types';

/** @deprecated Use SinEvent from divineStruggle.types.ts */
export type { SinEvent as CorruptionEvent } from './divineStruggle.types';

/** @deprecated Use DivineIntervention from divineStruggle.types.ts */
export type { DivineIntervention as RealityDistortion } from './divineStruggle.types';

/** @deprecated Use CelestialEntity from divineStruggle.types.ts */
export type { CelestialEntity as CosmicEntity } from './divineStruggle.types';

/** @deprecated Use RiftInstance from divineStruggle.types.ts */
export type { RiftInstance as ScarInstance } from './divineStruggle.types';

// Re-export unchanged types
export type {
  PermanentCost,
  CurseEffect,
  Ritual,
  RitualComponent,
  RitualFailure,
  RitualResult,
  PresenceEffect,
  EntityBargain,
  ActiveRitual
} from './divineStruggle.types';

// Re-export RitualType enum as value (not just type)
export { RitualType };

// =============================================================================
// CONSTANT ALIASES
// =============================================================================

/** @deprecated Use DIVINE_STRUGGLE_CONSTANTS from divineStruggle.types.ts */
export const COSMIC_HORROR_CONSTANTS = {
  // Map old constant names to new values
  CORRUPTION_CLEAN_MAX: DIVINE_STRUGGLE_CONSTANTS.SIN_PURE_MAX,
  CORRUPTION_TOUCHED_MAX: DIVINE_STRUGGLE_CONSTANTS.SIN_TEMPTED_MAX,
  CORRUPTION_TAINTED_MAX: DIVINE_STRUGGLE_CONSTANTS.SIN_TAINTED_MAX,
  CORRUPTION_CORRUPTED_MAX: DIVINE_STRUGGLE_CONSTANTS.SIN_FALLEN_MAX,
  CORRUPTION_LOST_MAX: DIVINE_STRUGGLE_CONSTANTS.SIN_DAMNED_MAX,

  SCAR_BASE_CORRUPTION_PER_HOUR: DIVINE_STRUGGLE_CONSTANTS.RIFT_BASE_SIN_PER_HOUR,
  SCAR_DEEP_CORRUPTION_PER_HOUR: DIVINE_STRUGGLE_CONSTANTS.RIFT_DEEP_SIN_PER_HOUR,
  RITUAL_BASE_CORRUPTION: DIVINE_STRUGGLE_CONSTANTS.RITUAL_BASE_SIN,
  ARTIFACT_USE_CORRUPTION: DIVINE_STRUGGLE_CONSTANTS.RELIC_USE_SIN,
  ENTITY_ENCOUNTER_CORRUPTION: DIVINE_STRUGGLE_CONSTANTS.ENTITY_ENCOUNTER_SIN,
  TOME_READING_CORRUPTION: DIVINE_STRUGGLE_CONSTANTS.SCRIPTURE_READING_SIN,

  DEATH_CORRUPTION_RESET: DIVINE_STRUGGLE_CONSTANTS.DEATH_SIN_RESET,
  PURIFICATION_BASE_REDUCTION: DIVINE_STRUGGLE_CONSTANTS.ABSOLUTION_BASE_REDUCTION,
  MAX_DAILY_PURGE: DIVINE_STRUGGLE_CONSTANTS.MAX_DAILY_ABSOLUTION,

  MADNESS_CHANCE_PER_CORRUPTION_10: DIVINE_STRUGGLE_CONSTANTS.TORMENT_CHANCE_PER_SIN_10,
  MADNESS_DURATION_BASE: DIVINE_STRUGGLE_CONSTANTS.TORMENT_DURATION_BASE,
  MAX_ACTIVE_MADNESS: DIVINE_STRUGGLE_CONSTANTS.MAX_ACTIVE_TORMENTS,
  MADNESS_RESISTANCE_PER_EPISODE: DIVINE_STRUGGLE_CONSTANTS.TORMENT_RESISTANCE_PER_EPISODE,

  DISTORTION_BASE_CHANCE: DIVINE_STRUGGLE_CONSTANTS.INTERVENTION_BASE_CHANCE,
  DISTORTION_HIGH_CORRUPTION_CHANCE: DIVINE_STRUGGLE_CONSTANTS.INTERVENTION_HIGH_SIN_CHANCE,
  DISTORTION_DURATION_MIN: DIVINE_STRUGGLE_CONSTANTS.INTERVENTION_DURATION_MIN,
  DISTORTION_DURATION_MAX: DIVINE_STRUGGLE_CONSTANTS.INTERVENTION_DURATION_MAX,

  ENTITY_PRESENCE_GAIN_PER_HOUR: DIVINE_STRUGGLE_CONSTANTS.ENTITY_PRESENCE_GAIN_PER_HOUR,
  ENTITY_PRESENCE_RITUAL_BOOST: DIVINE_STRUGGLE_CONSTANTS.ENTITY_PRESENCE_RITUAL_BOOST,
  ENTITY_MANIFESTATION_THRESHOLD: DIVINE_STRUGGLE_CONSTANTS.ENTITY_MANIFESTATION_THRESHOLD,
  ENTITY_FULL_POWER_THRESHOLD: DIVINE_STRUGGLE_CONSTANTS.ENTITY_FULL_POWER_THRESHOLD,

  RITUAL_SUCCESS_BASE: DIVINE_STRUGGLE_CONSTANTS.RITUAL_SUCCESS_BASE,
  RITUAL_SUCCESS_PER_KNOWLEDGE: DIVINE_STRUGGLE_CONSTANTS.RITUAL_SUCCESS_PER_KNOWLEDGE,
  RITUAL_CRITICAL_CHANCE: DIVINE_STRUGGLE_CONSTANTS.RITUAL_CRITICAL_CHANCE,
  RITUAL_COOLDOWN_BASE: DIVINE_STRUGGLE_CONSTANTS.RITUAL_COOLDOWN_BASE,

  ARTIFACT_CURSE_TRIGGER_CHANCE: DIVINE_STRUGGLE_CONSTANTS.RELIC_CURSE_TRIGGER_CHANCE,
  ARTIFACT_REMOVAL_SANITY_COST: DIVINE_STRUGGLE_CONSTANTS.RELIC_REMOVAL_FAITH_COST,
  ARTIFACT_MAX_EQUIPPED: DIVINE_STRUGGLE_CONSTANTS.RELIC_MAX_EQUIPPED,

  KNOWLEDGE_MAX_PER_CHARACTER: DIVINE_STRUGGLE_CONSTANTS.KNOWLEDGE_MAX_PER_CHARACTER,
  TOME_READ_TIME_MIN: DIVINE_STRUGGLE_CONSTANTS.SCRIPTURE_READ_TIME_MIN,
  TOME_COMPREHENSION_CHECK: DIVINE_STRUGGLE_CONSTANTS.SCRIPTURE_COMPREHENSION_CHECK,

  NPC_FEAR_THRESHOLD_CORRUPTED: DIVINE_STRUGGLE_CONSTANTS.NPC_FEAR_THRESHOLD_FALLEN,
  NPC_FLEE_THRESHOLD_LOST: DIVINE_STRUGGLE_CONSTANTS.NPC_FLEE_THRESHOLD_DAMNED,
  NPC_ATTACK_THRESHOLD_LOST: DIVINE_STRUGGLE_CONSTANTS.NPC_ATTACK_THRESHOLD_DAMNED,

  TRANSFORMATION_ROLL_PER_DAY: DIVINE_STRUGGLE_CONSTANTS.DAMNATION_ROLL_PER_DAY,
  TRANSFORMATION_BASE_CHANCE_LOST: DIVINE_STRUGGLE_CONSTANTS.DAMNATION_BASE_CHANCE_DAMNED,
  TRANSFORMATION_IRREVERSIBLE: DIVINE_STRUGGLE_CONSTANTS.DAMNATION_IRREVERSIBLE,

  SCAR_ENTRY_COST: DIVINE_STRUGGLE_CONSTANTS.RIFT_ENTRY_COST,
  RITUAL_ENERGY_BASE: DIVINE_STRUGGLE_CONSTANTS.RITUAL_ENERGY_BASE,
  ARTIFACT_USE_ENERGY: DIVINE_STRUGGLE_CONSTANTS.RELIC_USE_ENERGY,
  ENTITY_BARGAIN_ENERGY: DIVINE_STRUGGLE_CONSTANTS.ENTITY_BARGAIN_ENERGY,

  PURIFICATION_COOLDOWN: DIVINE_STRUGGLE_CONSTANTS.ABSOLUTION_COOLDOWN,
  TOME_READ_COOLDOWN: DIVINE_STRUGGLE_CONSTANTS.SCRIPTURE_READ_COOLDOWN,
  ENTITY_CONTACT_COOLDOWN: DIVINE_STRUGGLE_CONSTANTS.ENTITY_CONTACT_COOLDOWN
};

// =============================================================================
// FUNCTION ALIASES
// =============================================================================

/** @deprecated Use getSinLevel from divineStruggle.types.ts */
export const getCorruptionLevel = getSinLevel;

/** @deprecated Use calculateSinPenalty from divineStruggle.types.ts */
export const calculateCorruptionPenalty = calculateSinPenalty;
