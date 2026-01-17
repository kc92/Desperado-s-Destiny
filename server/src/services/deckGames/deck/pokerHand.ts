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

  // Check regular straight
  let consecutive = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1] + 1) {
      consecutive++;
      if (consecutive >= 5) return true;
    } else if (values[i] !== values[i - 1]) {
      consecutive = 1;
    }
  }

  // Check Ace-low straight (A-2-3-4-5 / wheel)
  const hasAce = values.includes(14);
  const hasLowCards = [2, 3, 4, 5].every(v => values.includes(v));
  if (hasAce && hasLowCards) return true;

  return false;
}

/**
 * Get numeric value for a rank (used for kicker calculations)
 */
function getRankValue(rank: string | Rank): number {
  if (rank === Rank.ACE || rank === 'A') return 14;
  if (rank === Rank.KING || rank === 'K') return 13;
  if (rank === Rank.QUEEN || rank === 'Q') return 12;
  if (rank === Rank.JACK || rank === 'J') return 11;
  return parseInt(rank as string, 10) || (rank as number);
}

/**
 * Calculate display score for poker hands
 * Uses simple, human-readable scoring (0-1000 range)
 * Base scores: High Card=50, Pair=100, Two Pair=200, etc.
 * Kickers add small bonuses within each hand type's range
 */
function calculateDisplayScore(base: number, primaryRanks: number[], kickers: number[]): number {
  let score = base;

  // Primary ranks contribute up to ~70 points (5 points per rank value for first, 3 for others)
  primaryRanks.forEach((rank, i) => {
    const weight = i === 0 ? 5 : 3;
    score += rank * weight;
  });

  // Kickers contribute smaller amounts (up to ~20 points total)
  kickers.slice(0, 2).forEach((rank, i) => {
    score += Math.floor(rank * (i === 0 ? 1 : 0.5));
  });

  return Math.round(score);
}

/**
 * Evaluate a poker hand and return its rank and score
 * Now includes kicker-based scoring for proper tie-breaking
 */
export function evaluatePokerHand(cards: Card[]): { handName: string; score: number } {
  // Count ranks and suits
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};

  cards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  // Sort ranks by count, then by value
  const sortedRanks = Object.entries(rankCounts)
    .map(([rank, count]) => ({ rank, value: getRankValue(rank), count }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  const counts = sortedRanks.map(r => r.count);
  const isFlush = Object.values(suitCounts).some(c => c >= 5);
  const isStraight = checkStraight(cards);

  // Get all card values sorted high to low
  const allValues = cards.map(c => getRankValue(c.rank)).sort((a, b) => b - a);

  // Evaluate hand with kickers
  if (isFlush && isStraight) {
    // Straight flush - high card determines winner
    return { handName: 'Straight Flush', score: calculateDisplayScore(800, [allValues[0]], []) };
  }

  if (counts[0] === 4) {
    // Four of a kind - quad rank + kicker
    const quadRank = sortedRanks[0].value;
    const kicker = sortedRanks.find(r => r.count !== 4)?.value || 0;
    return { handName: 'Four of a Kind', score: calculateDisplayScore(700, [quadRank], [kicker]) };
  }

  if (counts[0] === 3 && counts[1] >= 2) {
    // Full house - trips rank + pair rank
    const tripsRank = sortedRanks[0].value;
    const pairRank = sortedRanks[1].value;
    return { handName: 'Full House', score: calculateDisplayScore(600, [tripsRank, pairRank], []) };
  }

  if (isFlush) {
    // Flush - 5 highest cards in flush suit
    return { handName: 'Flush', score: calculateDisplayScore(500, allValues.slice(0, 5), []) };
  }

  if (isStraight) {
    // Straight - high card (Ace-low = 5 high)
    const hasAce = allValues.includes(14);
    const hasLowCards = [2, 3, 4, 5].every(v => allValues.includes(v));
    const highCard = (hasAce && hasLowCards && !allValues.includes(6)) ? 5 : allValues[0];
    return { handName: 'Straight', score: calculateDisplayScore(400, [highCard], []) };
  }

  if (counts[0] === 3) {
    // Three of a kind - trips rank + 2 kickers
    const tripsRank = sortedRanks[0].value;
    const kickers = sortedRanks.slice(1).map(r => r.value);
    return { handName: 'Three of a Kind', score: calculateDisplayScore(300, [tripsRank], kickers) };
  }

  if (counts[0] === 2 && counts[1] === 2) {
    // Two pair - both pair ranks + kicker
    const highPair = sortedRanks[0].value;
    const lowPair = sortedRanks[1].value;
    const kicker = sortedRanks.find(r => r.count === 1)?.value || 0;
    return { handName: 'Two Pair', score: calculateDisplayScore(200, [highPair, lowPair], [kicker]) };
  }

  if (counts[0] === 2) {
    // One pair - pair rank + 3 kickers
    const pairRank = sortedRanks[0].value;
    const kickers = sortedRanks.slice(1).map(r => r.value);
    return { handName: 'One Pair', score: calculateDisplayScore(100, [pairRank], kickers) };
  }

  // High card - all 5 cards matter
  return { handName: 'High Card', score: calculateDisplayScore(50, [], allValues.slice(0, 5)) };
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
