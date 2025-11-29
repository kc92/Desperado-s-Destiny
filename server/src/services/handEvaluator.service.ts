/**
 * Hand Evaluator Service
 * Evaluates and ranks poker hands for all variants
 */

import type { PokerCard, PokerRank, PokerSuit, PokerHandRank } from '@desperados/shared';
import { POKER_HAND_NAMES } from '@desperados/shared';

/**
 * Rank values for comparison
 */
const RANK_VALUES: Record<PokerRank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
};

/**
 * Hand evaluation result
 */
export interface HandEvaluation {
  rank: PokerHandRank;
  description: string;
  bestCards: PokerCard[];
  tiebreakers: number[]; // High card values for breaking ties
}

/**
 * Evaluate a 5-card poker hand
 */
export function evaluateHand(cards: PokerCard[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  // Sort cards by rank (descending)
  const sorted = [...cards].sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank]);

  // Check for flush
  const isFlush = sorted.every(card => card.suit === sorted[0].suit);

  // Check for straight
  const { isStraight, highCard: straightHigh } = checkStraight(sorted);

  // Count ranks
  const rankCounts = countRanks(sorted);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  const uniqueRanks = rankCounts.size;

  // Royal Flush
  if (isFlush && isStraight && straightHigh === 14) {
    return {
      rank: 1, // HandRank.ROYAL_FLUSH
      description: 'Royal Flush',
      bestCards: sorted,
      tiebreakers: [14]
    };
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return {
      rank: 2, // HandRank.STRAIGHT_FLUSH
      description: `Straight Flush, ${RANK_VALUES[sorted[0].rank]} high`,
      bestCards: sorted,
      tiebreakers: [straightHigh]
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const quadRank = findRankWithCount(rankCounts, 4);
    const kicker = findRankWithCount(rankCounts, 1);
    return {
      rank: 3, // HandRank.FOUR_OF_A_KIND
      description: `Four ${quadRank}s`,
      bestCards: sorted,
      tiebreakers: [RANK_VALUES[quadRank as PokerRank], RANK_VALUES[kicker as PokerRank]]
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = findRankWithCount(rankCounts, 3);
    const pairRank = findRankWithCount(rankCounts, 2);
    return {
      rank: 4, // HandRank.FULL_HOUSE
      description: `Full House, ${tripRank}s over ${pairRank}s`,
      bestCards: sorted,
      tiebreakers: [RANK_VALUES[tripRank as PokerRank], RANK_VALUES[pairRank as PokerRank]]
    };
  }

  // Flush
  if (isFlush) {
    return {
      rank: 5, // HandRank.FLUSH
      description: `Flush, ${sorted[0].rank} high`,
      bestCards: sorted,
      tiebreakers: sorted.map(c => RANK_VALUES[c.rank])
    };
  }

  // Straight
  if (isStraight) {
    return {
      rank: 6, // HandRank.STRAIGHT
      description: `Straight, ${sorted[0].rank} high`,
      bestCards: sorted,
      tiebreakers: [straightHigh]
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const tripRank = findRankWithCount(rankCounts, 3);
    const kickers = sorted
      .filter(c => c.rank !== tripRank)
      .map(c => RANK_VALUES[c.rank]);
    return {
      rank: 7, // HandRank.THREE_OF_A_KIND
      description: `Three ${tripRank}s`,
      bestCards: sorted,
      tiebreakers: [RANK_VALUES[tripRank as PokerRank], ...kickers]
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Array.from(rankCounts.entries())
      .filter(([_, count]) => count === 2)
      .map(([rank, _]) => rank)
      .sort((a, b) => RANK_VALUES[b as PokerRank] - RANK_VALUES[a as PokerRank]);
    const kicker = findRankWithCount(rankCounts, 1);
    return {
      rank: 8, // HandRank.TWO_PAIR
      description: `Two Pair, ${pairs[0]}s and ${pairs[1]}s`,
      bestCards: sorted,
      tiebreakers: [
        RANK_VALUES[pairs[0] as PokerRank],
        RANK_VALUES[pairs[1] as PokerRank],
        RANK_VALUES[kicker as PokerRank]
      ]
    };
  }

  // One Pair
  if (counts[0] === 2) {
    const pairRank = findRankWithCount(rankCounts, 2);
    const kickers = sorted
      .filter(c => c.rank !== pairRank)
      .map(c => RANK_VALUES[c.rank]);
    return {
      rank: 9, // HandRank.ONE_PAIR
      description: `Pair of ${pairRank}s`,
      bestCards: sorted,
      tiebreakers: [RANK_VALUES[pairRank as PokerRank], ...kickers]
    };
  }

  // High Card
  return {
    rank: 10, // HandRank.HIGH_CARD
    description: `High PokerCard ${sorted[0].rank}`,
    bestCards: sorted,
    tiebreakers: sorted.map(c => RANK_VALUES[c.rank])
  };
}

/**
 * Find the best 5-card hand from 7 cards (Texas Hold'em)
 */
export function findBestHand(cards: PokerCard[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to evaluate');
  }

  if (cards.length === 5) {
    return evaluateHand(cards);
  }

  // Generate all 5-card combinations
  const combinations = getCombinations(cards, 5);
  let bestHand: HandEvaluation | null = null;

  for (const combo of combinations) {
    const evaluation = evaluateHand(combo);

    if (!bestHand || compareHands(evaluation, bestHand) < 0) {
      bestHand = evaluation;
    }
  }

  return bestHand!;
}

/**
 * Compare two hands (-1 if hand1 wins, 1 if hand2 wins, 0 if tie)
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // Lower rank number = better hand
  if (hand1.rank < hand2.rank) return -1;
  if (hand1.rank > hand2.rank) return 1;

  // Same rank, compare tiebreakers
  for (let i = 0; i < Math.max(hand1.tiebreakers.length, hand2.tiebreakers.length); i++) {
    const val1 = hand1.tiebreakers[i] || 0;
    const val2 = hand2.tiebreakers[i] || 0;

    if (val1 > val2) return -1;
    if (val1 < val2) return 1;
  }

  return 0; // Exact tie
}

/**
 * Check if cards form a straight
 */
function checkStraight(sorted: PokerCard[]): { isStraight: boolean; highCard: number } {
  const values = sorted.map(c => RANK_VALUES[c.rank]);

  // Check regular straight
  let isRegularStraight = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isRegularStraight = false;
      break;
    }
  }

  if (isRegularStraight) {
    return { isStraight: true, highCard: values[0] };
  }

  // Check A-2-3-4-5 (wheel)
  if (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    return { isStraight: true, highCard: 5 }; // In wheel, 5 is high
  }

  return { isStraight: false, highCard: 0 };
}

/**
 * Count occurrences of each rank
 */
function countRanks(cards: PokerCard[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }

  return counts;
}

/**
 * Find rank that appears exactly count times
 */
function findRankWithCount(rankCounts: Map<string, number>, count: number): string {
  for (const [rank, rankCount] of rankCounts) {
    if (rankCount === count) {
      return rank;
    }
  }
  return '2'; // Fallback
}

/**
 * Generate all k-combinations from array
 */
function getCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];

  function combine(start: number, combo: T[]) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }

    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

/**
 * Create a standard 52-card deck
 */
export function createDeck(): PokerCard[] {
  const suits: PokerSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: PokerRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const deck: PokerCard[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Shuffle a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: PokerCard[]): PokerCard[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Deal cards from deck
 */
export function dealCards(deck: PokerCard[], count: number): { dealt: PokerCard[]; remaining: PokerCard[] } {
  if (count > deck.length) {
    throw new Error('Not enough cards in deck');
  }

  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);

  return { dealt, remaining };
}

/**
 * Format hand for display
 */
export function formatHand(cards: PokerCard[]): string {
  return cards.map(c => `${c.rank}${getSuitSymbol(c.suit)}`).join(' ');
}

/**
 * Get suit symbol
 */
function getSuitSymbol(suit: any): string {
  const symbols: Record<PokerSuit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  return symbols[suit];
}

/**
 * Determine winners from multiple hands
 */
export function determineWinners(
  hands: Array<{ playerId: string; cards: PokerCard[] }>
): { winners: string[]; winningHand: HandEvaluation } {
  if (hands.length === 0) {
    throw new Error('No hands to evaluate');
  }

  const evaluations = hands.map(h => ({
    playerId: h.playerId,
    evaluation: findBestHand(h.cards)
  }));

  // Find best hand
  let bestEval = evaluations[0];
  for (let i = 1; i < evaluations.length; i++) {
    if (compareHands(evaluations[i].evaluation, bestEval.evaluation) < 0) {
      bestEval = evaluations[i];
    }
  }

  // Find all players with equally good hands
  const winners = evaluations
    .filter(e => compareHands(e.evaluation, bestEval.evaluation) === 0)
    .map(e => e.playerId);

  return {
    winners,
    winningHand: bestEval.evaluation
  };
}

export const HandEvaluatorService = {
  evaluateHand,
  findBestHand,
  compareHands,
  createDeck,
  shuffleDeck,
  dealCards,
  formatHand,
  determineWinners
};
