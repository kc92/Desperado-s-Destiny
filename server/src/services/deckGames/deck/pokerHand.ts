/**
 * Poker Hand Evaluation
 * Functions for evaluating poker hands and checking patterns
 */

import { Card, Rank } from '@desperados/shared';

/**
 * Check if cards form a straight
 */
export function checkStraight(cards: Card[]): boolean {
  const values = cards.map(c => {
    if (c.rank === Rank.ACE) return 14;
    if (c.rank === Rank.KING) return 13;
    if (c.rank === Rank.QUEEN) return 12;
    if (c.rank === Rank.JACK) return 11;
    return c.rank as number;
  }).sort((a, b) => a - b);

  let consecutive = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1] + 1) {
      consecutive++;
      if (consecutive >= 5) return true;
    } else if (values[i] !== values[i - 1]) {
      consecutive = 1;
    }
  }
  return false;
}

/**
 * Evaluate a poker hand and return its rank and score
 */
export function evaluatePokerHand(cards: Card[]): { handName: string; score: number } {
  // Count ranks and suits
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};

  cards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(c => c >= 5);
  const isStraight = checkStraight(cards);

  // Evaluate hand
  if (isFlush && isStraight) return { handName: 'Straight Flush', score: 800 };
  if (counts[0] === 4) return { handName: 'Four of a Kind', score: 700 };
  if (counts[0] === 3 && counts[1] === 2) return { handName: 'Full House', score: 600 };
  if (isFlush) return { handName: 'Flush', score: 500 };
  if (isStraight) return { handName: 'Straight', score: 400 };
  if (counts[0] === 3) return { handName: 'Three of a Kind', score: 300 };
  if (counts[0] === 2 && counts[1] === 2) return { handName: 'Two Pair', score: 200 };
  if (counts[0] === 2) return { handName: 'One Pair', score: 100 };
  return { handName: 'High Card', score: 50 };
}

/**
 * Count how many cards match the relevant suit
 */
export function countSuitMatches(hand: Card[], relevantSuit?: string): number {
  if (!relevantSuit) return 0;
  return hand.filter(card =>
    card.suit.toLowerCase() === relevantSuit.toLowerCase()
  ).length;
}

/**
 * Calculate suit bonus based on matches
 */
export function calculateSuitBonus(suitMatches: number): { multiplier: number; specialEffect?: string } {
  if (suitMatches >= 5) {
    return { multiplier: 2.0, specialEffect: 'Perfect Suit Mastery!' };
  } else if (suitMatches >= 4) {
    return { multiplier: 1.75, specialEffect: 'Excellent Suit Alignment' };
  } else if (suitMatches >= 3) {
    return { multiplier: 1.5, specialEffect: 'Strong Suit Bonus' };
  } else if (suitMatches >= 2) {
    return { multiplier: 1.25 };
  } else if (suitMatches >= 1) {
    return { multiplier: 1.1 };
  }
  return { multiplier: 1.0 };
}
