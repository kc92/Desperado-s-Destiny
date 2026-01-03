/**
 * Card Values
 * Functions for calculating card values in different game contexts
 */

import { Card, Rank } from '@desperados/shared';

/**
 * Calculate card value for combat damage/defense
 * Face cards = 10, Ace = 11, Number cards = face value
 */
export function getCardCombatValue(card: Card): number {
  if (card.rank === Rank.ACE) return 11;
  if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) return 10;
  return card.rank as number;
}

/**
 * Calculate blackjack hand value
 * Handles ace as 11 or 1
 */
export function calculateBlackjackValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === Rank.ACE) {
      aces++;
      value += 11;
    } else if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
      value += 10;
    } else {
      value += card.rank as number;
    }
  }

  // Adjust aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

/**
 * Get card value for general calculations (Ace high)
 */
export function getCardValue(card: Card): number {
  if (card.rank === Rank.ACE) return 14;
  if (card.rank === Rank.KING) return 13;
  if (card.rank === Rank.QUEEN) return 12;
  if (card.rank === Rank.JACK) return 11;
  return card.rank as number;
}

/**
 * Get card value for cribbage (Ace low, face cards = 10)
 */
export function getCribbageValue(card: Card): number {
  if (card.rank === Rank.ACE) return 1;
  if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) return 10;
  return Math.min(10, card.rank as number);
}
