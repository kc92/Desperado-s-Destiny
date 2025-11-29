/**
 * Destiny Deck Utilities Tests
 *
 * Comprehensive tests for poker hand evaluation and deck management
 */

import {
  createDeck,
  shuffleDeck,
  drawCards,
  evaluateHand,
  compareHands,
  getRankName,
  getSuitName,
  getSuitSymbol,
  formatCard,
  formatHand
} from './destinyDeck.utils';
import { Suit, Rank, HandRank, Card } from '../types/destinyDeck.types';
import {
  mockRoyalFlush,
  mockStraightFlush,
  mockFourOfAKind,
  mockFullHouse,
  mockFlush,
  mockStraight,
  mockThreeOfAKind,
  mockTwoPair,
  mockPair,
  mockHighCard
} from '../mocks/card.mocks';

describe('Destiny Deck Utilities', () => {
  describe('createDeck', () => {
    it('should create a standard 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have 13 cards of each suit', () => {
      const deck = createDeck();
      const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];

      suits.forEach(suit => {
        const cardsOfSuit = deck.filter(card => card.suit === suit);
        expect(cardsOfSuit).toHaveLength(13);
      });
    });

    it('should have 4 cards of each rank', () => {
      const deck = createDeck();
      const ranks = [
        Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
        Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
      ];

      ranks.forEach(rank => {
        const cardsOfRank = deck.filter(card => card.rank === rank);
        expect(cardsOfRank).toHaveLength(4);
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle a deck without losing cards', () => {
      const original = createDeck();
      const shuffled = shuffleDeck(original);

      expect(shuffled).toHaveLength(52);
    });

    it('should create a new shuffled deck when no deck provided', () => {
      const shuffled = shuffleDeck();
      expect(shuffled).toHaveLength(52);
    });

    it('should produce different order (statistically)', () => {
      const original = createDeck();
      const shuffled = shuffleDeck(original);

      // Not a perfect test, but shuffling should change some positions
      const identicalPositions = shuffled.filter((card, i) =>
        card.suit === original[i].suit && card.rank === original[i].rank
      );

      // Very unlikely that more than half the cards stay in same position
      expect(identicalPositions.length).toBeLessThan(26);
    });
  });

  describe('drawCards', () => {
    it('should draw the correct number of cards', () => {
      const deck = createDeck();
      const { drawn, remaining } = drawCards(deck, 5);

      expect(drawn).toHaveLength(5);
      expect(remaining).toHaveLength(47);
    });

    it('should draw cards from the top of the deck', () => {
      const deck = createDeck();
      const { drawn } = drawCards(deck, 3);

      expect(drawn[0]).toEqual(deck[0]);
      expect(drawn[1]).toEqual(deck[1]);
      expect(drawn[2]).toEqual(deck[2]);
    });

    it('should throw error when drawing more cards than available', () => {
      const deck = createDeck();
      expect(() => drawCards(deck, 53)).toThrow();
    });
  });

  describe('evaluateHand - Royal Flush', () => {
    it('should correctly identify a Royal Flush', () => {
      const hand = mockRoyalFlush(Suit.SPADES);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.description).toBe('Royal Flush');
    });

    it('should work with any suit', () => {
      const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];

      suits.forEach(suit => {
        const hand = mockRoyalFlush(suit);
        const evaluation = evaluateHand(hand);
        expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      });
    });
  });

  describe('evaluateHand - Straight Flush', () => {
    it('should correctly identify a Straight Flush', () => {
      const hand = mockStraightFlush(Suit.HEARTS, Rank.NINE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.description).toContain('Straight Flush');
    });

    it('should distinguish from Royal Flush', () => {
      const hand = mockStraightFlush(Suit.CLUBS, Rank.KING);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.rank).not.toBe(HandRank.ROYAL_FLUSH);
    });
  });

  describe('evaluateHand - Four of a Kind', () => {
    it('should correctly identify Four of a Kind', () => {
      const hand = mockFourOfAKind(Rank.EIGHT);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.description).toContain('Four');
    });

    it('should include the quad cards in primaryCards', () => {
      const hand = mockFourOfAKind(Rank.JACK);
      const evaluation = evaluateHand(hand);

      expect(evaluation.primaryCards).toHaveLength(4);
      expect(evaluation.primaryCards.every(c => c.rank === Rank.JACK)).toBe(true);
    });
  });

  describe('evaluateHand - Full House', () => {
    it('should correctly identify a Full House', () => {
      const hand = mockFullHouse(Rank.TEN, Rank.FIVE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.description).toContain('Full House');
    });

    it('should describe the triple and pair', () => {
      const hand = mockFullHouse(Rank.KING, Rank.SEVEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.description).toContain('King');
      expect(evaluation.description).toContain('7');
    });
  });

  describe('evaluateHand - Flush', () => {
    it('should correctly identify a Flush', () => {
      const hand = mockFlush(Suit.DIAMONDS);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.description).toContain('Flush');
    });

    it('should not confuse Flush with Straight Flush', () => {
      const hand: Card[] = [
        { suit: Suit.HEARTS, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.JACK },
        { suit: Suit.HEARTS, rank: Rank.NINE },
        { suit: Suit.HEARTS, rank: Rank.SEVEN },
        { suit: Suit.HEARTS, rank: Rank.THREE }
      ];
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.rank).not.toBe(HandRank.STRAIGHT_FLUSH);
    });
  });

  describe('evaluateHand - Straight', () => {
    it('should correctly identify a Straight', () => {
      const hand = mockStraight(Rank.TEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.description).toContain('Straight');
    });

    it('should handle Ace-low straight (A-2-3-4-5)', () => {
      const hand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.TWO },
        { suit: Suit.CLUBS, rank: Rank.THREE },
        { suit: Suit.DIAMONDS, rank: Rank.FOUR },
        { suit: Suit.SPADES, rank: Rank.FIVE }
      ];
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.description).toContain('5 high');
    });
  });

  describe('evaluateHand - Three of a Kind', () => {
    it('should correctly identify Three of a Kind', () => {
      const hand = mockThreeOfAKind(Rank.SEVEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.description).toContain('Three');
    });

    it('should include kickers', () => {
      const hand = mockThreeOfAKind(Rank.NINE);
      const evaluation = evaluateHand(hand);

      expect(evaluation.kickers).toHaveLength(2);
    });
  });

  describe('evaluateHand - Two Pair', () => {
    it('should correctly identify Two Pair', () => {
      const hand = mockTwoPair(Rank.QUEEN, Rank.EIGHT);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.description).toContain('Two Pair');
    });

    it('should include both pairs in primaryCards', () => {
      const hand = mockTwoPair(Rank.JACK, Rank.SIX);
      const evaluation = evaluateHand(hand);

      expect(evaluation.primaryCards).toHaveLength(4);
    });

    it('should include one kicker', () => {
      const hand = mockTwoPair(Rank.ACE, Rank.KING);
      const evaluation = evaluateHand(hand);

      expect(evaluation.kickers).toHaveLength(1);
    });
  });

  describe('evaluateHand - Pair', () => {
    it('should correctly identify a Pair', () => {
      const hand = mockPair(Rank.JACK);
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.description).toContain('Pair');
    });

    it('should include three kickers', () => {
      const hand = mockPair(Rank.TEN);
      const evaluation = evaluateHand(hand);

      expect(evaluation.kickers).toHaveLength(3);
    });
  });

  describe('evaluateHand - High Card', () => {
    it('should correctly identify High Card', () => {
      const hand = mockHighCard();
      const evaluation = evaluateHand(hand);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.description).toContain('High Card');
    });

    it('should include four kickers', () => {
      const hand = mockHighCard();
      const evaluation = evaluateHand(hand);

      expect(evaluation.kickers).toHaveLength(4);
    });
  });

  describe('evaluateHand - validation', () => {
    it('should throw error for hands with fewer than 5 cards', () => {
      const hand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING }
      ];

      expect(() => evaluateHand(hand)).toThrow();
    });

    it('should throw error for hands with more than 5 cards', () => {
      const hand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.CLUBS, rank: Rank.QUEEN },
        { suit: Suit.DIAMONDS, rank: Rank.JACK },
        { suit: Suit.SPADES, rank: Rank.TEN },
        { suit: Suit.HEARTS, rank: Rank.NINE }
      ];

      expect(() => evaluateHand(hand)).toThrow();
    });
  });

  describe('compareHands', () => {
    it('should return 1 when first hand wins', () => {
      const royalFlush = evaluateHand(mockRoyalFlush());
      const pair = evaluateHand(mockPair());

      expect(compareHands(royalFlush, pair)).toBe(1);
    });

    it('should return -1 when second hand wins', () => {
      const highCard = evaluateHand(mockHighCard());
      const fullHouse = evaluateHand(mockFullHouse());

      expect(compareHands(highCard, fullHouse)).toBe(-1);
    });

    it('should return 0 for identical hands', () => {
      const hand = mockPair(Rank.KING);
      const eval1 = evaluateHand(hand);
      const eval2 = evaluateHand(hand);

      expect(compareHands(eval1, eval2)).toBe(0);
    });

    it('should properly rank all hand types', () => {
      const hands = [
        evaluateHand(mockHighCard()),
        evaluateHand(mockPair()),
        evaluateHand(mockTwoPair()),
        evaluateHand(mockThreeOfAKind()),
        evaluateHand(mockStraight()),
        evaluateHand(mockFlush()),
        evaluateHand(mockFullHouse()),
        evaluateHand(mockFourOfAKind()),
        evaluateHand(mockStraightFlush()),
        evaluateHand(mockRoyalFlush())
      ];

      // Verify hand ranks are in ascending order
      for (let i = 0; i < hands.length - 1; i++) {
        expect(hands[i].rank).toBeLessThan(hands[i + 1].rank);
      }

      // Each hand should beat all hands before it
      for (let i = 0; i < hands.length - 1; i++) {
        for (let j = i + 1; j < hands.length; j++) {
          const result = compareHands(hands[j], hands[i]);
          expect(result).toBe(1);
          expect(compareHands(hands[i], hands[j])).toBe(-1);
        }
      }
    });
  });

  describe('getRankName', () => {
    it('should return correct names for numbered cards', () => {
      expect(getRankName(Rank.TWO)).toBe('2');
      expect(getRankName(Rank.FIVE)).toBe('5');
      expect(getRankName(Rank.TEN)).toBe('10');
    });

    it('should return correct names for face cards', () => {
      expect(getRankName(Rank.JACK)).toBe('Jack');
      expect(getRankName(Rank.QUEEN)).toBe('Queen');
      expect(getRankName(Rank.KING)).toBe('King');
      expect(getRankName(Rank.ACE)).toBe('Ace');
    });
  });

  describe('getSuitName', () => {
    it('should return correct suit names', () => {
      expect(getSuitName(Suit.SPADES)).toBe('Spades');
      expect(getSuitName(Suit.HEARTS)).toBe('Hearts');
      expect(getSuitName(Suit.CLUBS)).toBe('Clubs');
      expect(getSuitName(Suit.DIAMONDS)).toBe('Diamonds');
    });
  });

  describe('getSuitSymbol', () => {
    it('should return correct suit symbols', () => {
      expect(getSuitSymbol(Suit.SPADES)).toBe('♠');
      expect(getSuitSymbol(Suit.HEARTS)).toBe('♥');
      expect(getSuitSymbol(Suit.CLUBS)).toBe('♣');
      expect(getSuitSymbol(Suit.DIAMONDS)).toBe('♦');
    });
  });

  describe('formatCard', () => {
    it('should format cards correctly', () => {
      expect(formatCard({ suit: Suit.SPADES, rank: Rank.ACE })).toBe('A♠');
      expect(formatCard({ suit: Suit.HEARTS, rank: Rank.KING })).toBe('K♥');
      expect(formatCard({ suit: Suit.CLUBS, rank: Rank.TEN })).toBe('10♣');
      expect(formatCard({ suit: Suit.DIAMONDS, rank: Rank.FIVE })).toBe('5♦');
    });
  });

  describe('formatHand', () => {
    it('should format a hand correctly', () => {
      const hand: Card[] = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.CLUBS, rank: Rank.QUEEN }
      ];

      expect(formatHand(hand)).toBe('A♠ K♥ Q♣');
    });
  });
});
