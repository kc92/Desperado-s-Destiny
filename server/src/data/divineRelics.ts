/**
 * Divine Relics Data - Divine Struggle System
 *
 * Blessed and cursed items of celestial and infernal origin
 * This is a facade/alias for eldritchArtifacts.ts (cosmic horror -> angels & demons rebrand)
 */

import { EldritchArtifact as DivineRelic, ForbiddenKnowledgeType as SacredKnowledgeType } from '@desperados/shared';

// Re-export original data for backward compatibility
export {
  ELDRITCH_ARTIFACTS,
  getArtifactById,
  getArtifactsForCorruption,
  getArtifactsByRarity
} from './eldritchArtifacts';

// Import original data for aliasing
import {
  ELDRITCH_ARTIFACTS,
  getArtifactById,
  getArtifactsForCorruption,
  getArtifactsByRarity
} from './eldritchArtifacts';

/**
 * Divine terminology aliases
 */
export const DIVINE_RELICS = ELDRITCH_ARTIFACTS;
export const getRelicById = getArtifactById;
export const getRelicsForSinLevel = getArtifactsForCorruption;
export const getRelicsByRarity = getArtifactsByRarity;

/**
 * Divine relic name mappings (cosmic horror -> divine struggle)
 */
export const RELIC_NAME_MAPPINGS: Record<string, { divineName: string; divineDescription: string }> = {
  void_crystal: {
    divineName: 'Hellfire Crystal',
    divineDescription: 'A perfectly black crystal that burns with cold infernal fire. It feels impossibly heavy and impossibly light at the same time. Forged in the depths of perdition.'
  },
  eye_of_the_deep: {
    divineName: 'Eye of The Bound One',
    divineDescription: 'An eye torn from a demon lord. It never blinks. It never stops watching. When held to your forehead, you see all sins ever committed.'
  },
  tongue_of_stars: {
    divineName: 'Tongue of the Seraphim',
    divineDescription: 'A silver amulet in the shape of a speaking mouth. Words of celestial power shimmer around it. It replaces your tongue - you speak truth, but cannot lie.'
  },
  heart_of_nothing: {
    divineName: 'Heart of Damnation',
    divineDescription: 'A crystallized heart that beats with no rhythm. When implanted, it replaces your heart. You become immortal. You become damned. You become a vessel.'
  },
  mask_of_faces: {
    divineName: 'Mask of the Deceiver',
    divineDescription: 'A pale mask showing no features. Worn by the demon of lies, it shows whatever face the viewer expects to see. You become everyone. You become no one.'
  },
  bone_flute: {
    divineName: 'Flute of Lost Souls',
    divineDescription: 'A flute carved from the bones of a fallen angel. Its music calls the damned from purgatory. They come. They dance. They remember their sins.'
  },
  clock_of_eternity: {
    divineName: 'Clock of Judgment',
    divineDescription: 'A pocket watch that ticks towards your final judgment. It shows you when you will die. The date gets closer every time you look. Time is borrowed, never given.'
  },
  lantern_of_souls: {
    divineName: 'Lantern of Purgatory',
    divineDescription: 'A lantern that burns with cold blue flame. The faces of the damned scream silently in the fire. It burns souls for fuel. Each flame was once a person.'
  },
  book_of_flesh: {
    divineName: 'Gospel of Flesh',
    divineDescription: 'A tome bound in the skin of heretics. It bleeds when opened. The pages are tattoed with forbidden rites. Each page is a condemned soul. Each word is a scream.'
  },
  mirror_of_truth: {
    divineName: 'Mirror of Judgment',
    divineDescription: 'A hand mirror that shows no reflection. Instead, it shows your true soul - every sin, every virtue. Look into it and see what heaven and hell see when they look at you.'
  },
  crown_of_whispers: {
    divineName: 'Crown of the Fallen',
    divineDescription: 'A circlet of tarnished silver worn by a fallen seraph. Voices of the damned whisper from it constantly. Every secret. Every sin. Every truth ever hidden.'
  },
  glove_of_reality: {
    divineName: 'Gauntlet of Annihilation',
    divineDescription: 'A black glove worn by the Destroyer. Things it touches are unmade - erased from existence, from memory, from God\'s plan. Use it, and you begin to fade as well.'
  }
};

/**
 * Relic rarity divine names
 */
export const RELIC_RARITY_DIVINE_NAMES = {
  cursed: 'Condemned',
  'void-touched': 'Hell-Touched',
  abyssal: 'Infernal',
  'star-forged': 'Heaven-Forged',
  damned: 'Damned'
};

/**
 * Sacred knowledge type mappings (forbidden knowledge -> sacred knowledge)
 */
export const SACRED_KNOWLEDGE_MAPPINGS = {
  [SacredKnowledgeType.VOID_SPEECH]: 'Infernal Tongue',
  [SacredKnowledgeType.SOUL_SIGHT]: 'Soul Sight',
  [SacredKnowledgeType.REALITY_SHAPING]: 'Divine Shaping',
  [SacredKnowledgeType.TIME_SIGHT]: 'Prophetic Vision',
  [SacredKnowledgeType.BLOOD_MAGIC]: 'Blood Covenant',
  [SacredKnowledgeType.VOID_WALKING]: 'Hell Walking'
};

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * Eldritch Artifact          ->  Divine Relic
 * Forbidden Knowledge        ->  Sacred Knowledge
 * Void                       ->  Hell / Infernal
 * Cosmic                     ->  Divine / Celestial
 * Madness                    ->  Damnation
 * Sanity Loss                ->  Faith Loss
 * Corruption                 ->  Sin
 * Entity                     ->  Demon / Fallen Angel
 * Horror                     ->  Divine Terror
 */
