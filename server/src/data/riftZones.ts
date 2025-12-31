/**
 * The Rift Zone Definitions - End-Game Zones (Level 30-40)
 *
 * Divine Struggle System - Defines the four major zones of The Rift region
 * This is a facade/alias for scarZones.ts (cosmic horror -> angels & demons rebrand)
 *
 * The Rift is where the barrier between mortal realm and the infernal/celestial
 * planes has been torn open by The Bound One's imprisonment.
 */

import { EndGameZone, ScarZone as RiftZone } from '@desperados/shared';

// Re-export original data for backward compatibility
export {
  OUTER_WASTE,
  TWISTED_LANDS,
  DEEP_SCAR,
  THE_ABYSS,
  SCAR_ZONES,
  getScarZone,
  getAccessibleZones,
  getNextZone
} from './scarZones';

// Import original data for aliasing
import {
  OUTER_WASTE,
  TWISTED_LANDS,
  DEEP_SCAR,
  THE_ABYSS,
  SCAR_ZONES,
  getScarZone,
  getAccessibleZones,
  getNextZone
} from './scarZones';

/**
 * Divine terminology aliases for zones
 */
export const BORDER_VEIL = OUTER_WASTE;
export const FALLEN_LANDS = TWISTED_LANDS;
export const DEEP_RIFT = DEEP_SCAR;
export const PERDITION = THE_ABYSS;

/**
 * Rift zones map
 */
export const RIFT_ZONES = SCAR_ZONES;

/**
 * Get rift zone by ID
 */
export const getRiftZone = getScarZone;

/**
 * Get accessible rift zones
 */
export const getAccessibleRiftZones = getAccessibleZones;

/**
 * Get next rift zone to unlock
 */
export const getNextRiftZone = getNextZone;

/**
 * Divine-themed zone descriptions
 */
export const RIFT_ZONE_DIVINE_LORE: Record<RiftZone, { divineName: string; divineLore: string }> = {
  [RiftZone.OUTER_WASTE]: {
    divineName: 'The Border Veil',
    divineLore: 'Where the veil between worlds grows thin. Here, the faithful can still hear the whispers of angels warning them to turn back. Demons lurk in the shadows, testing the resolve of those who venture near. Once fertile land blessed by The Gambler, now contested ground between heaven and hell.'
  },
  [RiftZone.TWISTED_LANDS]: {
    divineName: 'The Fallen Lands',
    divineLore: 'Territory claimed by fallen angels and lesser demons. Reality bends to their will - geometry defies divine law, and time moves according to infernal whims. Cultists who worship The Bound One established outposts here, believing the distortions grant "enlightenment." They serve demons now, if they retain any will at all.'
  },
  [RiftZone.DEEP_SCAR]: {
    divineName: 'The Deep Rift',
    divineLore: 'An impossible chasm where the barrier between mortal realm and hell has nearly collapsed. Ancient structures - temples of a forgotten age before The Bound One was imprisoned - rise from the depths. Here, powerful demons manifest freely, and only the strongest faith or most complete damnation allows survival.'
  },
  [RiftZone.THE_ABYSS]: {
    divineName: 'Perdition',
    divineLore: 'The bottom of The Rift. The threshold of hell itself. Here, The Bound One\'s presence is overwhelming - its prison walls visible to those with eyes to see. The Fallen Seraph, herald of The Bound One, walks freely in this place. Those who descend must choose: salvation through faith, or power through damnation.'
  }
};

/**
 * Divine enemy type mappings
 */
export const RIFT_ENEMY_TYPES = {
  // Outer Waste / Border Veil enemies
  corrupted_coyote: 'possessed_coyote',
  void_touched_snake: 'demon_serpent',
  twisted_scorpion: 'hellfire_scorpion',
  reality_touched_bandit: 'damned_bandit',
  corrupted_vulture: 'carrion_demon',

  // Twisted Lands / Fallen Lands enemies
  reality_shredder: 'reality_shredder', // Keep - still fits theme
  mind_flayer: 'soul_flayer',
  corrupted_cultist: 'infernal_cultist',
  void_touched_elk: 'demon_elk',
  phase_cougar: 'shadow_cougar',
  dream_stalker: 'nightmare_stalker',

  // Deep Scar / Deep Rift enemies
  void_walker: 'infernal_walker',
  corruption_elemental: 'sin_elemental',
  the_forgotten: 'the_forsaken',
  star_touched_buffalo: 'hellfire_buffalo',
  entity_spawn: 'demon_spawn',
  ancient_guardian: 'fallen_guardian',

  // The Abyss / Perdition enemies
  avatar_spawn: 'bound_one_spawn',
  herald_champion: 'seraph_champion',
  void_titan: 'infernal_titan',
  reality_eater: 'faith_eater',
  primordial_horror: 'ancient_demon'
};

/**
 * Terminology mapping reference:
 *
 * Old (Cosmic Horror)         ->  New (Divine Struggle)
 * ----------------------------------------------------------
 * The Scar                   ->  The Rift
 * Outer Waste                ->  Border Veil
 * Twisted Lands              ->  Fallen Lands
 * Deep Scar                  ->  Deep Rift
 * The Abyss                  ->  Perdition
 * Corruption                 ->  Sin / Demonic Influence
 * Reality Distortion         ->  Infernal Manifestation
 * Void                       ->  Hell / Infernal Realm
 * Entity                     ->  Demon / Fallen Angel
 * What-Waits-Below           ->  The Bound One
 */
