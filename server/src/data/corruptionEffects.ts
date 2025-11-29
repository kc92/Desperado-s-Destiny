/**
 * Corruption Effects Data - Phase 14, Wave 14.1
 *
 * Defines the specific effects at each corruption level
 */

import { CorruptionEffects, CorruptionLevel } from '@desperados/shared';

/**
 * Corruption level effects
 */
export const CORRUPTION_EFFECTS: CorruptionEffects[] = [
  {
    level: CorruptionLevel.CLEAN,
    corruptionRange: { min: 0, max: 20 },

    // No benefits
    damageBonus: 0,
    cosmicResistance: 0,
    voidSight: false,
    reality_manipulation: 0,

    // No penalties
    sanityDrainMultiplier: 1.0,
    healingPenalty: 0,
    npcReactionPenalty: 0,
    transformationRisk: 0,

    appearance: 'Normal. You look like yourself.',
    behaviorChanges: [],

    abilities: []
  },

  {
    level: CorruptionLevel.TOUCHED,
    corruptionRange: { min: 21, max: 40 },

    // Minor benefits
    damageBonus: 5,
    cosmicResistance: 10,
    voidSight: false,
    reality_manipulation: 0,

    // Minor penalties
    sanityDrainMultiplier: 1.1,
    healingPenalty: 5,
    npcReactionPenalty: -2,
    transformationRisk: 0,

    appearance: 'Your eyes occasionally reflect light strangely, like oil on water. Sometimes you hear whispers.',
    behaviorChanges: [
      'Occasional distant stares',
      'Slight hesitation in speech',
      'Dreams of impossible geometries'
    ],

    abilities: [
      'Sense nearby cosmic distortions',
      'Minor resistance to horror'
    ]
  },

  {
    level: CorruptionLevel.TAINTED,
    corruptionRange: { min: 41, max: 60 },

    // Significant benefits
    damageBonus: 10,
    cosmicResistance: 25,
    voidSight: true,
    reality_manipulation: 5,

    // Significant penalties
    sanityDrainMultiplier: 1.25,
    healingPenalty: 15,
    npcReactionPenalty: -10,
    transformationRisk: 1,

    appearance: 'Your veins occasionally pulse with darkness beneath your skin. Your shadow moves wrong. Your eyes have gained an unsettling depth.',
    behaviorChanges: [
      'Speak in patterns others find disturbing',
      'Move with unnatural grace',
      'Know things you should not know',
      'Animals avoid you',
      'Mirrors show you a moment delayed'
    ],

    abilities: [
      'See invisible cosmic entities',
      'Detect reality distortions',
      'Minor reality manipulation (1/day)',
      'Understand whispers from beyond'
    ]
  },

  {
    level: CorruptionLevel.CORRUPTED,
    corruptionRange: { min: 61, max: 80 },

    // Major benefits
    damageBonus: 20,
    cosmicResistance: 50,
    voidSight: true,
    reality_manipulation: 15,

    // Major penalties
    sanityDrainMultiplier: 1.5,
    healingPenalty: 30,
    npcReactionPenalty: -25,
    transformationRisk: 5,

    appearance: 'Your skin has taken on a faint luminescence. Strange symbols occasionally writhe beneath your flesh. Your voice carries harmonic overtones. Your pupils are wrong.',
    behaviorChanges: [
      'Speak backwards occasionally',
      'Cast no reflection in some mirrors',
      'Time moves differently around you',
      'Plants wither at your touch',
      'Children cry when they see you',
      'Dogs howl at your presence',
      'Your blood is darker than it should be'
    ],

    abilities: [
      'Communicate with cosmic entities',
      'Bend probability in your favor',
      'Walk through non-space briefly',
      'See past and future echoes',
      'Summon minor void creatures',
      'Reality manipulation (3/day)',
      'Resist normal weapons partially'
    ]
  },

  {
    level: CorruptionLevel.LOST,
    corruptionRange: { min: 81, max: 100 },

    // Immense benefits
    damageBonus: 35,
    cosmicResistance: 75,
    voidSight: true,
    reality_manipulation: 30,

    // Severe penalties
    sanityDrainMultiplier: 2.0,
    healingPenalty: 50,
    npcReactionPenalty: -50,
    transformationRisk: 10,

    appearance: 'You are barely human anymore. Your form flickers between states. Extra eyes open and close in your shadow. Your voice speaks in chorus. Reality bends around you.',
    behaviorChanges: [
      'Speak in languages that predate humanity',
      'Your presence causes hallucinations in others',
      'Time loops around you',
      'You cast shadows in directions light does not come from',
      'You exist partially in multiple realities',
      'People forget your face moments after seeing it',
      'You hunger for things beyond food',
      'Your thoughts are not entirely your own',
      'You remember futures that have not happened',
      'You are being Watched by Things Beyond'
    ],

    abilities: [
      'Full communion with cosmic entities',
      'Warp reality at will (unlimited)',
      'Void-walk long distances',
      'See all possible futures',
      'Summon major cosmic entities',
      'Become partially incorporeal',
      'Drain life and sanity from others',
      'Speak the Language of Creation',
      'Exist in multiple places simultaneously',
      'Begin transformation into something... else'
    ]
  }
];

/**
 * Get corruption effects for a specific corruption value
 */
export function getCorruptionEffects(corruption: number): CorruptionEffects {
  const effects = CORRUPTION_EFFECTS.find(
    e => corruption >= e.corruptionRange.min && corruption <= e.corruptionRange.max
  );

  if (!effects) {
    // Default to LOST if somehow above 100
    return CORRUPTION_EFFECTS[CORRUPTION_EFFECTS.length - 1];
  }

  return effects;
}

/**
 * Visual descriptions for each corruption level
 */
export const CORRUPTION_VISUAL_STAGES = {
  [CorruptionLevel.CLEAN]: {
    eyes: 'Normal',
    skin: 'Normal',
    voice: 'Normal',
    shadow: 'Normal',
    aura: 'None'
  },

  [CorruptionLevel.TOUCHED]: {
    eyes: 'Occasionally reflect light oddly',
    skin: 'Normal, but cold to touch',
    voice: 'Slight echo in quiet rooms',
    shadow: 'Normal',
    aura: 'Faint unease'
  },

  [CorruptionLevel.TAINTED]: {
    eyes: 'Too dark, too deep',
    skin: 'Veins pulse with darkness',
    voice: 'Carries whispers at the edge of hearing',
    shadow: 'Moves independently at times',
    aura: 'Strong unease, animals flee'
  },

  [CorruptionLevel.CORRUPTED]: {
    eyes: 'Wrong pupils, strange colors',
    skin: 'Faintly luminescent, symbols writhe beneath',
    voice: 'Harmonic overtones, speaks in chorus',
    shadow: 'Multiple shadows, extra limbs',
    aura: 'Terror, NPCs hostile or fleeing'
  },

  [CorruptionLevel.LOST]: {
    eyes: 'Too many, in wrong places',
    skin: 'Flickers between forms, not quite solid',
    voice: 'Language of Things Before Time',
    shadow: 'Independent entity, reaching',
    aura: 'Madness, reality breaks nearby'
  }
};

/**
 * NPC reaction modifications by corruption level
 */
export const NPC_CORRUPTION_REACTIONS = {
  [CorruptionLevel.CLEAN]: {
    description: 'NPCs treat you normally',
    priceModifier: 1.0,
    hostilityChance: 0,
    fleeChance: 0,
    refuseServiceChance: 0
  },

  [CorruptionLevel.TOUCHED]: {
    description: 'NPCs are slightly uneasy around you',
    priceModifier: 1.1,
    hostilityChance: 0,
    fleeChance: 0,
    refuseServiceChance: 0.05
  },

  [CorruptionLevel.TAINTED]: {
    description: 'NPCs are visibly uncomfortable, some refuse service',
    priceModifier: 1.3,
    hostilityChance: 0.1,
    fleeChance: 0.15,
    refuseServiceChance: 0.25
  },

  [CorruptionLevel.CORRUPTED]: {
    description: 'NPCs fear you, many flee on sight',
    priceModifier: 1.6,
    hostilityChance: 0.3,
    fleeChance: 0.5,
    refuseServiceChance: 0.6
  },

  [CorruptionLevel.LOST]: {
    description: 'NPCs panic, attack, or go mad at your presence',
    priceModifier: 2.5,
    hostilityChance: 0.7,
    fleeChance: 0.85,
    refuseServiceChance: 0.95
  }
};

/**
 * Combat modifiers by corruption level
 */
export const CORRUPTION_COMBAT_EFFECTS = {
  [CorruptionLevel.CLEAN]: {
    damageMultiplier: 1.0,
    defenseMultiplier: 1.0,
    critChanceBonus: 0,
    horrorDamageBonus: 0
  },

  [CorruptionLevel.TOUCHED]: {
    damageMultiplier: 1.05,
    defenseMultiplier: 0.98,
    critChanceBonus: 2,
    horrorDamageBonus: 5
  },

  [CorruptionLevel.TAINTED]: {
    damageMultiplier: 1.1,
    defenseMultiplier: 0.95,
    critChanceBonus: 5,
    horrorDamageBonus: 15
  },

  [CorruptionLevel.CORRUPTED]: {
    damageMultiplier: 1.2,
    defenseMultiplier: 0.9,
    critChanceBonus: 10,
    horrorDamageBonus: 30
  },

  [CorruptionLevel.LOST]: {
    damageMultiplier: 1.35,
    defenseMultiplier: 0.8,
    critChanceBonus: 20,
    horrorDamageBonus: 50
  }
};
