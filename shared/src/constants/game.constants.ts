/**
 * Game Constants - Core Game Configuration Values
 *
 * Central configuration for game mechanics in Desperados Destiny
 */

import { Faction } from '../types/character.types';

/**
 * Energy system constants
 */
export const ENERGY = {
  /** Maximum energy for free players */
  FREE_MAX: 150,
  /** Time in hours for free energy to fully regenerate */
  FREE_REGEN_TIME_HOURS: 5,
  /** Energy regenerated per hour for free players */
  FREE_REGEN_PER_HOUR: 150 / 5,

  /** Maximum energy for premium players */
  PREMIUM_MAX: 250,
  /** Time in hours for premium energy to fully regenerate */
  PREMIUM_REGEN_TIME_HOURS: 8,
  /** Energy regenerated per hour for premium players */
  PREMIUM_REGEN_PER_HOUR: 250 / 8,

  /** Energy cost for basic actions */
  BASIC_ACTION_COST: 5,
  /** Energy cost for challenge actions */
  CHALLENGE_ACTION_COST: 10,
  /** Energy cost for travel */
  TRAVEL_COST: 15
} as const;

/**
 * Character progression constants
 */
export const PROGRESSION = {
  /** Minimum character level */
  MIN_LEVEL: 1,
  /** Maximum character level */
  MAX_LEVEL: 50,
  /** Base experience needed for level 2 */
  BASE_EXPERIENCE: 100,
  /** Experience multiplier per level */
  EXPERIENCE_MULTIPLIER: 1.5,
  /** Maximum characters per account */
  MAX_CHARACTERS_PER_ACCOUNT: 3
} as const;

/**
 * Faction definitions with lore and starting locations
 */
export const FACTIONS = {
  [Faction.SETTLER_ALLIANCE]: {
    name: 'Settler Alliance',
    description: 'American settlers, prospectors, and corporate interests seeking fortune and expansion in the Sangre Territory. Values individualism, commerce, and manifest destiny.',
    startingLocation: 'Red Gulch',
    startingLocationId: '6501a0000000000000000001',
    culturalBonus: 'Craft',
    philosophy: 'Progress through industry and innovation'
  },
  [Faction.NAHI_COALITION]: {
    name: 'Nahi Coalition',
    description: 'Indigenous Nahi peoples united to defend their ancestral lands and way of life. Masters of the land and spiritual traditions.',
    startingLocation: 'Kaiowa Mesa',
    startingLocationId: '6501a0000000000000000004',
    culturalBonus: 'Spirit',
    philosophy: 'Harmony with the land and ancestors'
  },
  [Faction.FRONTERA]: {
    name: 'Frontera',
    description: 'Mexican frontera communities blending old world traditions with new world opportunities. Masters of survival and adaptation.',
    startingLocation: 'The Frontera',
    startingLocationId: '6501a0000000000000000002',
    culturalBonus: 'Cunning',
    philosophy: 'Survival through adaptability and cunning'
  }
} as const;

/**
 * Destiny Deck constants
 */
export const DESTINY_DECK = {
  /** Cards in a standard deck */
  DECK_SIZE: 52,
  /** Cards in a player's Destiny Deck */
  HAND_SIZE: 5,
  /** Cards drawn for a challenge */
  CHALLENGE_DRAW: 5,
  /** Maximum cards a player can hold */
  MAX_HAND_SIZE: 7
} as const;

/**
 * Challenge difficulty levels
 */
export const CHALLENGE_DIFFICULTY = {
  TRIVIAL: 1,
  EASY: 2,
  MODERATE: 3,
  CHALLENGING: 4,
  HARD: 5,
  VERY_HARD: 6,
  EXTREME: 7,
  LEGENDARY: 8,
  MYTHIC: 9,
  IMPOSSIBLE: 10
} as const;

/**
 * Location types
 */
export const LOCATION_TYPES = {
  SETTLEMENT: 'SETTLEMENT',
  WILDERNESS: 'WILDERNESS',
  DUNGEON: 'DUNGEON',
  LANDMARK: 'LANDMARK',
  TRANSIT: 'TRANSIT'
} as const;

/**
 * Action costs in energy
 */
export const ACTION_COSTS = {
  REST: 0,
  SOCIAL: 5,
  EXPLORE: 10,
  CHALLENGE: 10,
  COMBAT: 15,
  CRAFT: 10,
  TRAVEL: 15,
  QUEST: 20
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
} as const;
