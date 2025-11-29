/**
 * Card and Hand Mock Data Generators
 *
 * Generate realistic mock card and hand data for testing
 */

import { Card, Suit, Rank, HandRank } from '../types/destinyDeck.types';
import { shuffleDeck } from '../utils/destinyDeck.utils';

/**
 * Generates a mock card
 */
export function mockCard(suit?: Suit, rank?: Rank): Card {
  return {
    suit: suit || getRandomSuit(),
    rank: rank || getRandomRank()
  };
}

/**
 * Generates an array of mock cards
 */
export function mockCards(count: number): Card[] {
  return Array.from({ length: count }, () => mockCard());
}

/**
 * Generates a random suit
 */
export function getRandomSuit(): Suit {
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  return suits[Math.floor(Math.random() * suits.length)];
}

/**
 * Gets a random rank
 */
export function getRandomRank(): Rank {
  const ranks = [
    Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
  ];
  return ranks[Math.floor(Math.random() * ranks.length)];
}

/**
 * Generates a random 5-card hand
 */
export function mockHand(): Card[] {
  const deck = shuffleDeck();
  return deck.slice(0, 5);
}

/**
 * Generates a Royal Flush (A-K-Q-J-10 of same suit)
 */
export function mockRoyalFlush(suit?: Suit): Card[] {
  const s = suit || getRandomSuit();
  return [
    { suit: s, rank: Rank.ACE },
    { suit: s, rank: Rank.KING },
    { suit: s, rank: Rank.QUEEN },
    { suit: s, rank: Rank.JACK },
    { suit: s, rank: Rank.TEN }
  ];
}

/**
 * Generates a Straight Flush
 */
export function mockStraightFlush(suit?: Suit, highCard?: Rank): Card[] {
  const s = suit || getRandomSuit();
  const high = highCard || Rank.NINE;

  if (high < Rank.SIX) {
    throw new Error('High card for straight flush must be at least 6');
  }

  return [
    { suit: s, rank: high },
    { suit: s, rank: (high - 1) as Rank },
    { suit: s, rank: (high - 2) as Rank },
    { suit: s, rank: (high - 3) as Rank },
    { suit: s, rank: (high - 4) as Rank }
  ];
}

/**
 * Generates Four of a Kind
 */
export function mockFourOfAKind(rank?: Rank): Card[] {
  const r = rank || Rank.EIGHT;
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  const kickerRank = r === Rank.ACE ? Rank.KING : (r + 1) as Rank;

  return [
    { suit: suits[0], rank: r },
    { suit: suits[1], rank: r },
    { suit: suits[2], rank: r },
    { suit: suits[3], rank: r },
    { suit: suits[0], rank: kickerRank }
  ];
}

/**
 * Generates a Full House
 */
export function mockFullHouse(tripRank?: Rank, pairRank?: Rank): Card[] {
  const trip = tripRank || Rank.TEN;
  const pair = pairRank || Rank.FIVE;

  if (trip === pair) {
    throw new Error('Triple and pair ranks must be different');
  }

  return [
    { suit: Suit.SPADES, rank: trip },
    { suit: Suit.HEARTS, rank: trip },
    { suit: Suit.CLUBS, rank: trip },
    { suit: Suit.DIAMONDS, rank: pair },
    { suit: Suit.SPADES, rank: pair }
  ];
}

/**
 * Generates a Flush
 */
export function mockFlush(suit?: Suit): Card[] {
  const s = suit || getRandomSuit();
  const ranks = [Rank.ACE, Rank.JACK, Rank.NINE, Rank.SEVEN, Rank.THREE];

  return ranks.map(rank => ({ suit: s, rank }));
}

/**
 * Generates a Straight
 */
export function mockStraight(highCard?: Rank): Card[] {
  const high = highCard || Rank.TEN;

  if (high < Rank.SIX) {
    throw new Error('High card for straight must be at least 6');
  }

  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS, Suit.SPADES];

  return [
    { suit: suits[0], rank: high },
    { suit: suits[1], rank: (high - 1) as Rank },
    { suit: suits[2], rank: (high - 2) as Rank },
    { suit: suits[3], rank: (high - 3) as Rank },
    { suit: suits[4], rank: (high - 4) as Rank }
  ];
}

/**
 * Generates Three of a Kind
 */
export function mockThreeOfAKind(rank?: Rank): Card[] {
  const r = rank || Rank.SEVEN;

  return [
    { suit: Suit.SPADES, rank: r },
    { suit: Suit.HEARTS, rank: r },
    { suit: Suit.CLUBS, rank: r },
    { suit: Suit.DIAMONDS, rank: Rank.KING },
    { suit: Suit.SPADES, rank: Rank.FOUR }
  ];
}

/**
 * Generates Two Pair
 */
export function mockTwoPair(highPair?: Rank, lowPair?: Rank): Card[] {
  const high = highPair || Rank.QUEEN;
  const low = lowPair || Rank.EIGHT;

  if (high === low) {
    throw new Error('Pair ranks must be different');
  }

  return [
    { suit: Suit.SPADES, rank: high },
    { suit: Suit.HEARTS, rank: high },
    { suit: Suit.CLUBS, rank: low },
    { suit: Suit.DIAMONDS, rank: low },
    { suit: Suit.SPADES, rank: Rank.FIVE }
  ];
}

/**
 * Generates a Pair
 */
export function mockPair(rank?: Rank): Card[] {
  const r = rank || Rank.JACK;

  return [
    { suit: Suit.SPADES, rank: r },
    { suit: Suit.HEARTS, rank: r },
    { suit: Suit.CLUBS, rank: Rank.ACE },
    { suit: Suit.DIAMONDS, rank: Rank.NINE },
    { suit: Suit.SPADES, rank: Rank.THREE }
  ];
}

/**
 * Generates a High Card hand (no pairs or better)
 */
export function mockHighCard(): Card[] {
  return [
    { suit: Suit.SPADES, rank: Rank.ACE },
    { suit: Suit.HEARTS, rank: Rank.KING },
    { suit: Suit.CLUBS, rank: Rank.NINE },
    { suit: Suit.DIAMONDS, rank: Rank.SIX },
    { suit: Suit.SPADES, rank: Rank.THREE }
  ];
}

/**
 * Generates a hand of a specific rank
 */
export function mockHandByRank(handRank: HandRank): Card[] {
  switch (handRank) {
    case HandRank.ROYAL_FLUSH:
      return mockRoyalFlush();
    case HandRank.STRAIGHT_FLUSH:
      return mockStraightFlush();
    case HandRank.FOUR_OF_A_KIND:
      return mockFourOfAKind();
    case HandRank.FULL_HOUSE:
      return mockFullHouse();
    case HandRank.FLUSH:
      return mockFlush();
    case HandRank.STRAIGHT:
      return mockStraight();
    case HandRank.THREE_OF_A_KIND:
      return mockThreeOfAKind();
    case HandRank.TWO_PAIR:
      return mockTwoPair();
    case HandRank.PAIR:
      return mockPair();
    case HandRank.HIGH_CARD:
      return mockHighCard();
    default:
      throw new Error(`Unknown hand rank: ${handRank}`);
  }
}
