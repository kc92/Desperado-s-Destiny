/**
 * Shooting Target Definitions
 * Predefined targets for shooting contests
 */

import type { Target, HitZone, BULLSEYE_ZONES } from '@desperados/shared';

/**
 * STANDARD HIT ZONES
 */

export const BULLSEYE_HIT_ZONES: HitZone[] = [
  { name: 'Bullseye', pointValue: 100, difficulty: 0.4 },
  { name: 'Inner Ring', pointValue: 75, difficulty: 0.7 },
  { name: 'Middle Ring', pointValue: 50, difficulty: 1.0 },
  { name: 'Outer Ring', pointValue: 25, difficulty: 1.3 }
];

export const SIMPLE_HIT_ZONES: HitZone[] = [
  { name: 'Hit', pointValue: 100, difficulty: 1.0 }
];

export const SILHOUETTE_HIT_ZONES: HitZone[] = [
  { name: 'Head', pointValue: 150, difficulty: 0.3 },
  { name: 'Torso', pointValue: 100, difficulty: 0.8 },
  { name: 'Arms/Legs', pointValue: 50, difficulty: 1.2 }
];

/**
 * TARGET SHOOTING TARGETS
 */

export const TARGET_SHOOTING_CLOSE: Target = {
  id: 'bullseye_50ft',
  type: 'bullseye',
  distance: 50,
  size: 'large',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Standard bullseye target at 50 feet'
};

export const TARGET_SHOOTING_MEDIUM: Target = {
  id: 'bullseye_100ft',
  type: 'bullseye',
  distance: 100,
  size: 'medium',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Standard bullseye target at 100 feet'
};

export const TARGET_SHOOTING_LONG: Target = {
  id: 'bullseye_200ft',
  type: 'bullseye',
  distance: 200,
  size: 'small',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Standard bullseye target at 200 feet'
};

/**
 * QUICK DRAW TARGETS
 */

export const QUICK_DRAW_SILHOUETTE: Target = {
  id: 'silhouette_25ft',
  type: 'silhouette',
  distance: 25,
  size: 'large',
  movement: 'stationary',
  pointValue: 100,
  hitZones: SILHOUETTE_HIT_ZONES,
  description: 'Human silhouette at 25 feet - draw and fire!'
};

export const QUICK_DRAW_DUELING: Target = {
  id: 'wax_dummy_30ft',
  type: 'wax_dummy',
  distance: 30,
  size: 'large',
  movement: 'stationary',
  pointValue: 100,
  hitZones: SILHOUETTE_HIT_ZONES,
  description: 'Wax practice dummy at 30 feet for exhibition dueling'
};

/**
 * TRICK SHOOTING TARGETS
 */

export const TRICK_BOTTLE: Target = {
  id: 'bottle_50ft',
  type: 'bottle',
  distance: 50,
  size: 'small',
  movement: 'stationary',
  pointValue: 75,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Glass bottle perched on a fence post'
};

export const TRICK_COIN_TOSS: Target = {
  id: 'coin_toss_40ft',
  type: 'coin',
  distance: 40,
  size: 'small',
  movement: 'arc',
  pointValue: 150,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Silver dollar tossed in the air - hit it on the way up!'
};

export const TRICK_CARD_EDGE: Target = {
  id: 'card_edge_30ft',
  type: 'card',
  distance: 30,
  size: 'small',
  movement: 'stationary',
  pointValue: 200,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Playing card edge - split it down the middle!'
};

export const TRICK_APPLE_SHOT: Target = {
  id: 'apple_60ft',
  type: 'apple',
  distance: 60,
  size: 'small',
  movement: 'stationary',
  pointValue: 125,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Apple balanced on a wooden post'
};

export const TRICK_MOVING_TARGET: Target = {
  id: 'moving_bottle_40ft',
  type: 'moving_target',
  distance: 40,
  size: 'small',
  movement: 'linear',
  pointValue: 150,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Bottle moving on a rail - timing is everything'
};

export const TRICK_PENDULUM: Target = {
  id: 'pendulum_can_50ft',
  type: 'moving_target',
  distance: 50,
  size: 'small',
  movement: 'pendulum',
  pointValue: 175,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Tin can swinging on a rope - catch it at the peak!'
};

/**
 * SKEET SHOOTING TARGETS
 */

export const SKEET_STRAIGHT: Target = {
  id: 'clay_straight_50ft',
  type: 'clay_pigeon',
  distance: 50,
  size: 'small',
  movement: 'linear',
  pointValue: 100,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Clay pigeon flying straight away'
};

export const SKEET_CROSSING: Target = {
  id: 'clay_crossing_60ft',
  type: 'clay_pigeon',
  distance: 60,
  size: 'small',
  movement: 'linear',
  pointValue: 125,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Clay pigeon crossing left to right'
};

export const SKEET_HIGH: Target = {
  id: 'clay_high_70ft',
  type: 'clay_pigeon',
  distance: 70,
  size: 'small',
  movement: 'arc',
  pointValue: 150,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'High clay pigeon launched at steep angle'
};

export const SKEET_DOUBLE: Target = {
  id: 'clay_double_50ft',
  type: 'clay_pigeon',
  distance: 50,
  size: 'small',
  movement: 'random',
  pointValue: 175,
  hitZones: SIMPLE_HIT_ZONES,
  description: 'Two clay pigeons launched simultaneously'
};

/**
 * LONG RANGE TARGETS
 */

export const LONG_RANGE_500: Target = {
  id: 'bullseye_500ft',
  type: 'bullseye',
  distance: 500,
  size: 'medium',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Distant target at 500 feet - account for bullet drop'
};

export const LONG_RANGE_800: Target = {
  id: 'bullseye_800ft',
  type: 'bullseye',
  distance: 800,
  size: 'small',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Extreme distance target at 800 feet - wind is a factor'
};

export const LONG_RANGE_1000: Target = {
  id: 'bullseye_1000ft',
  type: 'bullseye',
  distance: 1000,
  size: 'small',
  movement: 'stationary',
  pointValue: 100,
  hitZones: BULLSEYE_HIT_ZONES,
  description: 'Championship distance - 1000 feet of pure skill'
};

export const LONG_RANGE_SILHOUETTE: Target = {
  id: 'silhouette_600ft',
  type: 'silhouette',
  distance: 600,
  size: 'medium',
  movement: 'stationary',
  pointValue: 100,
  hitZones: SILHOUETTE_HIT_ZONES,
  description: 'Man-sized target at 600 feet'
};

/**
 * DUELING TARGETS (Non-lethal)
 */

export const DUELING_STANDARD: Target = {
  id: 'wax_dummy_30ft_duel',
  type: 'wax_dummy',
  distance: 30,
  size: 'large',
  movement: 'stationary',
  pointValue: 100,
  hitZones: SILHOUETTE_HIT_ZONES,
  description: 'Standard dueling distance with wax bullets'
};

export const DUELING_CLOSE: Target = {
  id: 'wax_dummy_20ft_duel',
  type: 'wax_dummy',
  distance: 20,
  size: 'large',
  movement: 'stationary',
  pointValue: 100,
  hitZones: SILHOUETTE_HIT_ZONES,
  description: 'Close quarters exhibition duel'
};

/**
 * TARGET SETS BY CONTEST TYPE
 */

export const TARGET_SETS = {
  target_shooting: {
    qualification: [TARGET_SHOOTING_CLOSE, TARGET_SHOOTING_MEDIUM],
    semifinals: [TARGET_SHOOTING_MEDIUM, TARGET_SHOOTING_LONG],
    finals: [TARGET_SHOOTING_LONG, TARGET_SHOOTING_LONG, TARGET_SHOOTING_MEDIUM]
  },

  quick_draw: {
    qualification: [QUICK_DRAW_SILHOUETTE],
    semifinals: [QUICK_DRAW_SILHOUETTE],
    finals: [QUICK_DRAW_DUELING]
  },

  trick_shooting: {
    qualification: [TRICK_BOTTLE, TRICK_APPLE_SHOT],
    semifinals: [TRICK_COIN_TOSS, TRICK_MOVING_TARGET],
    finals: [TRICK_CARD_EDGE, TRICK_PENDULUM, TRICK_COIN_TOSS]
  },

  skeet_shooting: {
    qualification: [SKEET_STRAIGHT, SKEET_STRAIGHT],
    semifinals: [SKEET_CROSSING, SKEET_HIGH],
    finals: [SKEET_DOUBLE, SKEET_HIGH, SKEET_CROSSING]
  },

  long_range: {
    qualification: [LONG_RANGE_500],
    semifinals: [LONG_RANGE_800],
    finals: [LONG_RANGE_1000]
  },

  dueling: {
    qualification: [DUELING_STANDARD],
    semifinals: [DUELING_STANDARD],
    finals: [DUELING_CLOSE]
  }
};

/**
 * SIZE MODIFIERS
 */
export const SIZE_MODIFIERS = {
  small: -20,    // -20% to hit
  medium: 0,     // No modifier
  large: 10      // +10% to hit
};

/**
 * MOVEMENT PENALTIES
 */
export const MOVEMENT_PENALTIES = {
  stationary: 0,
  linear: -15,
  pendulum: -25,
  random: -35,
  arc: -30
};
