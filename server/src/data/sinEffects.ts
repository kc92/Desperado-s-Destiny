/**
 * Sin Effects Data - Divine Struggle System - PRIMARY SOURCE
 *
 * Defines the specific effects at each sin level.
 * This is the canonical source for all sin effect data.
 *
 * For backwards compatibility with old code, see corruptionEffects.ts
 */

import { SinEffects, SinLevel } from '@desperados/shared';

/**
 * Sin level effects
 */
export const SIN_EFFECTS: SinEffects[] = [
  {
    level: SinLevel.PURE,
    sinRange: { min: 0, max: 20 },

    // No benefits
    damageBonus: 0,
    divineResistance: 0,
    spiritSight: false,
    faithManipulation: 0,

    // No penalties
    faithDrainMultiplier: 1.0,
    healingPenalty: 0,
    npcReactionPenalty: 0,
    damnationRisk: 0,

    appearance: 'Pure. Blessed by grace. The divine light shines upon you.',
    behaviorChanges: [],

    abilities: []
  },

  {
    level: SinLevel.TEMPTED,
    sinRange: { min: 21, max: 40 },

    // Minor benefits
    damageBonus: 5,
    divineResistance: 10,
    spiritSight: false,
    faithManipulation: 0,

    // Minor penalties
    faithDrainMultiplier: 1.1,
    healingPenalty: 5,
    npcReactionPenalty: -2,
    damnationRisk: 0,

    appearance: 'Your eyes occasionally reflect an inner fire. Something watches your soul. You hear whispers of temptation.',
    behaviorChanges: [
      'Occasional distant stares',
      'Drawn to forbidden things',
      'Dreams of power and glory'
    ],

    abilities: [
      'Sense nearby divine/demonic presence',
      'Minor resistance to spiritual attacks'
    ]
  },

  {
    level: SinLevel.STAINED,
    sinRange: { min: 41, max: 60 },

    // Significant benefits
    damageBonus: 10,
    divineResistance: 25,
    spiritSight: true,
    faithManipulation: 5,

    // Significant penalties
    faithDrainMultiplier: 1.25,
    healingPenalty: 15,
    npcReactionPenalty: -10,
    damnationRisk: 1,

    appearance: 'Faint marks appear on your skin like unholy sigils. Your shadow carries darkness. Your eyes hold dangerous depths.',
    behaviorChanges: [
      'Speak with unsettling conviction',
      'Move with predatory grace',
      'Know sins others try to hide',
      'Holy symbols cause discomfort',
      'Prayers feel hollow on your lips'
    ],

    abilities: [
      'See invisible spirits and demons',
      'Detect divine/demonic influences',
      'Minor reality manipulation (1/day)',
      'Understand demonic whispers'
    ]
  },

  {
    level: SinLevel.FALLEN,
    sinRange: { min: 61, max: 80 },

    // Major benefits
    damageBonus: 20,
    divineResistance: 50,
    spiritSight: true,
    faithManipulation: 15,

    // Major penalties
    faithDrainMultiplier: 1.5,
    healingPenalty: 30,
    npcReactionPenalty: -25,
    damnationRisk: 5,

    appearance: 'Strange symbols writhe beneath your flesh. Your voice carries echoes of something otherworldly. Your presence dims candles.',
    behaviorChanges: [
      'Speak in tongues occasionally',
      'Holy ground causes pain',
      'Churches refuse you entry',
      'Priests sense your corruption',
      'Children cry at your approach',
      'Dogs cower or growl',
      'Your blood runs darker than it should'
    ],

    abilities: [
      'Communicate with demons and dark spirits',
      'Bend fate in your favor',
      'Walk through shadows briefly',
      'See possible futures',
      'Summon minor infernal servants',
      'Reality manipulation (3/day)',
      'Resist blessed weapons partially'
    ]
  },

  {
    level: SinLevel.DAMNED,
    sinRange: { min: 81, max: 100 },

    // Immense benefits
    damageBonus: 35,
    divineResistance: 75,
    spiritSight: true,
    faithManipulation: 30,

    // Severe penalties
    faithDrainMultiplier: 2.0,
    healingPenalty: 50,
    npcReactionPenalty: -50,
    damnationRisk: 10,

    appearance: 'Your soul is visible in your eyes - and it is dark. Your form flickers with hellfire. You exist between salvation and damnation. Reality fears you.',
    behaviorChanges: [
      'Speak in the tongue of demons',
      'Your presence causes nightmares in others',
      'Holy symbols burn your skin',
      'Angels weep at your presence',
      'You exist partially in perdition',
      'People forget your face - replaced by dread',
      'You hunger for souls and suffering',
      'Your thoughts echo with demonic voices',
      'You remember the moment of your damnation',
      'Hell is preparing a place for you'
    ],

    abilities: [
      'Full communion with demonic entities',
      'Warp reality at will (unlimited)',
      'Shadow-walk long distances',
      'See all possible damnations',
      'Summon powerful demons',
      'Become partially incorporeal',
      'Drain life and faith from others',
      'Speak the Language of Hell',
      'Exist in multiple places simultaneously',
      'Begin transformation into a demon... or worse'
    ]
  }
];

/**
 * Get sin effects for a specific sin value
 */
export function getSinEffects(sin: number): SinEffects {
  const effects = SIN_EFFECTS.find(
    e => sin >= e.sinRange.min && sin <= e.sinRange.max
  );

  if (!effects) {
    // Default to DAMNED if somehow above 100
    return SIN_EFFECTS[SIN_EFFECTS.length - 1];
  }

  return effects;
}

/**
 * Visual descriptions for each sin level
 */
export const SIN_VISUAL_STAGES = {
  [SinLevel.PURE]: {
    eyes: 'Clear and bright with inner light',
    skin: 'Healthy, warm to touch',
    voice: 'Resonant and peaceful',
    shadow: 'Normal',
    aura: 'Faint sense of grace'
  },

  [SinLevel.TEMPTED]: {
    eyes: 'Occasionally reflect an inner fire',
    skin: 'Normal, but sometimes cold',
    voice: 'Slight edge of desire',
    shadow: 'Normal',
    aura: 'Faint temptation'
  },

  [SinLevel.STAINED]: {
    eyes: 'Dangerous depths, alluring',
    skin: 'Faint marks appear when stressed',
    voice: 'Carries whispers of power',
    shadow: 'Sometimes moves oddly',
    aura: 'Strong unease, animals wary'
  },

  [SinLevel.FALLEN]: {
    eyes: 'Glow faintly in darkness',
    skin: 'Faintly luminescent, symbols writhe beneath',
    voice: 'Echoes with otherworldly tones',
    shadow: 'Multiple shadows, demonic shapes',
    aura: 'Terror, NPCs hostile or fleeing'
  },

  [SinLevel.DAMNED]: {
    eyes: 'Hellfire burns within',
    skin: 'Flickers between forms, not quite solid',
    voice: 'Language of the Pit',
    shadow: 'Independent demon, reaching for souls',
    aura: 'Damnation, reality breaks nearby'
  }
};

/**
 * NPC reaction modifications by sin level
 */
export const NPC_SIN_REACTIONS = {
  [SinLevel.PURE]: {
    description: 'NPCs sense your purity and treat you with respect',
    priceModifier: 0.95,
    hostilityChance: 0,
    fleeChance: 0,
    refuseServiceChance: 0
  },

  [SinLevel.TEMPTED]: {
    description: 'NPCs sense something... off about you',
    priceModifier: 1.1,
    hostilityChance: 0,
    fleeChance: 0,
    refuseServiceChance: 0.05
  },

  [SinLevel.STAINED]: {
    description: 'NPCs are visibly uncomfortable, some refuse service',
    priceModifier: 1.3,
    hostilityChance: 0.1,
    fleeChance: 0.15,
    refuseServiceChance: 0.25
  },

  [SinLevel.FALLEN]: {
    description: 'NPCs fear you as one touched by darkness',
    priceModifier: 1.6,
    hostilityChance: 0.3,
    fleeChance: 0.5,
    refuseServiceChance: 0.6
  },

  [SinLevel.DAMNED]: {
    description: 'NPCs panic, attack, or lose their minds at your presence',
    priceModifier: 2.5,
    hostilityChance: 0.7,
    fleeChance: 0.85,
    refuseServiceChance: 0.95
  }
};

/**
 * Combat modifiers by sin level
 */
export const SIN_COMBAT_EFFECTS = {
  [SinLevel.PURE]: {
    damageMultiplier: 1.0,
    defenseMultiplier: 1.0,
    critChanceBonus: 0,
    demonicDamageBonus: 0
  },

  [SinLevel.TEMPTED]: {
    damageMultiplier: 1.05,
    defenseMultiplier: 0.98,
    critChanceBonus: 2,
    demonicDamageBonus: 5
  },

  [SinLevel.STAINED]: {
    damageMultiplier: 1.1,
    defenseMultiplier: 0.95,
    critChanceBonus: 5,
    demonicDamageBonus: 15
  },

  [SinLevel.FALLEN]: {
    damageMultiplier: 1.2,
    defenseMultiplier: 0.9,
    critChanceBonus: 10,
    demonicDamageBonus: 30
  },

  [SinLevel.DAMNED]: {
    damageMultiplier: 1.35,
    defenseMultiplier: 0.8,
    critChanceBonus: 20,
    demonicDamageBonus: 50
  }
};

// =============================================================================
// BACKWARDS COMPATIBILITY ALIASES
// =============================================================================

/** @deprecated Use SIN_EFFECTS */
export const CORRUPTION_EFFECTS = SIN_EFFECTS;

/** @deprecated Use getSinEffects */
export const getCorruptionEffects = getSinEffects;

/** @deprecated Use SIN_VISUAL_STAGES */
export const CORRUPTION_VISUAL_STAGES = SIN_VISUAL_STAGES;

/** @deprecated Use NPC_SIN_REACTIONS */
export const NPC_CORRUPTION_REACTIONS = NPC_SIN_REACTIONS;

/** @deprecated Use SIN_COMBAT_EFFECTS */
export const CORRUPTION_COMBAT_EFFECTS = SIN_COMBAT_EFFECTS;
