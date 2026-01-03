/**
 * DeckGames Constants
 * Configuration constants for the deck games system
 */

import { WagerConfig } from './types';

// =============================================================================
// WAGER TIER CONFIGURATION
// =============================================================================

export const WAGER_TIERS: Record<string, WagerConfig> = {
  low: {
    tier: 'low',
    minAmount: 10,
    maxAmount: 100,
    multiplier: 1.0,
    lossMultiplier: 1.0,
    unlockLevel: 1,
    houseEdge: 0.0
  },
  medium: {
    tier: 'medium',
    minAmount: 100,
    maxAmount: 500,
    multiplier: 2.0,
    lossMultiplier: 1.5,
    unlockLevel: 10,
    houseEdge: 0.02
  },
  high: {
    tier: 'high',
    minAmount: 500,
    maxAmount: 2000,
    multiplier: 5.0,
    lossMultiplier: 2.0,
    unlockLevel: 25,
    houseEdge: 0.05
  },
  vip: {
    tier: 'vip',
    minAmount: 2000,
    maxAmount: 10000,
    multiplier: 10.0,
    lossMultiplier: 3.0,
    unlockLevel: 50,
    houseEdge: 0.08
  }
};

// =============================================================================
// POKER HAND BONUSES
// =============================================================================

export const HAND_BONUS_DAMAGE: Record<string, number> = {
  'Royal Flush': 50,
  'Straight Flush': 40,
  'Four of a Kind': 35,
  'Full House': 30,
  'Flush': 25,
  'Straight': 20,
  'Three of a Kind': 15,
  'Two Pair': 10,
  'Pair': 5,
  'High Card': 0
};

// =============================================================================
// GAME THRESHOLDS
// =============================================================================

export const POKER_THRESHOLDS: Record<number, number> = {
  1: 100, // Pair
  2: 200, // Two Pair
  3: 300, // Three of a Kind
  4: 400, // Straight
  5: 500  // Flush
};

export const BLACKJACK_TARGETS: Record<number, number> = {
  1: 15,
  2: 17,
  3: 18,
  4: 19,
  5: 21
};

// =============================================================================
// MAX TURNS PER GAME TYPE
// =============================================================================

export const MAX_TURNS: Record<string, number> = {
  pokerHoldDraw: 3,
  pressYourLuck: 10,
  blackjack: 10,
  deckbuilder: 7,
  combatDuel: 20,
  default: 5
};

// =============================================================================
// GAME TYPE NAMES
// =============================================================================

export const GAME_TYPE_NAMES: Record<string, string> = {
  // Original 5 games
  pokerHoldDraw: 'Poker Hold/Draw',
  pressYourLuck: 'Press Your Luck',
  blackjack: 'Blackjack',
  deckbuilder: 'Deckbuilder',
  combatDuel: 'Combat Duel',
  // New card game expansion
  faro: 'Faro',
  threeCardMonte: 'Three-Card Monte',
  solitaireRace: 'Solitaire Race',
  texasHoldem: 'Texas Hold\'em',
  rummy: 'Rummy',
  warOfAttrition: 'War of Attrition',
  euchre: 'Euchre',
  cribbage: 'Cribbage'
};
