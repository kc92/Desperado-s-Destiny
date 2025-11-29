/**
 * Destiny Deck Utilities - Poker Hand Evaluation and Deck Management
 *
 * Core game mechanic utilities for evaluating poker hands and managing decks
 */

import { Card, Suit, Rank, HandRank, HandEvaluation } from '../types/destinyDeck.types';

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const ranks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck?: Card[]): Card[] {
  const shuffled = deck ? [...deck] : createDeck();

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Draws cards from a deck
 */
export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  if (count > deck.length) {
    throw new Error(`Cannot draw ${count} cards from deck of ${deck.length}`);
  }

  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);

  return { drawn, remaining };
}

/**
 * Sorts cards by rank (descending)
 */
function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.rank - a.rank);
}

/**
 * Groups cards by rank
 */
function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();

  for (const card of cards) {
    const existing = groups.get(card.rank) || [];
    groups.set(card.rank, [...existing, card]);
  }

  return groups;
}

/**
 * Checks if cards form a flush (all same suit)
 */
function isFlush(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  const firstSuit = cards[0].suit;
  return cards.every(card => card.suit === firstSuit);
}

/**
 * Checks if cards form a straight (consecutive ranks)
 * Handles both regular straights and Ace-low straights (A-2-3-4-5)
 */
function isStraight(cards: Card[]): { isStraight: boolean; highCard: Rank } {
  if (cards.length < 5) return { isStraight: false, highCard: cards[0]?.rank };

  const sorted = sortByRank(cards);
  const ranks = sorted.map(c => c.rank);

  // Check for regular straight
  let isRegularStraight = true;
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] - ranks[i + 1] !== 1) {
      isRegularStraight = false;
      break;
    }
  }

  if (isRegularStraight) {
    return { isStraight: true, highCard: ranks[0] };
  }

  // Check for Ace-low straight (A-2-3-4-5)
  if (ranks[0] === Rank.ACE && ranks[1] === Rank.FIVE && ranks[2] === Rank.FOUR &&
      ranks[3] === Rank.THREE && ranks[4] === Rank.TWO) {
    return { isStraight: true, highCard: Rank.FIVE }; // In Ace-low straight, 5 is high
  }

  return { isStraight: false, highCard: ranks[0] };
}

/**
 * Evaluates a poker hand and returns detailed evaluation
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error(`Hand must contain exactly 5 cards, got ${cards.length}`);
  }

  const sorted = sortByRank(cards);
  const groups = groupByRank(sorted);
  const groupSizes = Array.from(groups.values())
    .map(g => g.length)
    .sort((a, b) => b - a);

  const flush = isFlush(sorted);
  const straight = isStraight(sorted);

  // Royal Flush: A-K-Q-J-10 of same suit
  if (flush && straight.isStraight && straight.highCard === Rank.ACE) {
    return {
      rank: HandRank.ROYAL_FLUSH,
      score: 10_000_000,
      description: 'Royal Flush',
      primaryCards: sorted,
      kickers: []
    };
  }

  // Straight Flush: Five consecutive cards of same suit
  if (flush && straight.isStraight) {
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      score: 9_000_000 + straight.highCard,
      description: `Straight Flush, ${getRankName(straight.highCard)} high`,
      primaryCards: sorted,
      kickers: []
    };
  }

  // Four of a Kind: Four cards of same rank
  if (groupSizes[0] === 4) {
    const quadGroup = Array.from(groups.values()).find(g => g.length === 4)!;
    const kicker = Array.from(groups.values()).find(g => g.length === 1)!;
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      score: 8_000_000 + quadGroup[0].rank * 100 + kicker[0].rank,
      description: `Four ${getRankName(quadGroup[0].rank)}s`,
      primaryCards: quadGroup,
      kickers: kicker
    };
  }

  // Full House: Three of a kind + pair
  if (groupSizes[0] === 3 && groupSizes[1] === 2) {
    const tripGroup = Array.from(groups.values()).find(g => g.length === 3)!;
    const pairGroup = Array.from(groups.values()).find(g => g.length === 2)!;
    return {
      rank: HandRank.FULL_HOUSE,
      score: 7_000_000 + tripGroup[0].rank * 100 + pairGroup[0].rank,
      description: `Full House, ${getRankName(tripGroup[0].rank)}s over ${getRankName(pairGroup[0].rank)}s`,
      primaryCards: [...tripGroup, ...pairGroup],
      kickers: []
    };
  }

  // Flush: Five cards of same suit
  if (flush) {
    const score = 6_000_000 + sorted[0].rank * 10000 + sorted[1].rank * 1000 +
                  sorted[2].rank * 100 + sorted[3].rank * 10 + sorted[4].rank;
    return {
      rank: HandRank.FLUSH,
      score,
      description: `Flush, ${getRankName(sorted[0].rank)} high`,
      primaryCards: sorted,
      kickers: []
    };
  }

  // Straight: Five consecutive cards
  if (straight.isStraight) {
    return {
      rank: HandRank.STRAIGHT,
      score: 5_000_000 + straight.highCard,
      description: `Straight, ${getRankName(straight.highCard)} high`,
      primaryCards: sorted,
      kickers: []
    };
  }

  // Three of a Kind: Three cards of same rank
  if (groupSizes[0] === 3) {
    const tripGroup = Array.from(groups.values()).find(g => g.length === 3)!;
    const kickers = sorted.filter(c => c.rank !== tripGroup[0].rank);
    return {
      rank: HandRank.THREE_OF_A_KIND,
      score: 4_000_000 + tripGroup[0].rank * 100000 + kickers[0].rank * 1000 + kickers[1].rank,
      description: `Three ${getRankName(tripGroup[0].rank)}s`,
      primaryCards: tripGroup,
      kickers
    };
  }

  // Two Pair: Two different pairs
  if (groupSizes[0] === 2 && groupSizes[1] === 2) {
    const pairs = Array.from(groups.values()).filter(g => g.length === 2);
    const sortedPairs = pairs.sort((a, b) => b[0].rank - a[0].rank);
    const kicker = sorted.find(c => c.rank !== sortedPairs[0][0].rank && c.rank !== sortedPairs[1][0].rank)!;
    return {
      rank: HandRank.TWO_PAIR,
      score: 3_000_000 + sortedPairs[0][0].rank * 100000 + sortedPairs[1][0].rank * 1000 + kicker.rank,
      description: `Two Pair, ${getRankName(sortedPairs[0][0].rank)}s and ${getRankName(sortedPairs[1][0].rank)}s`,
      primaryCards: [...sortedPairs[0], ...sortedPairs[1]],
      kickers: [kicker]
    };
  }

  // Pair: Two cards of same rank
  if (groupSizes[0] === 2) {
    const pairGroup = Array.from(groups.values()).find(g => g.length === 2)!;
    const kickers = sorted.filter(c => c.rank !== pairGroup[0].rank);
    return {
      rank: HandRank.PAIR,
      score: 2_000_000 + pairGroup[0].rank * 100000 +
             kickers[0].rank * 10000 + kickers[1].rank * 100 + kickers[2].rank,
      description: `Pair of ${getRankName(pairGroup[0].rank)}s`,
      primaryCards: pairGroup,
      kickers
    };
  }

  // High Card: No matching cards
  return {
    rank: HandRank.HIGH_CARD,
    score: 1_000_000 + sorted[0].rank * 10000 + sorted[1].rank * 1000 +
           sorted[2].rank * 100 + sorted[3].rank * 10 + sorted[4].rank,
    description: `High Card, ${getRankName(sorted[0].rank)}`,
    primaryCards: [sorted[0]],
    kickers: sorted.slice(1)
  };
}

/**
 * Compares two hands and returns -1, 0, or 1
 * -1 if hand1 loses, 0 if tie, 1 if hand1 wins
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  if (hand1.score > hand2.score) return 1;
  if (hand1.score < hand2.score) return -1;
  return 0;
}

/**
 * Gets the display name for a rank
 */
export function getRankName(rank: Rank): string {
  const names: Record<Rank, string> = {
    [Rank.TWO]: '2',
    [Rank.THREE]: '3',
    [Rank.FOUR]: '4',
    [Rank.FIVE]: '5',
    [Rank.SIX]: '6',
    [Rank.SEVEN]: '7',
    [Rank.EIGHT]: '8',
    [Rank.NINE]: '9',
    [Rank.TEN]: '10',
    [Rank.JACK]: 'Jack',
    [Rank.QUEEN]: 'Queen',
    [Rank.KING]: 'King',
    [Rank.ACE]: 'Ace'
  };
  return names[rank];
}

/**
 * Gets the display name for a suit
 */
export function getSuitName(suit: Suit): string {
  const names: Record<Suit, string> = {
    [Suit.SPADES]: 'Spades',
    [Suit.HEARTS]: 'Hearts',
    [Suit.CLUBS]: 'Clubs',
    [Suit.DIAMONDS]: 'Diamonds'
  };
  return names[suit];
}

/**
 * Gets the symbol for a suit
 */
export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    [Suit.SPADES]: '♠',
    [Suit.HEARTS]: '♥',
    [Suit.CLUBS]: '♣',
    [Suit.DIAMONDS]: '♦'
  };
  return symbols[suit];
}

/**
 * Formats a card for display (e.g., "A♠", "10♥")
 */
export function formatCard(card: Card): string {
  const rankSymbol = card.rank === Rank.ACE ? 'A' :
                     card.rank === Rank.KING ? 'K' :
                     card.rank === Rank.QUEEN ? 'Q' :
                     card.rank === Rank.JACK ? 'J' :
                     card.rank.toString();
  return `${rankSymbol}${getSuitSymbol(card.suit)}`;
}

/**
 * Formats a hand for display (e.g., "A♠ K♠ Q♠ J♠ 10♠")
 */
export function formatHand(cards: Card[]): string {
  return cards.map(formatCard).join(' ');
}
